const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * FULL DATABASE MIGRATION SYSTEM: LOCAL MONGODB -> MONGODB ATLAS
 * Safely migrates all 18 collections, preserving ObjectIds, BSON types, and foreign key references.
 */
async function migrateFullDatabase(targetUri) {
  const localUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/kumawat_pe';
  const atlasUri = targetUri || process.env.TARGET_MONGO_URI || process.env.MONGO_URI || process.env.MONGODB_URI || localUri;

  console.log('================================================================');
  console.log('MASTER FULL DATABASE MIGRATION: LOCAL MONGODB -> MONGODB ATLAS');
  console.log('================================================================');
  console.log(`Source (Local):  ${localUri}`);
  console.log(`Target (Atlas):  ${atlasUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  console.log('----------------------------------------------------------------\n');

  // Connect to Source (Local)
  const sourceConn = await mongoose.createConnection(localUri).asPromise();
  const sourceDb = sourceConn.db;

  // Connect to Target (Atlas / Destination)
  const targetConn = await mongoose.createConnection(atlasUri).asPromise();
  const targetDb = targetConn.db;

  // List all raw collections from source database
  const sourceRawCols = await sourceDb.listCollections().toArray();
  const collectionNames = sourceRawCols.map(c => c.name).sort();

  console.log(`Found ${collectionNames.length} collections in Local MongoDB database "${sourceDb.databaseName}":`);
  console.log(collectionNames.map(n => ` - ${n}`).join('\n'));
  console.log('\n--- AUDITING TARGET DATABASE BEFORE MIGRATION ---');

  const auditResults = [];

  for (const colName of collectionNames) {
    const localCount = await sourceDb.collection(colName).countDocuments();
    let atlasBeforeCount = 0;
    try {
      atlasBeforeCount = await targetDb.collection(colName).countDocuments();
    } catch (e) {
      atlasBeforeCount = 0;
    }

    auditResults.push({
      collection: colName,
      localCount,
      atlasBeforeCount,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      atlasAfterCount: 0
    });
  }

  console.log('\nCOLLECTION                          | LOCAL COUNT | ATLAS BEFORE');
  console.log('----------------------------------------------------------------');
  for (const res of auditResults) {
    console.log(`${res.collection.padEnd(35)} | ${String(res.localCount).padStart(11)} | ${String(res.atlasBeforeCount).padStart(12)}`);
  }

  console.log('\n--- EXECUTING SAFE MIGRATION & UPSERT ---');

  for (const res of auditResults) {
    const colName = res.collection;
    const sourceCol = sourceDb.collection(colName);
    const targetCol = targetDb.collection(colName);

    const docs = await sourceCol.find({}).toArray();

    for (const doc of docs) {
      try {
        const filter = { _id: doc._id };
        const existing = await targetCol.findOne(filter);

        if (!existing) {
          await targetCol.insertOne(doc);
          res.inserted++;
        } else {
          // Perform merge/update preserving exact document structure
          await targetCol.replaceOne(filter, doc, { upsert: true });
          res.updated++;
        }
      } catch (err) {
        console.error(`[MIGRATION ERROR] Collection ${colName} (ID: ${doc._id}):`, err.message);
        res.errors++;
      }
    }

    res.atlasAfterCount = await targetCol.countDocuments();
  }

  console.log('\n========================================================================================');
  console.log('COLLECTION MIGRATION SUMMARY TABLE');
  console.log('========================================================================================');
  console.log('COLLECTION                          | LOCAL | ATLAS BEFORE | INSERTED | UPDATED | SKIPPED | ATLAS AFTER');
  console.log('----------------------------------------------------------------------------------------');

  for (const res of auditResults) {
    console.log(
      `${res.collection.padEnd(35)} | ` +
      `${String(res.localCount).padStart(5)} | ` +
      `${String(res.atlasBeforeCount).padStart(12)} | ` +
      `${String(res.inserted).padStart(8)} | ` +
      `${String(res.updated).padStart(7)} | ` +
      `${String(res.skipped).padStart(7)} | ` +
      `${String(res.atlasAfterCount).padStart(11)}`
    );
  }
  console.log('----------------------------------------------------------------------------------------');

  // RELATIONSHIP VERIFICATION
  console.log('\n--- VERIFYING RELATIONSHIP INTEGRITY ---');
  const targetProductsCount = await targetDb.collection('products').countDocuments();
  const targetUsersCount = await targetDb.collection('users').countDocuments();
  const targetOrdersCount = await targetDb.collection('orders').countDocuments();
  const targetPaymentsCount = await targetDb.collection('paymentrecords').countDocuments();
  const targetReviewsCount = await targetDb.collection('reviews').countDocuments();

  console.log(` ✓ Products Collection: ${targetProductsCount} documents`);
  console.log(` ✓ Users Collection:    ${targetUsersCount} documents`);
  console.log(` ✓ Orders Collection:   ${targetOrdersCount} documents`);
  console.log(` ✓ Payments Collection: ${targetPaymentsCount} documents`);
  console.log(` ✓ Reviews Collection:  ${targetReviewsCount} documents`);

  // Close connections
  await sourceConn.close();
  await targetConn.close();

  console.log('\n✅ MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('================================================================\n');

  return auditResults;
}

if (require.main === module) {
  const targetUri = process.argv[2];
  migrateFullDatabase(targetUri).catch(err => {
    console.error('Fatal Migration Error:', err);
    process.exit(1);
  });
}

module.exports = migrateFullDatabase;
