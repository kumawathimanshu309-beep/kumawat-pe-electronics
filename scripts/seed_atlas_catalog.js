const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

async function migrateCatalog(targetUri) {
  const mongoUri = targetUri || process.env.TARGET_MONGO_URI || process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kumawat_pe';
  console.log('====================================================');
  console.log('CATALOG MIGRATION TO MONGODB ATLAS / TARGET DATABASE');
  console.log('====================================================');
  console.log('Connecting to Target Database:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

  await mongoose.connect(mongoUri);

  // BEFORE AUDIT
  const beforeProducts = await Product.find({}).lean();
  const beforeTotal = beforeProducts.length;
  const beforeActive = beforeProducts.filter(p => p.status === 'Active').length;
  const beforeInactive = beforeProducts.filter(p => p.status !== 'Active').length;
  const beforeWithImages = beforeProducts.filter(p => p.images && p.images.length > 0 && p.images.some(img => typeof img === 'string' && img.trim() !== '')).length;
  const beforeWithoutImages = beforeTotal - beforeWithImages;

  console.log('\n--- TARGET DATABASE BEFORE MIGRATION ---');
  console.log(`Total Products: ${beforeTotal}`);
  console.log(`Active Products: ${beforeActive}`);
  console.log(`Inactive Products: ${beforeInactive}`);
  console.log(`With Images: ${beforeWithImages}`);
  console.log(`Without Images: ${beforeWithoutImages}`);

  // Load source products from local DB or fallback seed script
  let sourceProducts = [];
  try {
    // If local Mongo has 201 products, use local Mongo as primary source
    const localConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/kumawat_pe').asPromise();
    const LocalProduct = localConn.model('Product', Product.schema);
    sourceProducts = await LocalProduct.find({}).lean();
    console.log(`\nFound ${sourceProducts.length} source products from Local MongoDB.`);
    await localConn.close();
  } catch (err) {
    console.log('\nLocal MongoDB connection failed. Falling back to seed script data.');
    const seedScript = require('./seed_100_products');
    sourceProducts = seedScript.productsData || [];
  }

  if (sourceProducts.length === 0) {
    console.error('ERROR: No source products available for migration!');
    process.exit(1);
  }

  // MIGRATION PROCESS
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const prod of sourceProducts) {
    try {
      const existing = await Product.findOne({ productId: prod.productId });
      
      // Clean object before saving
      const prodDoc = { ...prod };
      delete prodDoc._id;
      delete prodDoc.__v;

      if (!existing) {
        await new Product(prodDoc).save();
        inserted++;
      } else {
        await Product.updateOne({ productId: prod.productId }, { $set: prodDoc });
        updated++;
      }
    } catch (err) {
      console.error(`Error migrating product ${prod.productId}:`, err.message);
      errors++;
    }
  }

  // ALSO MIGRATE CATEGORIES AND BRANDS IF AVAILABLE LOCALLY
  try {
    const localConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/kumawat_pe').asPromise();
    const LocalCategory = localConn.model('Category', Category.schema);
    const LocalBrand = localConn.model('Brand', Brand.schema);

    const localCategories = await LocalCategory.find({}).lean();
    const localBrands = await LocalBrand.find({}).lean();

    for (const cat of localCategories) {
      const catObj = { ...cat };
      delete catObj._id;
      delete catObj.__v;
      await Category.updateOne({ categoryId: cat.categoryId }, { $set: catObj }, { upsert: true });
    }

    for (const b of localBrands) {
      const bObj = { ...b };
      delete bObj._id;
      delete bObj.__v;
      await Brand.updateOne({ brandId: b.brandId }, { $set: bObj }, { upsert: true });
    }

    await localConn.close();
    console.log(`Migrated ${localCategories.length} categories and ${localBrands.length} brands.`);
  } catch (err) {
    console.log('Skipping category/brand sync:', err.message);
  }

  // AFTER AUDIT
  const afterProducts = await Product.find({}).lean();
  const afterTotal = afterProducts.length;
  const afterActive = afterProducts.filter(p => p.status === 'Active').length;
  const afterInactive = afterProducts.filter(p => p.status !== 'Active').length;
  const afterWithImages = afterProducts.filter(p => p.images && p.images.length > 0 && p.images.some(img => typeof img === 'string' && img.trim() !== '')).length;
  const afterWithoutImages = afterTotal - afterWithImages;

  const pIds = new Set();
  const skus = new Set();
  let dupPids = 0;
  let dupSkus = 0;

  for (const p of afterProducts) {
    if (p.productId) {
      if (pIds.has(p.productId)) dupPids++;
      else pIds.add(p.productId);
    }
    if (p.sku) {
      if (skus.has(p.sku)) dupSkus++;
      else skus.add(p.sku);
    }
  }

  console.log('\n--- MIGRATION SUMMARY ---');
  console.log(`Inserted New: ${inserted}`);
  console.log(`Updated Existing: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);

  console.log('\n--- TARGET DATABASE AFTER MIGRATION ---');
  console.log(`Total Products: ${afterTotal}`);
  console.log(`Active Products: ${afterActive}`);
  console.log(`Inactive Products: ${afterInactive}`);
  console.log(`With Images: ${afterWithImages}`);
  console.log(`Without Images: ${afterWithoutImages}`);
  console.log(`Duplicate productIds: ${dupPids}`);
  console.log(`Duplicate SKUs: ${dupSkus}`);

  await mongoose.disconnect();
  console.log('====================================================\n');
}

if (require.main === module) {
  const targetUriArg = process.argv[2];
  migrateCatalog(targetUriArg).catch(console.error);
}

module.exports = migrateCatalog;
