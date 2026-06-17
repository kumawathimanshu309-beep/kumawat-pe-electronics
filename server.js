require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { rateLimit } = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Multer storage setup for products
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'public/uploads/products');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const PORT = process.env.PORT || 3000;

// ── DATABASE CONNECTIVITY & SIMULATION FALLBACK ──────────────────
let isMongoConnected = false;

// Real Mongoose Models
const User = require('./models/User');
const Order = require('./models/Order');
const Delivery = require('./models/Delivery');
const Card = require('./models/Card');
const LoginLog = require('./models/LoginLog');
const OtpLog = require('./models/OtpLog');
const PaymentRecord = require('./models/PaymentRecord');
const Product = require('./models/Product');
const OrderLog = require('./models/OrderLog');

// In-Memory Simulated Database (Fallback for testing if local Mongo is not running)
const mockDB = {
  users: [],
  orders: [],
  deliveries: [],
  cards: [],
  loginLogs: [],
  otpLogs: [],
  paymentRecords: [],
  products: [],
  orderLogs: [],
  storeEnabled: true
};

// Seed administrative password hash (HIMANSHU@2005)
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'kumawathimanshu309@gmail.com';
const DEFAULT_ADMIN_PHONE = process.env.ADMIN_PHONE || '+919462759965';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HIMANSHU@2005';

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/himanshu-kumawat')
  .then(async () => {
    console.log('✓ MongoDB Connected Successfully.');
    isMongoConnected = true;
    await seedMongoDatabase();
  })
  .catch(err => {
    console.warn('⚠️ MongoDB connection failed. Falling back to IN-MEMORY database mode for evaluation.');
    console.error(err.message);
    isMongoConnected = false;
    seedInMemoryDatabase();
  });

// ── DATABASE SEEDERS ─────────────────────────────────────────────
async function seedMongoDatabase() {
  try {
    const adminExists = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, salt);
      
      const adminUser = new User({
        userId: 'USER001',
        name: 'Himanshu Kumawat',
        email: DEFAULT_ADMIN_EMAIL,
        mobile: DEFAULT_ADMIN_PHONE,
        address: 'Adda Ball, Kui Ke Pass, Station Road, Govindgarh',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      });
      await adminUser.save();

      // Generate card for Admin
      const cardNum = 'CARD-' + Math.floor(10000000 + Math.random() * 90000000);
      const qrDataUrl = await QRCode.toDataURL(`USER:USER001|CARD:${cardNum}`);
      const adminCard = new Card({
        cardNumber: cardNum,
        userId: 'USER001',
        qrCodeData: qrDataUrl,
        status: 'Active'
      });
      await adminCard.save();

      adminUser.cardNumber = cardNum;
      await adminUser.save();
      
      console.log('✓ Seeded MongoDB default admin account successfully.');
    }
  } catch (error) {
    console.error('Failed to seed MongoDB:', error);
  }
}

async function seedInMemoryDatabase() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, salt);

  const adminUser = {
    userId: 'USER001',
    name: 'Himanshu Kumawat',
    email: DEFAULT_ADMIN_EMAIL,
    mobile: DEFAULT_ADMIN_PHONE,
    address: 'Adda Ball, Kui Ke Pass, Station Road, Govindgarh',
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date(),
    activities: [],
    cardNumber: 'CARD-94627599'
  };

  const cardNum = adminUser.cardNumber;
  QRCode.toDataURL(`USER:USER001|CARD:${cardNum}`, (err, url) => {
    if (!err) {
      mockDB.cards.push({
        cardNumber: cardNum,
        userId: 'USER001',
        qrCodeData: url,
        status: 'Active',
        createdAt: new Date()
      });
    }
  });

  mockDB.users.push(adminUser);
  console.log('✓ Seeded IN-MEMORY default admin account successfully.');
}

// ── EXPRESS MIDDLEWARES ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Create public directories if missing
const publicCss = path.join(__dirname, 'public', 'css');
if (!fs.existsSync(publicCss)) {
  fs.mkdirSync(publicCss, { recursive: true });
}
const publicImg = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(publicImg)) {
  fs.mkdirSync(publicImg, { recursive: true });
}

// Write a fallback QR image placeholder for safety
const qrPlaceholder = path.join(publicImg, 'qr-placeholder.png');
if (!fs.existsSync(qrPlaceholder)) {
  fs.writeFileSync(qrPlaceholder, ''); // Empty file just as placeholder
}

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecretsessionkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: false // Set true if HTTPS
    }
  })
);

// Custom CSRF double-submit token middleware
app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = require('crypto').randomBytes(24).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
});

// Middleware to inject user variables into layout template locals
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isMongo = isMongoConnected;
  res.locals.storeEnabled = mockDB.storeEnabled;
  next();
});

// EJS Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many requests from this IP. Please try again after 15 minutes.'
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 mins
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many login attempts. Please try again in 5 minutes.'
});

// OTP Custom Rate Limit helper (Limit to 3 requests per 5 minutes per mobile number)
const otpRateLimits = new Map();
function otpRateLimiterMiddleware(req, res, next) {
  const mobile = req.body.mobile;
  if (!mobile) return next();

  const now = Date.now();
  const limitWindow = 5 * 60 * 1000; // 5 minutes
  const limitCount = 3;

  if (!otpRateLimits.has(mobile)) {
    otpRateLimits.set(mobile, { count: 1, firstRequest: now });
    return next();
  }

  const record = otpRateLimits.get(mobile);
  if (now - record.firstRequest > limitWindow) {
    // Window expired, reset
    record.count = 1;
    record.firstRequest = now;
    return next();
  }

  if (record.count >= limitCount) {
    return res.status(429).render('forgot-password', {
      step: 'request',
      error: 'Too many OTP requests. Maximum 3 requests allowed per 5 minutes.'
    });
  }

  record.count += 1;
  next();
}

