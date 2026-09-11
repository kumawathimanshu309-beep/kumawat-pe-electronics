const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

function hashDocument(doc) {
  const cleanDoc = JSON.parse(JSON.stringify(doc));
  delete cleanDoc.__v;
  // Sort keys recursively
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

async function runMasterMigration() {
  console.log('========================================================================================');
  console.log('MASTER MONGODB LOCAL -> ATLAS FULL DATABASE MIGRATION & DEEP DATA CONTENT AUDIT');
  console.log('========================================================================================\n');

  const localUri = 'mongodb://127.0.0.1:27017/kumawat_pe';
  const atlasUri = process.argv[2] || process.env.ATLAS_URI || process.env.MONGODB_URI || (process.env.MONGO_URI && !process.env.MONGO_URI.includes('127.0.0.1') && !process.env.MONGO_URI.includes('localhost') ? process.env.MONGO_URI : null);

  // STEP 1 — Inspect LOCAL Database
  console.log('STEP 1 — INSPECTING LOCAL DATABASE...');
  console.log(`Local MongoDB URI: ${localUri}`);

  let sourceConn;
  try {
    sourceConn = await mongoose.createConnection(localUri).asPromise();
  } catch (err) {
    console.error('FATAL: Unable to connect to Local MongoDB at', localUri, err.message);
    process.exit(1);
  }

  const sourceDb = sourceConn.db;
  console.log(`Local Database Name: "${sourceDb.databaseName}"`);

  const localRawCols = await sourceDb.listCollections().toArray();
  const localCollectionNames = localRawCols.map(c => c.name).sort();

  console.log(`Found ${localCollectionNames.length} collections in Local Database:`);

  let localTotalDocs = 0;
  const localStats = {};

  for (const colName of localCollectionNames) {
    const docs = await sourceDb.collection(colName).find({}).toArray();
    const count = docs.length;
    localTotalDocs += count;
    const sampleDoc = docs.length > 0 ? docs[0] : null;
    localStats[colName] = {
      count,
      sampleId: sampleDoc ? String(sampleDoc._id) : 'NONE (Empty Collection)',
      docs
    };
    console.log(` - ${colName.padEnd(30)} | Documents: ${String(count).padStart(5)} | Sample _id: ${localStats[colName].sampleId}`);
  }

  console.log(`\nLocal Database Total Document Count: ${localTotalDocs}`);

  // STEP 2 & STEP 11 — Inspect ATLAS Database
  console.log('\n----------------------------------------------------------------------------------------');
  console.log('STEP 2 & STEP 11 — INSPECTING ATLAS DATABASE CONNECTION...');

  if (!atlasUri || atlasUri.includes('127.0.0.1') || atlasUri.includes('localhost')) {
    console.error('\n❌ [IMPORTANT FAILURE CONDITION TRIGGERED]');
    console.error('Atlas connection is not configured/working.');
    console.error('Reason: No remote ATLAS_URI, MONGODB_URI, or CLI argument provided.');
    console.error('Local database MONGO_URI is mongodb://127.0.0.1:27017/kumawat_pe.');
    console.error('Please pass the Atlas URI via CLI (node scripts/migrate_local_db_to_atlas.js "<ATLAS_URI>") or set process.env.ATLAS_URI / process.env.MONGODB_URI.');

    await sourceConn.close();

    process.exit(1);
  }

  console.log(`Target Atlas URI: ${atlasUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

  let targetConn;
  try {
    targetConn = await mongoose.createConnection(atlasUri).asPromise();
  } catch (err) {
    console.error('\n❌ [IMPORTANT FAILURE CONDITION TRIGGERED]');
    console.error('Atlas connection is not configured/working.');
    console.error('Error connecting to Atlas:', err.message);
    await sourceConn.close();
    process.exit(1);
  }

  const targetDb = targetConn.db;
  console.log(`Atlas Database Name: "${targetDb.databaseName}"`);

  const atlasRawCols = await targetDb.listCollections().toArray();
  const atlasCollectionNames = atlasRawCols.map(c => c.name).sort();

  const atlasBeforeStats = {};
  for (const colName of localCollectionNames) {
    let docs = [];
    try {
      docs = await targetDb.collection(colName).find({}).toArray();
    } catch (e) {}
    atlasBeforeStats[colName] = {
      count: docs.length,
      sampleId: docs.length > 0 ? String(docs[0]._id) : 'NONE (Empty Collection)',
      docs
    };
  }

  console.log('\nLOCAL COUNT vs ATLAS BEFORE COUNT:');
  console.log('COLLECTION NAME                     | LOCAL COUNT | ATLAS BEFORE COUNT | SAMPLE ATLAS _id');
  console.log('----------------------------------------------------------------------------------------');
  for (const colName of localCollectionNames) {
    console.log(
      `${colName.padEnd(35)} | ` +
      `${String(localStats[colName].count).padStart(11)} | ` +
      `${String(atlasBeforeStats[colName].count).padStart(18)} | ` +
      `${atlasBeforeStats[colName].sampleId}`
    );
  }

  // STEP 3 & 4 — FULL MIGRATION & PRESERVE DOCUMENTS EXACTLY
  console.log('\n----------------------------------------------------------------------------------------');
  console.log('STEP 3 & 4 — MIGRATING EVERY COLLECTION (SAFE BULK UPSERT BY _id)...');

  const migrationSummary = {};

  for (const colName of localCollectionNames) {
    const sourceCol = sourceDb.collection(colName);
    const targetCol = targetDb.collection(colName);
    const localDocs = localStats[colName].docs;

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
        console.error(`[ERROR] Migrating doc in ${colName} (_id: ${doc._id}):`, err.message);
        errors++;
      }
    }

    migrationSummary[colName] = { inserted, updated, errors };
  }

  // STEP 5 — VERIFY DATA CONTENT & DEEP HASH COMPARISON
  console.log('\n----------------------------------------------------------------------------------------');
  console.log('STEP 5 — VERIFYING DATA CONTENT & DOCUMENT HASH MATCHES...');

  const verificationResults = [];
  let totalMissing = 0;
  let totalExtra = 0;
  let totalMismatched = 0;

  for (const colName of localCollectionNames) {
    const localDocs = localStats[colName].docs;
    const atlasDocs = await targetDb.collection(colName).find({}).toArray();

    const localMap = new Map(localDocs.map(d => [String(d._id), hashDocument(d)]));
    const atlasMap = new Map(atlasDocs.map(d => [String(d._id), hashDocument(d)]));

    let missingInAtlas = 0;
    let extraInAtlas = 0;
    let mismatchedContent = 0;

    for (const [id, localHash] of localMap.entries()) {
      if (!atlasMap.has(id)) {
        missingInAtlas++;
      } else if (atlasMap.get(id) !== localHash) {
        mismatchedContent++;
      }
    }

    for (const id of atlasMap.keys()) {
      if (!localMap.has(id)) {
        extraInAtlas++;
      }
    }

    totalMissing += missingInAtlas;
    totalExtra += extraInAtlas;
    totalMismatched += mismatchedContent;

    verificationResults.push({
      colName,
      localCount: localDocs.length,
      atlasCount: atlasDocs.length,
      missingInAtlas,
      extraInAtlas,
      mismatchedContent
    });
  }

  console.log('\nFINAL MIGRATION & VERIFICATION TABLE:');
  console.log('COLLECTION                     | LOCAL | ATLAS AFTER | MISSING | EXTRA | MISMATCHED');
  console.log('-----------------------------------------------------------------------------------');
  for (const r of verificationResults) {
    console.log(
      `${r.colName.padEnd(30)} | ` +
      `${String(r.localCount).padStart(5)} | ` +
      `${String(r.atlasCount).padStart(11)} | ` +
      `${String(r.missingInAtlas).padStart(7)} | ` +
      `${String(r.extraInAtlas).padStart(5)} | ` +
      `${String(r.mismatchedContent).padStart(10)}`
    );
  }
  console.log('-----------------------------------------------------------------------------------');

  // STEP 6 — CHECK REFERENCES
  console.log('\n----------------------------------------------------------------------------------------');
  console.log('STEP 6 — CHECKING RELATIONSHIP & REFERENCE INTEGRITY...');

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
      console.warn(`[BROKEN REF] Order ${o.orderId} references missing userId: ${o.userId}`);
      brokenRefs++;
    }
  }

  for (const p of targetPayments) {
    if (p.orderId && !orderIds.has(p.orderId)) {
      console.warn(`[BROKEN REF] Payment ${p.paymentId} references missing orderId: ${p.orderId}`);
      brokenRefs++;
    }
  }

  for (const r of targetReviews) {
    if (r.productId && !productIds.has(r.productId)) {
      console.warn(`[BROKEN REF] Review ${r._id} references missing productId: ${r.productId}`);
      brokenRefs++;
    }
  }

  console.log(`Total Broken References Discovered: ${brokenRefs}`);

  // STEP 7 — PRODUCT IMAGES AUDIT
  console.log('\n----------------------------------------------------------------------------------------');
  console.log('STEP 7 — PRODUCT IMAGES AUDIT...');

  let totalProductsCount = targetProducts.length;
  let productsWithImages = 0;
  let productsWithoutImages = 0;
  let localAssetImages = 0;
  let externalHttpsImages = 0;
  let brokenImages = 0;

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
          if (!fs.existsSync(path.join(publicDir, img))) {
            brokenImages++;
          }
        }
      }
    }
  }

  console.log(`Total Products: ${totalProductsCount}`);
  console.log(`Products With Images: ${productsWithImages}`);
  console.log(`Products Without Images: ${productsWithoutImages}`);
  console.log(`Local Public Asset Images: ${localAssetImages}`);
  console.log(`External HTTPS Images: ${externalHttpsImages}`);
  console.log(`Broken Local Asset Images: ${brokenImages}`);

  // Close connections
  await sourceConn.close();
  await targetConn.close();

  if (totalMissing > 0 || totalMismatched > 0 || brokenRefs > 0 || brokenImages > 0) {
    console.error('\n❌ MIGRATION VERIFICATION FAILED!');
    process.exit(1);
  }

  console.log('\n✅ FULL DATABASE MIGRATION & CONTENT VERIFICATION PASSED 100%!');
  console.log('========================================================================================\n');
}

if (require.main === module) {
  runMasterMigration().catch(err => {
    console.error('Fatal Script Failure:', err);
    process.exit(1);
  });
}

module.exports = runMasterMigration;
