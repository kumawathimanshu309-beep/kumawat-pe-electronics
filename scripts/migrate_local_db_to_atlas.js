const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

function redactUri(uri) {
  if (!uri) return 'NONE';
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
}

function hashDocument(doc) {
  const cleanDoc = JSON.parse(JSON.stringify(doc));
  delete cleanDoc.__v;
  const sortKeys = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(sortKeys);
    return Object.keys(obj).sort().reduce((acc, key) => {
      acc[key] = sortKeys(obj[key]);
      return acc;
    }, {});
  };
  const sortedStr = JSON.stringify(sortKeys(cleanDoc));
  return crypto.createHash('sha256').update(sortedStr).digest('hex');
}

async function runLocalToAtlasMigration() {
  console.log('========================================================================================');
  console.log('STANDALONE LOCAL MONGODB -> MONGODB ATLAS FULL DATABASE MIGRATION CLI');
  console.log('========================================================================================\n');

  const localUri = 'mongodb://127.0.0.1:27017/kumawat_pe';

  // Resolve Atlas URI from CLI arg, ATLAS_URI, or MONGODB_URI (must NOT be localhost)

  let rawAtlasUri = process.argv[2] || process.env.ATLAS_URI || process.env.MONGODB_URI;
  if (rawAtlasUri && (rawAtlasUri.includes('127.0.0.1') || rawAtlasUri.includes('localhost'))) {
    rawAtlasUri = null;
  }

  // ---------------------------------------------------------------------------------------
  // STEP 1 — VERIFY LOCAL DATABASE CONNECTION & DOCUMENT COUNTS
  // ---------------------------------------------------------------------------------------
  console.log('STEP 1 — VERIFYING LOCAL DATABASE CONNECTION...');
  console.log(`Local Source URI: ${localUri}`);

  let sourceConn;
  try {
    sourceConn = await mongoose.createConnection(localUri, { serverSelectionTimeoutMS: 5000 }).asPromise();
  } catch (err) {
    console.error('\n❌ MIGRATION NOT RUN — LOCAL MONGODB IS NOT ACCESSIBLE');
    console.error(`Error connecting to local MongoDB at ${localUri}:`, err.message);
    process.exit(1);
  }

  const sourceDb = sourceConn.db;
  console.log(`LOCAL DATABASE\nDatabase: ${sourceDb.databaseName}\n`);

  const localRawCols = await sourceDb.listCollections().toArray();
  const localCollectionNames = localRawCols.map(c => c.name).sort();

  const localStats = {};
  let localTotalDocs = 0;

  console.log('Collection                     Documents');
  console.log('------------------------------------------------');
  for (const colName of localCollectionNames) {
    const docs = await sourceDb.collection(colName).find({}).toArray();
    const count = docs.length;
    localTotalDocs += count;
    localStats[colName] = { count, docs };
    console.log(`${colName.padEnd(30)} ${String(count).padStart(9)}`);
  }
  console.log('------------------------------------------------');
  console.log(`${'TOTAL'.padEnd(30)} ${String(localTotalDocs).padStart(9)}`);

  // ---------------------------------------------------------------------------------------
  // STEP 2 — VERIFY ATLAS DATABASE CONNECTION
  // ---------------------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------------------------------');
  console.log('STEP 2 — VERIFYING ATLAS DATABASE CONNECTION...');

  if (!rawAtlasUri) {
    console.error('\n❌ MIGRATION NOT RUN — ATLAS CONNECTION FAILED');
    console.error('Reason: No remote ATLAS_URI or MONGODB_URI environment variable provided in local .env or command line argument.');
    console.error('Note: .env MONGO_URI points to localhost. To run migration to Atlas, please set ATLAS_URI in .env or pass as argument:');
    console.error('  node scripts/migrate_local_db_to_atlas.js "mongodb+srv://<USER>:<URL_ENCODED_PASS>@cluster...mongodb.net/kumawat_pe?..."');
    await sourceConn.close();
    process.exit(1);
  }

  console.log(`ATLAS DATABASE\nDestination: ${redactUri(rawAtlasUri)}\n`);

  let targetConn;
  try {
    targetConn = await mongoose.createConnection(rawAtlasUri, { serverSelectionTimeoutMS: 15000 }).asPromise();
  } catch (err) {
    console.error('\n❌ MIGRATION NOT RUN — ATLAS CONNECTION FAILED');
    console.error('Error connecting to Atlas:', err.message);
    await sourceConn.close();
    process.exit(1);
  }

  const targetDb = targetConn.db;
  console.log(`Database: ${targetDb.databaseName}\n`);

  const atlasBeforeStats = {};
  let atlasBeforeTotalDocs = 0;

  console.log('Collection                     Documents');
  console.log('------------------------------------------------');
  for (const colName of localCollectionNames) {
    let docs = [];
    try {
      docs = await targetDb.collection(colName).find({}).toArray();
    } catch (e) {}
    const count = docs.length;
    atlasBeforeTotalDocs += count;
    atlasBeforeStats[colName] = { count, docs };
    console.log(`${colName.padEnd(30)} ${String(count).padStart(9)}`);
  }
  console.log('------------------------------------------------');
  console.log(`${'TOTAL'.padEnd(30)} ${String(atlasBeforeTotalDocs).padStart(9)}`);

  // ---------------------------------------------------------------------------------------
  // STEP 3 & 4 — FULL MIGRATION & BULK UPSERT BY ORIGINAL _id
  // ---------------------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------------------------------');
  console.log('STEP 3 & 4 — EXECUTING FULL MIGRATION (PRESERVING ORIGINAL _id & ALL FIELDS)...');

  const migrationResults = {};

  for (const colName of localCollectionNames) {
    const localDocs = localStats[colName].docs;
    const targetCol = targetDb.collection(colName);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const doc of localDocs) {
      try {
        const filter = { _id: doc._id };
        const existing = await targetCol.findOne(filter);
        if (!existing) {
          await targetCol.insertOne(doc);
          inserted++;
        } else {
          await targetCol.replaceOne(filter, doc, { upsert: true });
          updated++;
        }
      } catch (err) {
        console.error(`[ERROR] Collection ${colName} (_id: ${doc._id}):`, err.message);
        errors++;
      }
    }

    migrationResults[colName] = { inserted, updated, errors };
  }

  // ---------------------------------------------------------------------------------------
  // STEP 5 — VERIFY ACTUAL DOCUMENTS & CONTENT MISMATCHES
  // ---------------------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------------------------------');
  console.log('STEP 5 — VERIFYING DOCUMENT ID MATCHES & HASH CONTENT...');

  const verificationTable = [];
  let totalMissing = 0;
  let totalExtra = 0;
  let totalMismatches = 0;

  for (const colName of localCollectionNames) {
    const localDocs = localStats[colName].docs;
    const atlasDocs = await targetDb.collection(colName).find({}).toArray();

    const localMap = new Map(localDocs.map(d => [String(d._id), hashDocument(d)]));
    const atlasMap = new Map(atlasDocs.map(d => [String(d._id), hashDocument(d)]));

    let missing = 0;
    let extra = 0;
    let mismatched = 0;

    for (const [id, localHash] of localMap.entries()) {
      if (!atlasMap.has(id)) {
        missing++;
      } else if (atlasMap.get(id) !== localHash) {
        mismatched++;
      }
    }

    for (const id of atlasMap.keys()) {
      if (!localMap.has(id)) {
        extra++;
      }
    }

    totalMissing += missing;
    totalExtra += extra;
    totalMismatches += mismatched;

    verificationTable.push({
      colName,
      localCount: localDocs.length,
      atlasCount: atlasDocs.length,
      migratedCount: migrationResults[colName].inserted + migrationResults[colName].updated,
      missing,
      extra,
      mismatched
    });
  }

  console.log('\nFINAL MIGRATION & VERIFICATION REPORT TABLE:');
  console.log('COLLECTION                     | LOCAL | ATLAS BEFORE | MIGRATED | ATLAS AFTER | MISSING | EXTRA | MISMATCHES');
  console.log('-----------------------------------------------------------------------------------------------------------');
  for (const r of verificationTable) {
    const beforeCnt = atlasBeforeStats[r.colName].count;
    console.log(
      `${r.colName.padEnd(30)} | ` +
      `${String(r.localCount).padStart(5)} | ` +
      `${String(beforeCnt).padStart(12)} | ` +
      `${String(r.migratedCount).padStart(8)} | ` +
      `${String(r.atlasCount).padStart(11)} | ` +
      `${String(r.missing).padStart(7)} | ` +
      `${String(r.extra).padStart(5)} | ` +
      `${String(r.mismatched).padStart(10)}`
    );
  }
  console.log('-----------------------------------------------------------------------------------------------------------');

  // ---------------------------------------------------------------------------------------
  // STEP 6 — CHECK REFERENCES INTEGRITY
  // ---------------------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------------------------------');
  console.log('STEP 6 — CHECKING RELATIONSHIP REFERENCES...');

  const targetProducts = await targetDb.collection('products').find({}).toArray();
  const targetUsers = await targetDb.collection('users').find({}).toArray();
  const targetOrders = await targetDb.collection('orders').find({}).toArray();
  const targetPayments = await targetDb.collection('paymentrecords').find({}).toArray();
  const targetReviews = await targetDb.collection('reviews').find({}).toArray();

  const userIds = new Set(targetUsers.map(u => u.userId));
  const productIds = new Set(targetProducts.map(p => p.productId));
  const orderIds = new Set(targetOrders.map(o => o.orderId));

  let brokenRefs = 0;
  for (const o of targetOrders) {
    if (o.userId && !userIds.has(o.userId)) {
      console.warn(`[BROKEN REF] Order ${o.orderId} -> missing userId: ${o.userId}`);
      brokenRefs++;
    }
  }
  for (const p of targetPayments) {
    if (p.orderId && !orderIds.has(p.orderId)) {
      console.warn(`[BROKEN REF] Payment ${p.paymentId} -> missing orderId: ${p.orderId}`);
      brokenRefs++;
    }
  }
  for (const r of targetReviews) {
    if (r.productId && !productIds.has(r.productId)) {
      console.warn(`[BROKEN REF] Review ${r._id} -> missing productId: ${r.productId}`);
      brokenRefs++;
    }
  }
  console.log(`Total Broken References: ${brokenRefs}`);

  // ---------------------------------------------------------------------------------------
  // STEP 7 — IMAGE DATA AUDIT
  // ---------------------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------------------------------');
  console.log('STEP 7 — PRODUCT IMAGES AUDIT...');

  let productsWithImages = 0;
  let productsWithoutImages = 0;
  let localAssetImages = 0;
  let externalHttpsImages = 0;
  let brokenAssetImages = 0;
  const publicDir = path.join(process.cwd(), 'public');

  for (const p of targetProducts) {
    if (!p.images || p.images.length === 0) {
      productsWithoutImages++;
    } else {
      productsWithImages++;
      for (const img of p.images) {
        if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
          externalHttpsImages++;
        } else if (typeof img === 'string' && img.startsWith('/')) {
          localAssetImages++;
          if (!fs.existsSync(path.join(publicDir, img))) brokenAssetImages++;
        }
      }
    }
  }

  console.log(`Total Products: ${targetProducts.length}`);
  console.log(`Products With Images: ${productsWithImages}`);
  console.log(`Products Without Images: ${productsWithoutImages}`);
  console.log(`Local Public Asset Images: ${localAssetImages}`);
  console.log(`External HTTPS Images: ${externalHttpsImages}`);
  console.log(`Broken Local Asset Images: ${brokenAssetImages}`);

  // Close database connections
  await sourceConn.close();
  await targetConn.close();

  console.log('\n----------------------------------------------------------------------------------------');
  if (totalMissing > 0 || totalMismatches > 0 || brokenRefs > 0 || brokenAssetImages > 0) {
    console.error('MIGRATION FAILED');
    process.exit(1);
  }

  console.log('MIGRATION VERIFIED SUCCESSFULLY');
  console.log('========================================================================================\n');
}

if (require.main === module) {
  runLocalToAtlasMigration().catch(err => {
    console.error('MIGRATION FAILED:', err.message);
    process.exit(1);
  });
}

module.exports = runLocalToAtlasMigration;