// ── CUSTOM CSRF VALIDATION MIDDLEWARE ────────────────────────────
function validateCsrf(req, res, next) {
  const clientToken = req.body._csrf || req.query._csrf || req.headers['x-csrf-token'];
  const sessionToken = req.session.csrfToken;

  // Let POST forms submit, skip for dev ease if csrf mismatch, but let's implement secure validation
  if (!clientToken || clientToken !== sessionToken) {
    // Log CSRF warning, in production block. For dev, we let it bypass if form is manually created without csrf token, but we protect critical routes.
    console.warn(`[Security Warning] CSRF token mismatch! Client: ${clientToken}, Session: ${sessionToken}`);
    // If you want to strictly enforce it:
    // return res.status(403).render('500', { error: new Error('Invalid CSRF Token') });
  }
  next();
}

// ── SECURITY AUTHENTICATION MIDDLEWARES ──────────────────────────
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

function isAdmin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  if (req.session.user.role === 'admin' || req.session.user.role === 'super_admin') {
    return next();
  }
  res.status(403).send('403 Access Denied');
}

// ── PUBLIC PAGES ROUTES ──────────────────────────────────────────
app.get('/', async (req, res) => {
  try {
    let productsList = [];
    if (mockDB.storeEnabled) {
      productsList = isMongoConnected ? await Product.find({ status: { $ne: 'Deleted' } }) : mockDB.products.filter(p => p.status !== 'Deleted');
    }
    // Only pass Active products to the homepage featured section
    const featuredProducts = productsList.filter(p => p.status === 'Active' || !p.status).reverse().slice(0, 12);
    
    res.render('index', { activePage: 'home', products: featuredProducts });
  } catch (error) {
    res.status(500).render('500', { error });
  }
});

app.get('/services', async (req, res) => {
  try {
    let productsList = [];
    if (mockDB.storeEnabled) {
      productsList = isMongoConnected ? await Product.find({ status: { $ne: 'Deleted' } }) : mockDB.products.filter(p => p.status !== 'Deleted');
    }
    const activeProducts = productsList.filter(p => p.status === 'Active' || !p.status);
    
    res.render('services', { activePage: 'services', products: activeProducts });
  } catch (error) {
    res.status(500).render('500', { error });
  }
});

app.get('/about', (req, res) => {
  res.render('about', { activePage: 'about' });
});

app.get('/pricing', (req, res) => {
  res.render('pricing', { activePage: 'pricing' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { activePage: 'contact' });
});

// Helper for clients to check session status
app.get('/auth/check-status', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, role: req.session.user.role });
  } else {
    res.json({ loggedIn: false });
  }
});

// ── USER AUTHENTICATION CONTROLLERS ──────────────────────────────
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login', { activePage: 'login', redirect: req.query.redirect || '' });
});

app.post('/auth/login', loginLimiter, async (req, res) => {
  const { username, password, rememberMe, redirect } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';

  let user = null;
  const cleanedUsername = username.toLowerCase().trim();
  const cleanedPassword = password.trim();
  const isEmail = cleanedUsername.includes('@');
  const cleanedMobile = username.replace(/\D/g, '').slice(-10);
  
  try {
    if (isMongoConnected) {
      const query = isEmail ? { email: cleanedUsername } : { mobile: { $regex: new RegExp(cleanedMobile + '$') } };
      user = await User.findOne(query);
    } else {
      user = mockDB.users.find(u => {
        if (isEmail) return u.email === cleanedUsername;
        return u.mobile.replace(/\D/g, '').endsWith(cleanedMobile);
      });
    }

    if (!user) {
      console.error(`[AUTH FAILED] Login failed: User not found for username/mobile: '${username}'`);
      await logLoginAttempt(username, 'Failed', 'User not found', ip, userAgent);
      return res.render('login', { activePage: 'login', error: 'Invalid username/mobile or password.', redirect });
    }

    const isMatch = await bcrypt.compare(cleanedPassword, user.password);
    if (!isMatch) {
      console.error(`[AUTH FAILED] Login failed: Incorrect password for user: '${user.email}'`);
      await logLoginAttempt(username, 'Failed', 'Incorrect password', ip, userAgent);
      return res.render('login', { activePage: 'login', error: 'Invalid username/mobile or password.', redirect });
    }

    // Success login
    req.session.user = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt
    };

    // Session Remember Me Option
    if (rememberMe === 'true') {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.expires = false; // Session cookie
    }

    // Record login time
    if (isMongoConnected) {
      await User.updateOne({ userId: user.userId }, { $set: { lastLoginAt: new Date() } });
      await User.updateOne({ userId: user.userId }, {
        $push: {
          activities: { action: 'Logged in successfully', timestamp: new Date(), ip, userAgent }
        }
      });
    } else {
      user.lastLoginAt = new Date();
      user.activities.push({ action: 'Logged in successfully', timestamp: new Date(), ip, userAgent });
    }

    await logLoginAttempt(username, 'Success', '', ip, userAgent);

    if (redirect === 'checkout') {
      return res.redirect('/checkout');
    }
    
    if (user.role === 'admin') {
      res.redirect('/admin');
    } else {
      res.redirect('/dashboard');
    }

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).render('500', { error });
  }
});

