const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const http = require('http');
const path = require('path');

console.log('🧪 Starting Automated Backend Verification tests...\n');

// 1. Test Bcrypt Cryptography
async function testBcrypt() {
  console.log('1. Testing Bcrypt Password Hashing...');
  const pass = 'HIMANSHU@2005';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(pass, salt);
  
  if (!hash || hash === pass) {
    throw new Error('Bcrypt hashing failed. Hash is empty or matches plain text.');
  }
  
  const isMatch = await bcrypt.compare(pass, hash);
  if (!isMatch) {
    throw new Error('Bcrypt verification failed. Verification of hashed password returned false.');
  }
  
  console.log('   [PASS] Bcrypt password hashing and verification works correctly.');
}

// 2. Test QR Code Engine
async function testQRCode() {
  console.log('\n2. Testing QR Code Generation...');
  const testData = 'USER:USER001|CARD:CARD-12345678';
  const dataUrl = await QRCode.toDataURL(testData);
  
  if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
    throw new Error('QRCode generation failed or returned invalid data format.');
  }
  
  console.log('   [PASS] QRCode engine generated base64 image string successfully.');
}

// 3. Test Mongoose Models Importing
function testModels() {
  console.log('\n3. Testing Database Model Schemas...');
  try {
    const User = require('../models/User');
    const Order = require('../models/Order');
    const Delivery = require('../models/Delivery');
    const Card = require('../models/Card');
    const LoginLog = require('../models/LoginLog');
    const OtpLog = require('../models/OtpLog');
    const PaymentRecord = require('../models/PaymentRecord');

    console.log('   [PASS] All Mongoose model files imported successfully without compile errors.');
  } catch (e) {
    throw new Error(`Model loading failed: ${e.message}`);
  }
}

// 4. Test HTTP Server Boot & Routes
async function testRoutes() {
  console.log('\n4. Testing HTTP Server Boot and Main Routes...');
  
  // Set environment variables for testing
  process.env.PORT = '3333';
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/himanshu-kumawat-test';
  
  // Require and start server
  const serverModule = require('../server');
  
  // Wait 1 second for database connection attempt and server startup
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const routesToTest = [
    '/',
    '/services',
    '/about',
    '/pricing',
    '/contact',
    '/login',
    '/register',
    '/forgot-password'
  ];

  for (const route of routesToTest) {
    await new Promise((resolve, reject) => {
      http.get(`http://localhost:3333${route}`, (res) => {
        if (res.statusCode === 200) {
          console.log(`   [PASS] GET ${route} returned status 200 OK.`);
          resolve();
        } else {
          reject(new Error(`GET ${route} failed with status code ${res.statusCode}`));
        }
      }).on('error', (err) => {
        reject(new Error(`Connection to server on route ${route} failed: ${err.message}`));
      });
    });
  }
  
  console.log('   [PASS] All core public routes returned 200 OK successfully.');
}

async function run() {
  try {
    await testBcrypt();
    await testQRCode();
    testModels();
    await testRoutes();
    
    console.log('\n=============================================');
    console.log('🎉 ALL AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('=============================================\n');
    process.exit(0);
  } catch (e) {
    console.error('\n❌ VERIFICATION TEST FAILED:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
}

run();
