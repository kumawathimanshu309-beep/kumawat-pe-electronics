const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require('path');
const http = require('http');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Order = require('../models/Order');

function optimizeImage(url) {
  if (!url || typeof url !== 'string') return url;
  return url;
}

function makeRequest(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function runVerification() {
  console.log("=== STARTING COMPREHENSIVE E2E VERIFICATION ===");

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kumawat_pe');
  console.log("1. Connected to MongoDB.");

  // Test 1: Count products
  const activeProds = await Product.find({ status: { $ne: 'Deleted' } }).lean();
  console.log(`2. Total Active Products in DB: ${activeProds.length}`);
  if (activeProds.length < 100) {
    console.error(`❌ FAIL: Expected at least 100 active products, found ${activeProds.length}`);
  } else {
    console.log("✅ PASS: Total active products >= 100.");
  }

  // Test 2: Category Breakdown
  const categories = {};
  activeProds.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + 1;
  });
  console.log("3. Category Breakdown:", categories);

  // Test 3: Validate field completeness for all products
  let incompleteCount = 0;
  activeProds.forEach(p => {
    if (!p.name || !p.category || !p.brand || !p.price || !p.images || p.images.length === 0 || !p.specifications) {
      console.error(`❌ Incomplete product data found for ID: ${p._id} / productId: ${p.productId}`);
      incompleteCount++;
    }
  });
  if (incompleteCount === 0) {
    console.log("✅ PASS: All products have non-null required fields (name, category, brand, price, images, specs).");
  }

  // Test 4: EJS View Rendering of Product Details for ALL active products
  console.log("4. Testing EJS render of product-details view for all active products...");
  const viewsDir = path.join(__dirname, '../views');
  let renderErrors = 0;

  for (const prod of activeProds) {
    try {
      await ejs.renderFile(
        path.join(viewsDir, 'product-details.ejs'),
        {
          product: prod,
          relatedProducts: activeProds.slice(0, 4),
          cartCount: 0,
          user: null,
          req: { path: '/product/' + prod.productId },
          optimizeImage: optimizeImage,
          seo: { title: prod.name, description: prod.description, keywords: '' }
        },
        { root: viewsDir }
      );
    } catch (err) {
      console.error(`❌ EJS Render Error for product ${prod.name} (${prod.productId}):`, err.message);
      renderErrors++;
    }
  }

  if (renderErrors === 0) {
    console.log(`✅ PASS: All ${activeProds.length} products rendered cleanly in product-details.ejs with ZERO errors!`);
  } else {
    console.error(`❌ FAIL: ${renderErrors} products failed to render.`);
  }

  // Test 5: HTTP Endpoints Check
  console.log("5. Testing Live Server HTTP Endpoints...");
  const endpoints = ['/', '/services', '/api/products', '/product/PRD-IPHONE15PROMAX-256', '/admin'];
  for (const ep of endpoints) {
    try {
      const res = await makeRequest(ep);
      if (res.statusCode === 200 || res.statusCode === 302) {
        console.log(`✅ HTTP GET ${ep} -> Status ${res.statusCode}`);
      } else {
        console.error(`❌ HTTP GET ${ep} -> Unexpected status ${res.statusCode}`);
      }
    } catch (e) {
      console.error(`❌ HTTP GET ${ep} failed:`, e.message);
    }
  }

  // Test 6: Check Order Details route product rendering
  const orders = await Order.find({}).lean();
  console.log(`6. Found ${orders.length} orders in database.`);
  orders.forEach(ord => {
    console.log(`   Order ${ord.orderId}: ${ord.items.length} items preserved. Customer: ${ord.shippingAddress?.fullName || 'N/A'}`);
  });

  mongoose.connection.close();
  console.log("=== COMPREHENSIVE VERIFICATION COMPLETE ===");
}

runVerification().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});