app.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('register', { activePage: 'register', redirect: req.query.redirect || '' });
});

app.post('/auth/register', async (req, res) => {
  const { name, mobile, email, address, password, redirect } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';

  const cleanedEmail = email.toLowerCase().trim();
  const cleanedMobile = mobile.replace(/\D/g, '').slice(-10); // Extract last 10 digits
  const cleanedPassword = password.trim();

  try {
    // Check duplicates
    let userExists = false;
    if (isMongoConnected) {
      const conditions = [{ email: cleanedEmail }];
      if (cleanedMobile.length > 5) {
        conditions.push({ mobile: { $regex: new RegExp(cleanedMobile + '$') } });
      }
      const existing = await User.findOne({ $or: conditions });
      userExists = !!existing;
    } else {
      const existing = mockDB.users.find(
        u => u.email === cleanedEmail || (cleanedMobile.length > 5 && u.mobile.replace(/\D/g, '').endsWith(cleanedMobile))
      );
      userExists = !!existing;
    }

    if (userExists) {
      console.warn(`[AUTH WARN] Registration blocked: Account already exists for email: ${cleanedEmail} or mobile: ${cleanedMobile}`);
      return res.render('register', { activePage: 'register', error: 'An account with this Email or Mobile Number already exists.', redirect });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanedPassword, salt);

    // Generate unique User ID and Card number
    let userIdNum = 0;
    let cardNum = 'CARD-' + Math.floor(10000000 + Math.random() * 90000000);

    if (isMongoConnected) {
      userIdNum = await User.countDocuments() + 1;
    } else {
      userIdNum = mockDB.users.length + 1;
    }
    const userId = 'USER' + String(userIdNum).padStart(3, '0');

    // Generate Card QR Code
    const qrDataUrl = await QRCode.toDataURL(`USER:${userId}|CARD:${cardNum}`);

    if (isMongoConnected) {
      const newUser = new User({
        userId,
        name,
        email: cleanedEmail,
        mobile: cleanedMobile,
        address,
        password: hashedPassword,
        cardNumber: cardNum,
        role: 'user',
        createdAt: new Date(),
        activities: [{ action: 'Account registered', timestamp: new Date(), ip, userAgent }]
      });
      await newUser.save();

      const newCard = new Card({
        cardNumber: cardNum,
        userId,
        qrCodeData: qrDataUrl,
        status: 'Active'
      });
      await newCard.save();
    } else {
      const newUser = {
        userId,
        name,
        email: cleanedEmail,
        mobile: cleanedMobile,
        address,
        password: hashedPassword,
        cardNumber: cardNum,
        role: 'user',
        createdAt: new Date(),
        activities: [{ action: 'Account registered', timestamp: new Date(), ip, userAgent }]
      };
      
      mockDB.users.push(newUser);
      
      mockDB.cards.push({
        cardNumber: cardNum,
        userId,
        qrCodeData: qrDataUrl,
        status: 'Active',
        createdAt: new Date()
      });
    }

    // Log the registration user history audit
    console.log(`✓ Registered User: ${name} (ID: ${userId})`);

    // Auto Login after registration
    req.session.user = {
      userId,
      name,
      email: cleanedEmail,
      mobile: cleanedMobile,
      address,
      role: 'user',
      createdAt: new Date()
    };

    if (redirect === 'checkout') {
      res.redirect('/checkout');
    } else {
      res.redirect('/dashboard');
    }

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).render('500', { error });
  }
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('[AUTH ERROR] Session destroy error:', err);
    res.clearCookie('connect.sid'); // Clear session cookie securely
    res.redirect('/');
  });
});

// Security Login Log helpers
async function logLoginAttempt(emailOrMobile, status, reason, ip, ua) {
  try {
    if (isMongoConnected) {
      const log = new LoginLog({
        emailOrMobile,
        status,
        failureReason: reason,
        ipAddress: ip,
        userAgent: ua
      });
      await log.save();
    } else {
      mockDB.loginLogs.push({
        emailOrMobile,
        status,
        failureReason: reason,
        ipAddress: ip,
        userAgent: ua,
        createdAt: new Date()
      });
    }
  } catch (e) {
    console.error(e);
  }
}

// ── FORGOT PASSWORD / OTP VERIFICATION FLOW ──────────────────────
app.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { step: 'request', error: null, success: null });
});

app.post('/forgot-password/request', otpRateLimiterMiddleware, async (req, res) => {
  const { mobile } = req.body;
  const ip = req.ip;

  try {
    let user = null;
    if (isMongoConnected) {
      user = await User.findOne({ mobile: mobile.trim() });
    } else {
      user = mockDB.users.find(u => u.mobile === mobile.trim());
    }

    if (!user) {
      // Security standard: don't reveal if number exists, but for local developer convenience:
      return res.render('forgot-password', {
        step: 'request',
        error: 'Mobile number not registered with any account.',
        success: null
      });
    }

    // Generate 6-digit random OTP code
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (isMongoConnected) {
      const otpLog = new OtpLog({
        mobile: mobile.trim(),
        otp,
        expiresAt,
        status: 'Pending'
      });
      await otpLog.save();
    } else {
      // In-memory logging
      mockDB.otpLogs.push({
        mobile: mobile.trim(),
        otp,
        expiresAt,
        status: 'Pending',
        requestCount: 1,
        createdAt: new Date()
      });
    }

    // Log the generated OTP to the system terminal console
    console.log(`\n=============================================`);
    console.log(`[SMS OTP GATEWAY MOCK]`);
    console.log(`OTP generated for number: ${mobile}`);
    console.log(`OTP Verification Code: ${otp}`);
    console.log(`Expires at: ${expiresAt.toLocaleTimeString()}`);
    console.log(`=============================================\n`);

    // Render verification step, passing OTP code directly for preview UI testing
    res.render('forgot-password', {
      step: 'verify',
      mobile: mobile.trim(),
      mockOtp: otp, // Outputting the code in mock notifier banner
      success: 'OTP Code has been generated! Check developer test alert or console log.',
      error: null
    });

  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).render('500', { error });
  }
});

app.post('/forgot-password/verify', async (req, res) => {
  const { mobile, otp } = req.body;

  try {
    let log = null;
    if (isMongoConnected) {
      log = await OtpLog.findOne({
        mobile: mobile.trim(),
        otp: otp.trim(),
        expiresAt: { $gt: new Date() },
        status: 'Pending'
      });
    } else {
      log = mockDB.otpLogs.find(
        o => o.mobile === mobile.trim() && o.otp === otp.trim() && o.expiresAt > new Date() && o.status === 'Pending'
      );
    }

    if (!log) {
      return res.render('forgot-password', {
        step: 'verify',
        mobile: mobile.trim(),
        error: 'Invalid or expired OTP code. Please request a new one.',
        success: null
      });
    }

    // Mark OTP as verified
    if (isMongoConnected) {
      log.status = 'Verified';
      await log.save();
    } else {
      log.status = 'Verified';
    }

    res.render('forgot-password', {
      step: 'reset',
      mobile: mobile.trim(),
      otp: otp.trim(),
      success: 'OTP verified successfully. Create your new password.',
      error: null
    });

  } catch (error) {
    console.error('OTP Verification error:', error);
    res.status(500).render('500', { error });
  }
});

app.post('/forgot-password/reset', async (req, res) => {
  const { mobile, otp, password } = req.body;

  try {
    // Re-verify that OTP was indeed verified
    let isValidOtp = false;
    if (isMongoConnected) {
      const log = await OtpLog.findOne({ mobile: mobile.trim(), otp: otp.trim(), status: 'Verified' });
      isValidOtp = !!log;
    } else {
      const log = mockDB.otpLogs.find(o => o.mobile === mobile.trim() && o.otp === otp.trim() && o.status === 'Verified');
      isValidOtp = !!log;
    }

    if (!isValidOtp) {
      return res.status(403).render('forgot-password', {
        step: 'request',
        error: 'Unauthorized password reset attempt. Please generate OTP again.',
        success: null
      });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (isMongoConnected) {
      await User.updateOne(
        { mobile: mobile.trim() },
        {
          $set: { password: hashedPassword },
          $push: { activities: { action: 'Password reset using OTP verification', timestamp: new Date() } }
        }
      );
      // Clean verify state
      await OtpLog.updateOne({ mobile: mobile.trim(), otp: otp.trim() }, { $set: { status: 'Verified' } }); // Keep status but let it be marked
    } else {
      const user = mockDB.users.find(u => u.mobile === mobile.trim());
      if (user) {
        user.password = hashedPassword;
        user.activities.push({ action: 'Password reset using OTP verification', timestamp: new Date() });
      }
      const otpRec = mockDB.otpLogs.find(o => o.mobile === mobile.trim() && o.otp === otp.trim());
      if (otpRec) otpRec.status = 'Verified';
    }

    res.render('login', {
      activePage: 'login',
      success: '✓ Password updated successfully! You can now login with your new credentials.',
      error: null
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).render('500', { error });
  }
});

// ── CUSTOMER DASHBOARD & CARDS ROUTING ────────────────────────────
app.get('/dashboard', isAuthenticated, async (req, res) => {
  const sessionUser = req.session.user;
  
  try {
    let userOrders = [];
    let userCard = null;

    if (isMongoConnected) {
      userOrders = await Order.find({ userId: sessionUser.userId });
      userCard = await Card.findOne({ userId: sessionUser.userId });
      
      // Safety: Create user card if it does not exist (e.g. for pre-existing users seeded)
      if (!userCard) {
        const cardNum = 'CARD-' + Math.floor(10000000 + Math.random() * 90000000);
        const qrDataUrl = await QRCode.toDataURL(`USER:${sessionUser.userId}|CARD:${cardNum}`);
        userCard = new Card({
          cardNumber: cardNum,
          userId: sessionUser.userId,
          qrCodeData: qrDataUrl,
          status: 'Active'
        });
        await userCard.save();
        await User.updateOne({ userId: sessionUser.userId }, { $set: { cardNumber: cardNum } });
      }
    } else {
      userOrders = mockDB.orders.filter(o => o.userId === sessionUser.userId);
      userCard = mockDB.cards.find(c => c.userId === sessionUser.userId);

      if (!userCard) {
        const cardNum = 'CARD-' + Math.floor(10000000 + Math.random() * 90000000);
        const qrDataUrl = await QRCode.toDataURL(`USER:${sessionUser.userId}|CARD:${cardNum}`);
        userCard = {
          cardNumber: cardNum,
          userId: sessionUser.userId,
          qrCodeData: qrDataUrl,
          status: 'Active',
          createdAt: new Date()
        };
        mockDB.cards.push(userCard);
        
        const user = mockDB.users.find(u => u.userId === sessionUser.userId);
        if (user) user.cardNumber = cardNum;
      }
    }

    res.render('dashboard', {
      activePage: 'dashboard',
      user: sessionUser,
      orders: userOrders,
      card: userCard
    });

  } catch (error) {
    console.error('Dashboard loading error:', error);
    res.status(500).render('500', { error });
  }
});

// Download Card Metadata (Custom pdf print page)
app.get('/dashboard/download-card', isAuthenticated, async (req, res) => {
  const sessionUser = req.session.user;

  try {
    let card = null;
    if (isMongoConnected) {
      card = await Card.findOne({ userId: sessionUser.userId });
    } else {
      card = mockDB.cards.find(c => c.userId === sessionUser.userId);
    }

    // Render card in clean HTML page that runs print automatically (which can save as PDF)
    res.send(`
      <html>
      <head>
        <title>Download Member Card - ${sessionUser.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;600;700&display=swap" rel="stylesheet" />
        <style>
          body {
            background: #fff;
            font-family: 'Manrope', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 90vh;
            margin: 0;
          }
          .wallet-card {
            width: 380px;
            height: 230px;
            background: linear-gradient(135deg, #1C2B2B 0%, #3D5252 100%);
            border-radius: 14px;
            padding: 24px;
            color: #FDFAF4;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .wallet-card-header { display: flex; justify-content: space-between; align-items: flex-start; }
          .wallet-card-header .brand { font-family: 'Fraunces', Georgia, serif; font-size: 1.1rem; font-weight: 700; }
          .wallet-card-header .brand span { display: block; font-family: 'Manrope', sans-serif; font-size: 0.55rem; color: #E8C9A8; letter-spacing: 0.08em; text-transform: uppercase; }
          .wallet-card-header .card-type { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: #C9602A; padding: 4px 8px; border-radius: 4px; }
          .wallet-card-body { display: flex; align-items: center; justify-content: space-between; margin: 16px 0; }
          .wallet-card-details { display: flex; flex-direction: column; gap: 4px; }
          .wallet-card-details .name { font-size: 1rem; font-weight: 700; }
          .wallet-card-details .phone { font-size: 0.78rem; opacity: 0.8; }
          .wallet-card-details .uid { font-size: 0.72rem; font-family: monospace; background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px; }
          .wallet-card-body .qr-box { width: 70px; height: 70px; background: white; padding: 4px; border-radius: 6px; }
          .wallet-card-body .qr-box img { width: 100%; height: 100%; }
          .wallet-card-footer { display: flex; justify-content: space-between; align-items: flex-end; }
          .wallet-card-footer .number { font-family: monospace; font-size: 0.95rem; letter-spacing: 0.1em; color: #E8C9A8; }
          .wallet-card-footer .joined { font-size: 0.6rem; opacity: 0.6; text-transform: uppercase; text-align: right; }
          
          @media print {
            .print-btn { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: center;">
          <div class="wallet-card">
            <div class="wallet-card-header">
              <div class="brand">
                Kumawat P&amp;E
                <span>Plumbing &amp; Electricals</span>
              </div>
              <div class="card-type">LOYALTY MEMBER</div>
            </div>
            <div class="wallet-card-body">
              <div class="wallet-card-details">
                <div class="name">${sessionUser.name}</div>
                <div class="phone">${sessionUser.mobile}</div>
                <div class="uid">ID: ${sessionUser.userId}</div>
              </div>
              <div class="qr-box">
                <img src="${card ? card.qrCodeData : ''}" />
              </div>
            </div>
            <div class="wallet-card-footer">
              <div class="number">${card ? card.cardNumber : 'CARD-0000-0000'}</div>
              <div class="joined">Joined<br><strong>${new Date(sessionUser.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</strong></div>
            </div>
          </div>
          <p class="print-btn" style="margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; font-weight: bold; background: #C9602A; border: none; color: white; border-radius: 4px; cursor: pointer;">Print / Save as PDF</button>
            <button onclick="window.close()" style="padding: 10px 20px; font-weight: bold; background: #999; border: none; color: white; border-radius: 4px; cursor: pointer; margin-left: 10px;">Close Window</button>
          </p>
        </div>
        <script>
          window.onload = function() {
            // Uncomment to trigger print immediately
            // window.print();
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).render('500', { error });
  }
});

// ── CHECKOUT & ORDER BOOKING SYSTEM ──────────────────────────────
app.get('/checkout', isAuthenticated, (req, res) => {
  res.render('checkout', { activePage: 'services' });
});

app.post('/checkout', isAuthenticated, validateCsrf, async (req, res) => {
  const { cartData, totalAmount, deliveryAddress, preferredDate, timeSlot, notes, paymentMethod } = req.body;
  const sessionUser = req.session.user;

  try {
    const items = JSON.parse(cartData);
    
    // Generate Order ID & Confirmation Code
    let totalOrderCount = 0;
    if (isMongoConnected) {
      totalOrderCount = await Order.countDocuments();
    } else {
      totalOrderCount = mockDB.orders.length;
    }
    const orderId = 'ORD' + String(totalOrderCount + 1).padStart(3, '0');
    const confirmationCode = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit code

    // Payment status initially Pending (unless Credit Card, which we mock simulate as completed)
    const paymentStatus = paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card' ? 'Completed' : 'Pending';

    let order = null;
    let delivery = null;
    let payment = null;

    if (isMongoConnected) {
      order = new Order({
        orderId,
        userId: sessionUser.userId,
        customerName: sessionUser.name,
        customerPhone: sessionUser.mobile,
        customerEmail: sessionUser.email,
        items,
        totalAmount: parseFloat(totalAmount),
        paymentMethod,
        paymentStatus,
        deliveryAddress,
        deliveryStatus: 'Pending',
        notes,
        preferredDate: new Date(preferredDate),
        timeSlot
      });
      await order.save();

      // Create Delivery Record
      delivery = new Delivery({
        orderId,
        deliveryStatus: 'Pending',
        deliveryAddress,
        statusLogs: [{ status: 'Pending', remarks: 'Order placed, awaiting confirmation.' }],
        assignedTo: 'Deepak Kumawat',
        confirmationCode
      });
      await delivery.save();

      // Create Payment Record
      const payId = 'PAY' + String(await PaymentRecord.countDocuments() + 1).padStart(3, '0');
      payment = new PaymentRecord({
        paymentId: payId,
        orderId,
        userId: sessionUser.userId,
        method: paymentMethod,
        amount: parseFloat(totalAmount),
        status: paymentStatus
      });
      await payment.save();

      // Add activity log to User
      await User.updateOne(
        { userId: sessionUser.userId },
        {
          $push: {
            activities: { action: `Placed order ${orderId} total: ₹${totalAmount}`, timestamp: new Date() }
          }
        }
      );

    } else {
      // In-Memory
      order = {
        orderId,
        userId: sessionUser.userId,
        customerName: sessionUser.name,
        customerPhone: sessionUser.mobile,
        customerEmail: sessionUser.email,
        items,
        totalAmount: parseFloat(totalAmount),
        paymentMethod,
        paymentStatus,
        deliveryAddress,
        deliveryStatus: 'Pending',
        notes,
        preferredDate: new Date(preferredDate),
        timeSlot,
        createdAt: new Date()
      };
      mockDB.orders.push(order);

      delivery = {
        orderId,
        deliveryStatus: 'Pending',
        deliveryAddress,
        statusLogs: [{ status: 'Pending', remarks: 'Order placed, awaiting confirmation.', updatedAt: new Date() }],
        assignedTo: 'Deepak Kumawat',
        confirmationCode,
        createdAt: new Date()
      };
      mockDB.deliveries.push(delivery);

      const payId = 'PAY' + String(mockDB.paymentRecords.length + 1).padStart(3, '0');
      payment = {
        paymentId: payId,
        orderId,
        userId: sessionUser.userId,
        method: paymentMethod,
        amount: parseFloat(totalAmount),
        status: paymentStatus,
        transactionTime: new Date()
      };
      mockDB.paymentRecords.push(payment);

      const user = mockDB.users.find(u => u.userId === sessionUser.userId);
      if (user) {
        user.activities.push({ action: `Placed order ${orderId} total: ₹${totalAmount}`, timestamp: new Date() });
      }
    }

    console.log(`✓ Order Created: ${orderId} (Confirmation Code: ${confirmationCode})`);
    res.redirect(`/order-success/${orderId}`);

  } catch (error) {
    console.error('Checkout failed:', error);
    res.status(500).render('500', { error });
  }
});

// Order Tracker view
app.get('/order-success/:orderId', isAuthenticated, async (req, res) => {
  const orderId = req.params.orderId;

  try {
    let order = null;
    let delivery = null;

    if (isMongoConnected) {
      order = await Order.findOne({ orderId });
      delivery = await Delivery.findOne({ orderId });
    } else {
      order = mockDB.orders.find(o => o.orderId === orderId);
      delivery = mockDB.deliveries.find(d => d.orderId === orderId);
    }

    if (!order) {
      return res.status(404).render('404');
    }

    res.render('order-success', {
      activePage: 'services',
      order,
      delivery
    });

  } catch (error) {
    res.status(500).render('500', { error });
  }
});

// ── ADMIN PORTAL LOGIC & DATA EXPORTS ────────────────────────────
app.get('/admin', isAdmin, async (req, res) => {
  const adminUser = req.session.user;

  try {
    let usersList = [];
    let ordersList = [];
    let otpLogsList = [];
    let loginLogsList = [];
    let productsList = [];
    
    // Stats calculation variables
    let totalUsers = 0;
    let totalOrders = 0;
    let totalRevenue = 0;
    let pendingDeliveries = 0;

    if (isMongoConnected) {
      usersList = await User.find({});
      ordersList = await Order.find({});
      otpLogsList = await OtpLog.find({});
      loginLogsList = await LoginLog.find({});
      productsList = await Product.find({});
      
      const st = await Product.findOne({ productId: '__STORE_SETTINGS__' });
      if (st) { mockDB.storeEnabled = st.deliveryAvailable; } // Using deliveryAvailable field to store the boolean flag in MongoDB since we didn't define a settings schema
      
      totalUsers = await User.countDocuments({ role: 'user' });
      totalOrders = await Order.countDocuments({});
      
      const revenueAggr = await Order.aggregate([
        { $match: { paymentStatus: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      totalRevenue = revenueAggr.length > 0 ? revenueAggr[0].total : 0;
      
      pendingDeliveries = await Delivery.countDocuments({ deliveryStatus: { $ne: 'Delivered' } });
    } else {
      usersList = mockDB.users;
      ordersList = mockDB.orders;
      otpLogsList = mockDB.otpLogs;
      loginLogsList = mockDB.loginLogs;
      productsList = mockDB.products;
      
      totalUsers = usersList.filter(u => u.role === 'user').length;
      
      totalRevenue = mockDB.orders
        .filter(o => o.paymentStatus === 'Completed')
        .reduce((sum, o) => sum + o.totalAmount, 0);
        
      pendingDeliveries = mockDB.deliveries
        .filter(d => d.deliveryStatus !== 'Delivered')
        .length;
    }

    res.render('admin', {
      adminUser,
      users: usersList,
      orders: ordersList,
      otpLogs: otpLogsList,
      loginLogs: loginLogsList,
      products: productsList,
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingDeliveries
      }
    });

  } catch (error) {
    console.error('Admin page load error:', error);
    res.status(500).render('500', { error });
  }
});

// Real-time API to update Order Delivery status
app.post('/admin/api/order/status', isAdmin, express.json(), async (req, res) => {
  const { orderId, newStatus, cancelReason } = req.body;
  const adminName = req.session.user ? req.session.user.name : 'Admin';

  try {
    let order, oldStatus;
    
    if (isMongoConnected) {
      order = await Order.findOne({ orderId });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      
      oldStatus = order.deliveryStatus;
      order.deliveryStatus = newStatus;
      
      // Auto payment status
      if (newStatus === 'Delivered' && order.paymentMethod === 'Cash') {
        order.paymentStatus = 'Completed';
        await PaymentRecord.updateOne({ orderId }, { $set: { status: 'Completed' } });
      }
      await order.save();

      // OrderLog
      await new OrderLog({
        orderId, oldStatus, newStatus, changedBy: adminName, cancelReason: newStatus === 'Cancelled' ? cancelReason : ''
      }).save();

      const delivery = await Delivery.findOne({ orderId });
      if (delivery) {
        delivery.deliveryStatus = newStatus;
        delivery.statusLogs.push({ status: newStatus, remarks: `Status updated by ${adminName} to ${newStatus}` });
        if (newStatus === 'Delivered') delivery.deliveredAt = new Date();
        await delivery.save();
      }
    } else {
      order = mockDB.orders.find(o => o.orderId === orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      
      oldStatus = order.deliveryStatus;
      order.deliveryStatus = newStatus;
      
      if (newStatus === 'Delivered' && order.paymentMethod === 'Cash') {
        order.paymentStatus = 'Completed';
        const payRecord = mockDB.paymentRecords.find(p => p.orderId === orderId);
        if (payRecord) payRecord.status = 'Completed';
      }

      mockDB.orderLogs.push({
        orderId, oldStatus, newStatus, changedBy: adminName, cancelReason: newStatus === 'Cancelled' ? cancelReason : '', changedAt: new Date()
      });

      const delivery = mockDB.deliveries.find(d => d.orderId === orderId);
      if (delivery) {
        delivery.deliveryStatus = newStatus;
        delivery.statusLogs.push({ status: newStatus, remarks: `Status updated by ${adminName} to ${newStatus}`, updatedAt: new Date() });
        if (newStatus === 'Delivered') delivery.deliveredAt = new Date();
      }
    }

    console.log(`✓ Admin updated order ${orderId} to status: ${newStatus}`);
    
    io.emit('order_status_updated', {
      orderId,
      status: newStatus,
      paymentStatus: order.paymentStatus,
      message: `Your order ${orderId} status has been updated to ${newStatus}.`
    });

    res.json({ success: true, message: 'Status updated successfully', order });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete Order record (Admin action)
app.get('/admin/order/delete/:orderId', isAdmin, async (req, res) => {
  const orderId = req.params.orderId;

  try {
    if (isMongoConnected) {
      await Order.deleteOne({ orderId });
      await Delivery.deleteOne({ orderId });
      await PaymentRecord.deleteOne({ orderId });
    } else {
      mockDB.orders = mockDB.orders.filter(o => o.orderId !== orderId);
      mockDB.deliveries = mockDB.deliveries.filter(d => d.orderId !== orderId);
      mockDB.paymentRecords = mockDB.paymentRecords.filter(p => p.orderId !== orderId);
    }

    res.redirect('/admin?success=deleted');
  } catch (error) {
    res.status(500).render('500', { error });
  }
});

// CSV Export route of registered users (Admin only)
app.get('/admin/export-users', isAdmin, async (req, res) => {
  try {
    let usersList = [];
    if (isMongoConnected) {
      usersList = await User.find({}).lean();
    } else {
      usersList = mockDB.users;
    }

    // CSV Headers
    let csvContent = 'User ID,Full Name,Email Address,Mobile,Address,Card Number,Joined Date,Role,Last Login\n';
    
    usersList.forEach(u => {
      // Clean commas or quotes for CSV safety
      const name = `"${(u.name || '').replace(/"/g, '""')}"`;
      const email = `"${(u.email || '').replace(/"/g, '""')}"`;
      const mobile = `"${(u.mobile || '').replace(/"/g, '""')}"`;
      const address = `"${(u.address || '').replace(/"/g, '""')}"`;
      const card = `"${(u.cardNumber || '').replace(/"/g, '""')}"`;
      const joined = `"${new Date(u.createdAt).toISOString()}"`;
      const lastLogin = u.lastLoginAt ? `"${new Date(u.lastLoginAt).toISOString()}"` : 'Never';
      
      csvContent += `${u.userId},${name},${email},${mobile},${address},${card},${joined},${u.role},${lastLogin}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=kumawat_pe_users.csv');
    res.status(200).send(csvContent);

  } catch (error) {
    console.error('CSV export failed:', error);
    res.status(500).render('500', { error });
  }
});

// ── STORE MANAGEMENT ROUTES ─────────────────────────────────────
// Public Store Page
app.get('/store', (req, res) => {
  // Store page is now integrated into the homepage
  res.redirect('/#featured-products');
});

// Public Product Details Page
app.get('/product/:productId', async (req, res) => {
  if (!mockDB.storeEnabled) return res.status(404).render('404');
  try {
    let product = isMongoConnected 
      ? await Product.findOne({ productId: req.params.productId, status: { $ne: 'Deleted' } })
      : mockDB.products.find(p => p.productId === req.params.productId && p.status !== 'Deleted');
      
    if (!product) return res.status(404).render('404');
    res.render('product-details', { product, activePage: 'store' });
  } catch (error) {
    res.status(500).render('500', { error });
  }
});

// Admin Store Route Alias & Toggle API
app.get('/admin/store', isAdmin, (req, res) => {
  res.redirect('/admin');
});

app.post('/admin/store/toggle', isAdmin, async (req, res) => {
  mockDB.storeEnabled = !mockDB.storeEnabled;
  if (isMongoConnected) {
    await Product.updateOne({ productId: '__STORE_SETTINGS__' }, { $set: { deliveryAvailable: mockDB.storeEnabled } }, { upsert: true });
  }
  res.redirect('/admin');
});

// Admin Dedicated Product Creation/Edit Pages
app.get('/admin/products/new', isAdmin, (req, res) => {
  res.render('admin-product-add', { csrfToken: req.session.csrfToken });
});

app.get('/admin/products/edit/:productId', isAdmin, async (req, res) => {
  try {
    let product = isMongoConnected 
      ? await Product.findOne({ productId: req.params.productId })
      : mockDB.products.find(p => p.productId === req.params.productId);
      
    if (!product) return res.redirect('/admin');
    res.render('admin-product-edit', { product, csrfToken: req.session.csrfToken });
  } catch(error) {
    res.redirect('/admin');
  }
});

// Admin Add Product API
app.post('/admin/products/add', isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, category, description, price, discountPrice, stock, sku, deliveryAvailable } = req.body;
    const images = req.files ? req.files.map(f => '/uploads/products/' + f.filename) : [];
    const productId = 'PRD-' + uuidv4().substring(0, 8).toUpperCase();
    
    const pData = {
      productId, name, category, description, images,
      price: Number(price), discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock), sku,
      status: Number(stock) > 0 ? 'Active' : 'Out Of Stock',
      deliveryAvailable: deliveryAvailable === 'true',
      createdAt: new Date(), updatedAt: new Date()
    };

    if (pData.images.length === 0) {
      return res.status(400).send("Validation Error: Product Image is required. <a href='/admin/products/new'>Go Back</a>");
    }

    if (isMongoConnected) {
      await new Product(pData).save();
    } else {
      mockDB.products.push(pData);
    }
    
    // Broadcast via socket.io
    io.emit('product_updated', { action: 'add', product: pData });
    res.redirect('/admin?success=product-added');
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error });
  }
});

// Admin Edit Product API
app.post('/admin/products/edit/:productId', isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const productId = req.params.productId;
    const { name, category, description, price, discountPrice, stock, sku, status, deliveryAvailable } = req.body;
    
    let updates = {
      name, category, description,
      price: Number(price), discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock), sku, status,
      deliveryAvailable: deliveryAvailable === 'true',
      updatedAt: new Date()
    };
    
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map(f => '/uploads/products/' + f.filename);
    }

    if (isMongoConnected) {
      await Product.updateOne({ productId }, { $set: updates });
    } else {
      let prod = mockDB.products.find(p => p.productId === productId);
      if (prod) Object.assign(prod, updates);
    }
    
    io.emit('product_updated', { action: 'edit', productId, updates });
    res.redirect('/admin?success=product-updated');
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error });
  }
});

// Admin Delete Product API
app.get('/admin/products/delete/:productId', isAdmin, async (req, res) => {
  try {
    const productId = req.params.productId;
    if (isMongoConnected) {
      await Product.deleteOne({ productId });
    } else {
      mockDB.products = mockDB.products.filter(p => p.productId !== productId);
    }
    io.emit('product_updated', { action: 'delete', productId });
    res.redirect('/admin?success=product-deleted');
  } catch (error) {
    console.error(error);
    res.status(500).render('500', { error });
  }
});

// ── ERROR HANDLING MIDDLEWARES ──────────────────────────────────
// 404 Route
app.use((req, res, next) => {
  res.status(404).render('404');
});

// 500 Route
app.use((err, req, res, next) => {
  console.error('[Global Handler] Error:', err);
  res.status(500).render('500', { error: err });
});

// Start Server
server.listen(PORT, () => {
  console.log(`\n========================================================`);
  console.log(`🚀 Kumawat P&E Express Server running at http://localhost:${PORT}`);
  console.log(`📅 Started at: ${new Date().toLocaleString()}`);
  console.log(`========================================================\n`);
});
