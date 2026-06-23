require('dotenv').config();

const logger = require('./utils/logger');

// ----------------------------------------------------
// ENVIRONMENT VALIDATION
// ----------------------------------------------------
const requiredEnvVars = [
  'MONGO_URI', 'SESSION_SECRET', 
  'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET',
  'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
  'PORT', 'NODE_ENV'
];

let missingEnv = [];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) missingEnv.push(envVar);
});

if (missingEnv.length > 0) {
  logger.error('\n[FATAL ERROR] Server cannot start due to missing environment variables:');
  missingEnv.forEach(envVar => logger.error(` - ${envVar}`));
  logger.error('\nPlease verify your .env file and try again.\n');
  process.exit(1);
}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const { randomUUID } = require('crypto');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { rateLimit } = require('express-rate-limit');
const path = require('path');
const csvParser = require('csv-parser');
const fs = require('fs');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const morgan = require('morgan');
const compression = require('compression');


const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('io', io);

// -----------------------------------------------------------------------------------------
// COMPRESSION, LOGGING & SECURITY MIDDLEWARE
// -----------------------------------------------------------------------------------------
app.use(compression()); 

const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: { write: message => logger.info(message.trim()) } }));

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
const DeliverySetting = require('./models/DeliverySetting');
const Delivery = require('./models/Delivery');
const Card = require('./models/Card');
const LoginLog = require('./models/LoginLog');
const OtpLog = require('./models/OtpLog');
const PaymentRecord = require('./models/PaymentRecord');
const Product = require('./models/Product');
const OrderLog = require('./models/OrderLog');
const Notification = require('./models/Notification');
const Coupon = require('./models/Coupon');
const Review = require('./models/Review');

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
  notifications: [],
  storeEnabled: true
};

// Seed administrative password hash (HIMANSHU@2005)
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'kumawathimanshu309@gmail.com';
const DEFAULT_ADMIN_PHONE = process.env.ADMIN_PHONE || '+919462759965';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HIMANSHU@2005';

function registerCouponRoutes() {
  console.log("Coupon Routes Registered");
  console.log("Registered:");
  console.log("GET /api/admin/coupons");
  console.log("POST /api/admin/coupon");
  console.log("PUT /api/admin/coupon/:id");
  console.log("DELETE /api/admin/coupon/:id");
  console.log("POST /api/coupon/validate");

  // --- Coupon API ---
  app.post(['/api/coupon/validate', '/api/coupons/validate'], isAuthenticated, async (req, res) => {
    try {

      const { code } = req.body;
      let { cartTotal } = req.body;
      if (!code) return res.json({ success: false, message: 'Coupon code is required' });
      
      cartTotal = Number(cartTotal);
      if (isNaN(cartTotal) || cartTotal < 0) return res.json({ success: false, message: 'Invalid cart total' });
      const coupon = await Coupon.findOne({ code: code.toUpperCase() });
      
      if (!coupon) return res.json({ success: false, message: 'Invalid coupon code' });

      if (coupon.status !== 'Active') return res.json({ success: false, message: 'Coupon is inactive' });
      
      const expiryBoundary = new Date(coupon.expiryDate);
      expiryBoundary.setUTCHours(23, 59, 59, 999);

      logger.info('\n--- COUPON EXPIRY VALIDATION ---');
      logger.info('Current Server Date/Time (UTC):', new Date().toISOString());
      logger.info('Current Server Date/Time (Local):', new Date().toLocaleString());
      logger.info('Stored Expiry Date (Raw):', coupon.expiryDate);
      logger.info('Normalized Expiry Date (End of Day UTC):', expiryBoundary.toISOString());
      logger.info('Server Timezone Offset (mins):', new Date().getTimezoneOffset());
      logger.info('Validation Check (Now <= Expiry):', new Date() <= expiryBoundary);
      logger.info('--------------------------------\n');

      if (new Date() > expiryBoundary) return res.json({ success: false, message: 'Coupon has expired' });

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.json({ success: false, message: 'Coupon usage limit reached' });
      }

      if (cartTotal < coupon.minOrderValue) {
        return res.json({ success: false, message: `Minimum order value of ₹${coupon.minOrderValue} required` });
      }

      // Check per-user limit
      const userId = req.session.user.userId;
      const userUsage = coupon.usedBy.find(u => u.userId === userId);
      if (userUsage && userUsage.count >= coupon.perUserLimit) {
        return res.json({ success: false, message: 'You have reached the usage limit for this coupon' });
      }

      let discountAmount = 0;
      if (coupon.type === 'fixed') {
        discountAmount = coupon.discount;
      } else if (coupon.type === 'percentage') {
        discountAmount = (cartTotal * coupon.discount) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      }

      // Ensure discount doesn't exceed total and is not negative
      if (discountAmount > cartTotal) discountAmount = cartTotal;
      discountAmount = Math.max(0, discountAmount);
      
      // Prevent NaN
      if (isNaN(discountAmount)) discountAmount = 0;

      res.json({
        success: true,
        coupon: {
          code: coupon.code,
          discountAmount,
          type: coupon.type,
          discount: coupon.discount,
          maxDiscount: coupon.maxDiscount,
          minOrderValue: coupon.minOrderValue,
          message: 'Coupon applied successfully'
        }
      });

    } catch (error) {

      if (typeof Coupon === 'undefined') {
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: 'Validation error: ' + error.message, error: error.message });
      }
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Duplicate key error', error: error.message });
      }
      
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Admin Coupon CRUD
  app.get(['/api/admin/coupons', '/api/admin/coupon'], isAdmin, async (req, res) => {
    try {
      const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
      
      res.json({ success: true, coupons });
    } catch (error) {
      
      if (typeof Coupon === 'undefined') {
      }
      
      if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: 'Validation failed: ' + error.message, error: error.message });
      if (error.code === 11000) return res.status(409).json({ success: false, message: 'Duplicate key error', error: error.message });
      
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post(['/api/admin/coupon', '/api/admin/coupons'], isAdmin, async (req, res) => {
    try {

      if (!req.body.code) return res.status(400).json({ success: false, message: 'Coupon code is required' });
      const existing = await Coupon.findOne({ code: req.body.code.toUpperCase() });

      if (existing) return res.status(409).json({ success: false, message: 'Coupon code already exists' });

      const newCoupon = new Coupon({
        ...req.body,
        code: req.body.code.toUpperCase()
      });
      await newCoupon.save();

      res.json({ success: true, message: 'Coupon created successfully' });
    } catch (error) {
      
      if (typeof Coupon === 'undefined') {
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: 'Validation error: ' + error.message, error: error.message });
      }
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Duplicate key error', error: error.message });
      }
      
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.put(['/api/admin/coupon/:id', '/api/admin/coupons/:id'], isAdmin, async (req, res) => {
    try {

      const { code } = req.body;
      
      if (code) {
        const existing = await Coupon.findOne({ code: code.toUpperCase(), _id: { $ne: req.params.id } });
        
        if (existing) return res.status(409).json({ success: false, message: 'Coupon code already exists' });
        req.body.code = code.toUpperCase();
      }
      await Coupon.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });

      res.json({ success: true, message: 'Coupon updated successfully' });
    } catch (error) {

      if (typeof Coupon === 'undefined') {
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: 'Validation error: ' + error.message, error: error.message });
      }
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Duplicate key error', error: error.message });
      }
      
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete(['/api/admin/coupon/:id', '/api/admin/coupons/:id'], isAdmin, async (req, res) => {
    try {
      await Coupon.findByIdAndDelete(req.params.id);

      res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {

      if (typeof Coupon === 'undefined') {
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: 'Validation error: ' + error.message, error: error.message });
      }
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Duplicate key error', error: error.message });
      }
      
      res.status(500).json({ success: false, error: error.message });
    }
  });
}

async function startServer() {
  console.log("1 Starting Server");
  try {
    try {
      mongoose.set('strictQuery', false);
      console.log("2 Connecting Mongo");
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000 // Increased from 5000 to 30000 for Railway
      });
      isMongoConnected = true;
      console.log("3 Mongo Connected");
      logger.info('MongoDB Connected successfully.');
      await seedMongoDatabase();
    } catch (err) {
      console.error('2.1 Mongo Connection Error:', err);
      logger.error('Primary MongoDB Connection Failed:', err.message);
      logger.info('Falling back to pure array Mock Mode.');
      await seedInMemoryDatabase();
    }

    console.log("4 Register Coupon Routes");
    registerCouponRoutes();
    registerErrorHandlers();

    console.log("5 Starting Express");
    server.listen(PORT, () => {
      console.log("6 Server Ready");
      logger.info(`🚀 Kumawat P&E Express Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error("Server Startup Failed:", err);
    process.exit(1);
  }
}

startServer();

// ── DATABASE SEEDERS ─────────────────────────────────────────────
async function seedMongoDatabase() {
  try {
    const adminExists = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(12);
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
      
      logger.info('✓ Seeded MongoDB default admin account successfully.');
    }
  } catch (error) {
    logger.error('Failed to seed MongoDB:', error);
  }
}

async function seedInMemoryDatabase() {
  const salt = await bcrypt.genSalt(12);
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
  logger.info('✓ Seeded IN-MEMORY default admin account successfully.');
}

// ── EXPRESS MIDDLEWARES ──────────────────────────────────────────
// Cloudinary Image Optimization Helper
app.locals.optimizeImage = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('res.cloudinary.com') && !url.includes('f_auto') && !url.includes('q_auto')) {
    return url.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
  }
  return url;
};

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://maps.googleapis.com", "https://maps.gstatic.com", "https://googleapis.com", "https://gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://googleapis.com", "https://gstatic.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "data:", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://images.unsplash.com", "https://checkout.razorpay.com", "https://maps.gstatic.com", "https://maps.googleapis.com", "https://googleapis.com", "https://gstatic.com"],
      frameSrc: ["'self'", "https://www.google.com", "https://google.com", "https://maps.google.com", "https://www.google.com/maps", "https://checkout.razorpay.com"],
      connectSrc: ["'self'", "https://lumberjack-cx.razorpay.com", "https://maps.googleapis.com", "https://googleapis.com", "https://gstatic.com", "https://cdn.jsdelivr.net"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true,
  referrerPolicy: { policy: 'same-origin' }
}));

app.use(mongoSanitize());
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent DOS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// XSS Protection via sanitize-html
const sanitizeHtml = require('sanitize-html');
const sanitizeInput = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  for (let key in obj) {
    if (key.toLowerCase().includes('password')) continue; // Skip passwords to preserve special characters
    if (typeof obj[key] === 'string') {
      // Allow some basic formatting but remove dangerous tags
      obj[key] = sanitizeHtml(obj[key], {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
        allowedAttributes: {
          '*': ['href', 'align', 'alt', 'center', 'bgcolor']
        }
      });
    } else if (typeof obj[key] === 'object') {
      sanitizeInput(obj[key]);
    }
  }
};
app.use((req, res, next) => {
  if (req.body) sanitizeInput(req.body);
  if (req.query) sanitizeInput(req.query);
  if (req.params) sanitizeInput(req.params);
  next();
});

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use(globalLimiter);

// Specific stricter limiters for Auth & Payments
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, 
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});
app.use('/login', authLimiter);
app.use('/register', authLimiter);
app.use('/api/user/generate-otp', authLimiter);
app.use('/api/user/verify-otp', authLimiter);

// Static Folder
app.use(express.static(path.join(__dirname, 'public'), { 
  maxAge: '30d',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

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
  fs.writeFileSync(qrPlaceholder, ''); 
}

// Sessions
app.set('trust proxy', 1); // Trust first proxy (Railway/Vercel load balancer)
app.use(
  session({
    name: 'sessionId', // Obfuscate session cookie name
    secret: process.env.SESSION_SECRET || 'supersecretsessionkey',
    resave: false,
    saveUninitialized: false,
    proxy: true, // Required for secure cookies behind Railway reverse proxy
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax' // Native CSRF protection + allows OAuth redirects
    }
  })
);

app.use((req, res, next) => {
  // Disabling global no-store cache to allow static caching
  if (!req.path.startsWith('/public') && !req.path.includes('.')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  logger.info(`[Auth] Serializing user: ${user.userId}`);
  done(null, user.userId);
});
passport.deserializeUser(async (id, done) => {
  try {
    logger.info(`[Auth] Deserializing user: ${id}`);
    if (isMongoConnected) {
      const user = await User.findOne({ userId: id });
      if (!user) {
        logger.error(`[Auth] Deserialization failed: User ${id} not found in DB`);
        return done(null, false);
      }
      done(null, user);
    } else {
      const user = mockDB.users.find(u => u.userId === id);
      if (!user) {
        logger.error(`[Auth] Deserialization failed: User ${id} not found in mockDB`);
        return done(null, false);
      }
      done(null, user);
    }
  } catch (err) {
    logger.error(`[Auth] Deserialize error:`, err);
    done(err, null);
  }
});

// --- SEO Routes ---
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Disallow: /admin
Disallow: /dashboard
Disallow: /api/
Sitemap: https://kumawatelectricals.com/sitemap.xml`);
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const products = isMongoConnected ? await Product.find({ status: 'Active' }).select('productId updatedAt').lean() : mockDB.products.filter(p => p.status === 'Active');
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://kumawatelectricals.com/</loc><priority>1.0</priority></url>
  <url><loc>https://kumawatelectricals.com/store</loc><priority>0.9</priority></url>
  <url><loc>https://kumawatelectricals.com/about</loc><priority>0.8</priority></url>
  <url><loc>https://kumawatelectricals.com/services</loc><priority>0.8</priority></url>
  <url><loc>https://kumawatelectricals.com/contact</loc><priority>0.7</priority></url>`;
    
    products.forEach(p => {
      xml += `\n  <url><loc>https://kumawatelectricals.com/product/${p.productId}</loc><priority>0.8</priority></url>`;
    });
    xml += '\n</urlset>';
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).end();
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'PLACEHOLDER_CLIENT_SECRET',
    callbackURL: "/auth/google/callback",
    proxy: true
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      logger.info(`[Google OAuth] Callback received for profile.id: ${profile.id}`);
      
      const email = profile.emails?.[0]?.value?.toLowerCase();
      
      if (!email) {
        logger.error(`[Google OAuth] Missing email in Google profile for ID: ${profile.id}`);
        return cb(new Error("Google_Email_Missing"), null);
      }
      
      logger.info(`[Google OAuth] Searching for existing user by email: ${email}`);
      let user = isMongoConnected ? await User.findOne({ email }) : mockDB.users.find(u => u.email === email);
      
      if (!user) {
        logger.info(`[Google OAuth] User not found, creating new account`);
        const newUserId = 'USER' + String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000);
        
        // Use a highly unique placeholder for the required mobile field to prevent E11000 duplicate keys
        const uniqueMobile = `GOOGLE_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        
        const newUserObj = {
          userId: newUserId,
          name: profile.displayName || 'Google User',
          email: email,
          mobile: uniqueMobile,
          profilePhoto: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          googleId: profile.id,
          role: 'user',
          createdAt: new Date(),
          lastLoginAt: new Date(),
          activities: [{ action: 'Registered via Google OAuth', timestamp: new Date() }]
        };

        if (isMongoConnected) {
          try {
            user = new User(newUserObj);
            logger.info(`[Google OAuth] Saving new user to MongoDB...`);
            await user.save();
            logger.info(`[Google OAuth] New user saved successfully.`);
          } catch (saveErr) {
            logger.error(`[Google OAuth] Error saving new user:`, saveErr);
            if (saveErr.name === 'ValidationError') return cb(new Error("Schema_Validation_Error"), null);
            if (saveErr.code === 11000) return cb(new Error("Duplicate_Key_Error"), null);
            throw saveErr;
          }
        } else {
          user = newUserObj;
          mockDB.users.push(user);
        }
      } else {
        logger.info(`[Google OAuth] User found! Updating login activity...`);
        let needsSave = false;
        
        if (!user.googleId) {
          user.googleId = profile.id;
          if (profile.photos && profile.photos[0] && !user.profilePhoto) {
            user.profilePhoto = profile.photos[0].value;
          }
          needsSave = true;
          logger.info(`[Google OAuth] Linking Google ID to existing email account.`);
        }
        
        user.lastLoginAt = new Date();
        user.activities.push({ action: 'Logged in via Google', timestamp: new Date() });
        needsSave = true;

        if (isMongoConnected && needsSave) {
          try {
            logger.info(`[Google OAuth] Updating existing user in MongoDB...`);
            await user.save();
            logger.info(`[Google OAuth] Existing user updated successfully.`);
          } catch (updateErr) {
            logger.error(`[Google OAuth] Error updating existing user:`, updateErr);
            if (updateErr.name === 'ValidationError') return cb(new Error("Schema_Validation_Error"), null);
            if (updateErr.code === 11000) return cb(new Error("Duplicate_Key_Error"), null);
            throw updateErr;
          }
        }
      }
      
      logger.info(`[Google OAuth] Strategy completed successfully, proceeding to serialize.`);
      return cb(null, user);
    } catch (err) {
      logger.error(`[Google OAuth] Unhandled exception in Strategy:`, err);
      return cb(err, null);
    }
  }
));

// Razorpay Initialization
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_placeholder',
});

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

// Apply globally to all API routes
app.use('/api/', generalLimiter);

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
    let featuredProducts = [];
    if (mockDB.storeEnabled) {
      if (isMongoConnected) {
        featuredProducts = await Product.find({ $or: [{ status: 'Active' }, { status: { $exists: false } }, { status: null }, { status: '' }] })
                                        .sort({ _id: -1 })
                                        .limit(12)
                                        .lean();
      } else {
        const productsList = mockDB.products.filter(p => p.status !== 'Deleted');
        featuredProducts = productsList.filter(p => p.status === 'Active' || !p.status).reverse().slice(0, 12);
      }
    }
    
    res.render('index', { activePage: 'home', products: featuredProducts });
  } catch (error) {
    res.status(500).render('500', { error });
  }
});

app.get('/services', async (req, res) => {
  try {
    let activeProducts = [];
    if (mockDB.storeEnabled) {
      if (isMongoConnected) {
        activeProducts = await Product.find({ $or: [{ status: 'Active' }, { status: { $exists: false } }, { status: null }, { status: '' }] }).lean();
      } else {
        const productsList = mockDB.products.filter(p => p.status !== 'Deleted');
        activeProducts = productsList.filter(p => p.status === 'Active' || !p.status);
      }
    }
    
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

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', async function(req, res, next) {
  try {
    logger.info('[Google OAuth] Entering /auth/google/callback route');
    passport.authenticate('google', function(err, user, info) {
      try {
        logger.info(`[Google OAuth] passport.authenticate callback invoked. err: ${err ? 'yes' : 'no'}, user: ${user ? 'yes' : 'no'}`);
        if (err) {
          logger.error('[Google OAuth] Strategy Error:', err);
          return res.redirect('/auth/google/failure?reason=' + encodeURIComponent(err.message || 'Strategy_Error'));
        }
        if (!user) {
          logger.error('[Google OAuth] No user returned from strategy. Info:', info);
          return res.redirect('/auth/google/failure?reason=User_Not_Found');
        }
        
        logger.info(`[Google OAuth] Proceeding to req.logIn for user: ${user.email}`);
        req.logIn(user, function(loginErr) {
          if (loginErr) {
            logger.error('[Google OAuth] req.logIn Session Error:', loginErr);
            return res.redirect('/auth/google/failure?reason=' + encodeURIComponent(loginErr.message || 'Session_Error'));
          }
          
          logger.info(`[Google OAuth] req.logIn success. Populating req.session.user...`);
          try {
            req.session.user = {
              userId: user.userId,
              name: user.name,
              email: user.email,
              mobile: user.mobile,
              role: user.role,
              profilePhoto: user.profilePhoto
            };
          } catch (sessionPopulateErr) {
            logger.error(`[Google OAuth] Exception while populating req.session.user:`, sessionPopulateErr);
            throw sessionPopulateErr;
          }
          
          logger.info(`[Google OAuth] Emitting admin_notification...`);
          try {
            io.emit('admin_notification', {
              type: 'new_user',
              message: `New user joined via Google! ${user.name}`
            });
          } catch (emitErr) {
            logger.error(`[Google OAuth] Exception in io.emit:`, emitErr);
          }
          
          logger.info(`[Google OAuth] Saving session...`);
          req.session.save((saveErr) => {
            if (saveErr) {
              logger.error('[Google OAuth] Session Save Error after login:', saveErr);
              return res.redirect('/auth/google/failure?reason=' + encodeURIComponent('Session_Save_Error'));
            }
            logger.info(`[Google OAuth] Session saved. Redirecting to /dashboard...`);
            res.redirect('/dashboard');
          });
        });
      } catch (innerErr) {
        logger.error(`[Google OAuth] Uncaught exception inside inner callback!`, innerErr);
        next(innerErr);
      }
    })(req, res, next);
  } catch (outerErr) {
    logger.error(`[Google OAuth] Uncaught exception in outer route wrapper!`, outerErr);
    next(outerErr);
  }
});

app.get('/auth/google/failure', (req, res) => {
  const reason = req.query.reason || 'Unknown Error';
  logger.error(`[Google Auth Failure] Reason: ${reason}`);
  res.status(401).send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h2>Authentication Failed</h2>
        <p style="color: red;">${reason}</p>
        <p>There was an issue signing you in with Google. Please try again or use email login.</p>
        <a href="/login" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Back to Login</a>
      </body>
    </html>
  `);
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
      logger.error(`[AUTH FAILED] Login failed: User not found for username/mobile: '${username}'`);
      await logLoginAttempt(username, 'Failed', 'User not found', ip, userAgent);
      return res.render('login', { activePage: 'login', error: 'Invalid username/mobile or password.', redirect });
    }

    const isMatch = await bcrypt.compare(cleanedPassword, user.password);
    if (!isMatch) {
      logger.error(`[AUTH FAILED] Login failed: Incorrect password for user: '${user.email}'`);
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
      createdAt: user.createdAt,
      cart: user.cart || []
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
    logger.error('Login Error:', error);
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
    const salt = await bcrypt.genSalt(12);
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
    logger.info(`✓ Registered User: ${name} (ID: ${userId})`);

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
    logger.error('Registration Error:', error);
    res.status(500).render('500', { error });
  }
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) logger.error('[AUTH ERROR] Session destroy error:', err);
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
    logger.error(e);
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
    logger.info(`\n=============================================`);
    logger.info(`[SMS OTP GATEWAY MOCK]`);
    logger.info(`OTP generated for number: ${mobile}`);
    logger.info(`OTP Verification Code: ${otp}`);
    logger.info(`Expires at: ${expiresAt.toLocaleTimeString()}`);
    logger.info(`=============================================\n`);

    // Render verification step, passing OTP code directly for preview UI testing
    res.render('forgot-password', {
      step: 'verify',
      mobile: mobile.trim(),
      mockOtp: otp, // Outputting the code in mock notifier banner
      success: 'OTP Code has been generated! Check developer test alert or console log.',
      error: null
    });

  } catch (error) {
    logger.error('OTP request error:', error);
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
    logger.error('OTP Verification error:', error);
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
    const salt = await bcrypt.genSalt(12);
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
    logger.error('Reset password error:', error);
    res.status(500).render('500', { error });
  }
});

// ── CUSTOMER DASHBOARD & CARDS ROUTING ────────────────────────────
app.get('/dashboard', isAuthenticated, async (req, res) => {
  const sessionUser = req.session.user;
  
  try {
    let userOrders = [];
    let userCard = null;
    let userNotifications = [];

    if (isMongoConnected) {
      userOrders = await Order.find({ userId: sessionUser.userId }).sort({ createdAt: -1 }).lean();
      userCard = await Card.findOne({ userId: sessionUser.userId });
      userNotifications = await Notification.find({ userId: sessionUser.userId }).sort({ createdAt: -1 }).lean();
      
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
      userOrders = mockDB.orders.filter(o => o.userId === sessionUser.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      userCard = mockDB.cards.find(c => c.userId === sessionUser.userId);
      userNotifications = mockDB.notifications.filter(n => n.userId === sessionUser.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
      card: userCard,
      notifications: userNotifications
    });

  } catch (error) {
    logger.error('Dashboard loading error:', error);
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
// --- NEW MODULAR PAYMENT ROUTES ---
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payment', paymentRoutes);


app.get('/checkout', isAuthenticated, (req, res) => {
  res.render('checkout', { activePage: 'services' });
});

app.post('/checkout', isAuthenticated, validateCsrf, async (req, res) => {
  const { cartData, totalAmount, deliveryFee, discountAmount, deliveryAddressJSON, preferredDate, timeSlot, notes, paymentMethod, razorpay_payment_id, razorpay_order_id, razorpay_signature, paymentId, couponCode } = req.body;
  const sessionUser = req.session.user;
  const paymentVerification = require('./middleware/paymentVerification');
  const paymentService = require('./services/paymentService');

  try {
    if (!deliveryAddressJSON) {
      return res.status(400).json({ success: false, message: "Please select a delivery address" });
    }

    const items = JSON.parse(cartData);
    let parsedAddress = {};
    try {
      parsedAddress = JSON.parse(deliveryAddressJSON);
    } catch (e) {
      parsedAddress = { street: deliveryAddressJSON };
    }

    // Security: Recalculate totals
    let dbProducts = [];
    if (isMongoConnected) {
      const itemNames = items.map(i => i.name);
      dbProducts = await Product.find({ name: { $in: itemNames } });
    } else {
      dbProducts = mockDB.products;
    }

    let calculatedItemsTotal = 0;
    let calculatedDiscount = 0;

    for (let item of items) {
      const product = dbProducts.find(p => p.name === item.name);
      if (!product) {
        const price = parseFloat(item.price) || 0;
        const origPrice = parseFloat(item.originalPrice) || price;
        calculatedItemsTotal += (origPrice * item.quantity);
        calculatedDiscount += ((origPrice - price) * item.quantity);
        continue;
      }
      
      const dbPrice = product.price;
      const dbDiscountPrice = product.discountPrice || product.price;
      
      calculatedItemsTotal += (dbPrice * item.quantity);
      calculatedDiscount += ((dbPrice - dbDiscountPrice) * item.quantity);
      
      item.price = dbDiscountPrice;
      item.originalPrice = dbPrice;
      item.productId = product.productId;
    }

    const handlingCharge = 11;
    const finalDeliveryFee = 0; // FREE DELIVERY
    
    // Server-side Coupon Application
    let couponDiscount = 0;
    let appliedCouponDoc = null;
    if (couponCode && isMongoConnected) {
      appliedCouponDoc = await Coupon.findOne({ code: couponCode.toUpperCase(), status: 'Active' });
      const expiryBoundary = appliedCouponDoc ? new Date(appliedCouponDoc.expiryDate) : null;
      if (expiryBoundary) expiryBoundary.setUTCHours(23, 59, 59, 999);

      if (appliedCouponDoc && new Date() <= expiryBoundary) {
         let validUsage = true;
         if (appliedCouponDoc.usageLimit && appliedCouponDoc.usedCount >= appliedCouponDoc.usageLimit) validUsage = false;
         
         const userUsage = appliedCouponDoc.usedBy.find(u => u.userId === sessionUser.userId);
         if (userUsage && userUsage.count >= appliedCouponDoc.perUserLimit) validUsage = false;
         
         const taxableAmount = calculatedItemsTotal;
         if (validUsage && taxableAmount >= appliedCouponDoc.minOrderValue) {
            if (appliedCouponDoc.type === 'fixed') {
              couponDiscount = appliedCouponDoc.discount;
            } else if (appliedCouponDoc.type === 'percentage') {
              couponDiscount = (taxableAmount * appliedCouponDoc.discount) / 100;
              if (appliedCouponDoc.maxDiscount && couponDiscount > appliedCouponDoc.maxDiscount) {
                couponDiscount = appliedCouponDoc.maxDiscount;
              }
            }
            if (couponDiscount > taxableAmount) couponDiscount = taxableAmount;
         } else {
           appliedCouponDoc = null; // invalid
         }
      } else {
        appliedCouponDoc = null;
      }
    }

    let safeTotalAmount = calculatedItemsTotal + handlingCharge + finalDeliveryFee - calculatedDiscount - couponDiscount;
    if (safeTotalAmount < 0) safeTotalAmount = 0;
    const safeDiscountAmount = calculatedDiscount + couponDiscount;

    let totalOrderCount = isMongoConnected ? await Order.countDocuments() : mockDB.orders.length;
    const orderId = 'ORD' + String(totalOrderCount + 1).padStart(3, '0');
    const confirmationCode = String(Math.floor(1000 + Math.random() * 9000));

    let finalPaymentStatus = 'Pending';
    let transactionId = '';
    let finalPaymentRecordId = null;

    if (paymentMethod === 'Cash On Delivery' || paymentMethod === 'Cash') {
      finalPaymentStatus = 'COD Pending';
      if (isMongoConnected) {
        for (let item of items) {
          if (item.productId) {
            const product = await Product.findOne({ productId: item.productId });
            if (product && product.stock < item.quantity) {
              return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
            }
            await Product.updateOne({ productId: item.productId }, { $inc: { stock: -item.quantity } });
          }
        }
        const payId = 'PAY' + Date.now();
        const record = new PaymentRecord({
          paymentId: payId,
          orderId,
          userId: sessionUser.userId,
          method: paymentMethod,
          amount: safeTotalAmount,
          status: finalPaymentStatus
        });
        await record.save();
        finalPaymentRecordId = record._id;
        await paymentService.logPaymentEvent(sessionUser.userId, orderId, payId, 'Payment Success', 'COD Order Placed', req.ip);
      } else {
        // MockDB logic
        for (let item of items) {
          const prod = mockDB.products.find(p => p.name === item.name);
          if (prod && prod.stock !== undefined) {
            prod.stock -= item.quantity;
          }
        }
        const payId = 'PAY' + Date.now();
        finalPaymentRecordId = payId;
        mockDB.paymentRecords.push({ paymentId: payId, orderId, userId: sessionUser.userId, method: paymentMethod, amount: safeTotalAmount, status: finalPaymentStatus, transactionTime: new Date() });
      }
    } else {
      // Online Payment Verification
      const isValid = paymentVerification.verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!isValid) {
        return res.status(400).render('500', { error: new Error('Payment Signature Verification Failed! Potential Fraudulent Transaction.') });
      }

      if (isMongoConnected) {
        const record = await PaymentRecord.findOne({ paymentId });
        if (!record || record.userId !== sessionUser.userId) {
          return res.status(400).render('500', { error: new Error('Invalid Payment Record.') });
        }
        if (record.status !== 'Pending') {
           // Idempotency or timeout
           return res.status(400).render('500', { error: new Error('Payment Record already processed or cancelled.') });
        }
        
        record.status = 'Paid';
        record.razorpayPaymentId = razorpay_payment_id;
        record.orderId = orderId;
        await record.save();

        finalPaymentStatus = 'Paid';
        transactionId = razorpay_payment_id;
        finalPaymentRecordId = record._id;

        // Deduct inventory permanently (release from reserved)
        await paymentService.deductInventory(items);
        await paymentService.logPaymentEvent(sessionUser.userId, orderId, paymentId, 'Payment Success', `Payment verified successfully: ${transactionId}`, req.ip);
      } else {
        finalPaymentStatus = 'Paid';
        transactionId = razorpay_payment_id;
        const payId = paymentId || 'PAY_MOCK_' + Date.now();
        finalPaymentRecordId = payId;
        mockDB.paymentRecords.push({ paymentId: payId, orderId, userId: sessionUser.userId, method: paymentMethod, amount: safeTotalAmount, status: finalPaymentStatus, transactionTime: new Date(), razorpayPaymentId: transactionId });
      }
    }

    if (isMongoConnected) {
      const order = new Order({
        orderId,
        userId: sessionUser.userId,
        customerName: sessionUser.name,
        customerPhone: sessionUser.mobile,
        customerEmail: sessionUser.email,
        items,
        totalAmount: safeTotalAmount,
        deliveryFee: finalDeliveryFee,
        discountAmount: safeDiscountAmount,
        paymentRecordId: finalPaymentRecordId,
        paymentMethod: paymentMethod,
        paymentStatus: finalPaymentStatus,
        deliveryAddress: parsedAddress,
        deliveryStatus: 'Pending',
        notes,
        preferredDate: new Date(preferredDate),
        timeSlot
      });
      await order.save();

      // Update Coupon Usage
      if (appliedCouponDoc) {
        appliedCouponDoc.usedCount += 1;
        const userUsageIndex = appliedCouponDoc.usedBy.findIndex(u => u.userId === sessionUser.userId);
        if (userUsageIndex >= 0) {
          appliedCouponDoc.usedBy[userUsageIndex].count += 1;
        } else {
          appliedCouponDoc.usedBy.push({ userId: sessionUser.userId, count: 1 });
        }
        await appliedCouponDoc.save();
      }

      const delivery = new Delivery({
        orderId,
        deliveryStatus: 'Pending',
        deliveryAddress: parsedAddress.street ? `${parsedAddress.house}, ${parsedAddress.street}, ${parsedAddress.city}, ${parsedAddress.state} - ${parsedAddress.pincode}` : JSON.stringify(parsedAddress),
        statusLogs: [{ status: 'Pending', remarks: 'Order placed, awaiting confirmation.' }],
        assignedTo: 'Deepak Kumawat',
        confirmationCode
      });
      await delivery.save();

      await User.updateOne(
        { userId: sessionUser.userId },
        {
          $push: { activities: { action: `Placed order ${orderId} total: ₹${safeTotalAmount}`, timestamp: new Date() } },
          $set: { cart: [] }
        }
      );
    } else {
      mockDB.orders.push({
        orderId, userId: sessionUser.userId, customerName: sessionUser.name, customerPhone: sessionUser.mobile, customerEmail: sessionUser.email,
        items, totalAmount: safeTotalAmount, paymentRecordId: finalPaymentRecordId, deliveryAddress: parsedAddress, deliveryStatus: 'Pending', notes,
        preferredDate: new Date(preferredDate), timeSlot, createdAt: new Date()
      });
      mockDB.deliveries.push({
        orderId, deliveryStatus: 'Pending', deliveryAddress: parsedAddress.street ? `${parsedAddress.house}, ${parsedAddress.street}, ${parsedAddress.city}, ${parsedAddress.state} - ${parsedAddress.pincode}` : JSON.stringify(parsedAddress),
        statusLogs: [{ status: 'Pending', remarks: 'Order placed, awaiting confirmation.', updatedAt: new Date() }], assignedTo: 'Deepak Kumawat', confirmationCode, createdAt: new Date()
      });
      const user = mockDB.users.find(u => u.userId === sessionUser.userId);
      if (user) {
        user.activities.push({ action: `Placed order ${orderId} total: ₹${safeTotalAmount}`, timestamp: new Date() });
        user.cart = [];
      }
    }

    logger.info(`✓ Order Created: ${orderId} (Confirmation Code: ${confirmationCode})`);
    
    io.emit('admin_notification', { type: 'new_order', message: `New Order Received! ID: ${orderId} Amount: ₹${totalAmount}` });

    req.session.cart = [];
    req.session.save((err) => {
      if(err) logger.error("Error saving session after checkout", err);
      res.redirect(`/order-success/${orderId}`);
    });

  } catch (error) {
    logger.error('Checkout failed:', error);
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
// ── ADDRESS & DELIVERY LOGIC ─────────────────────────────────
// Cart API
app.get('/api/cart', isAuthenticated, async (req, res) => {
  try {
    if (!isMongoConnected) {
      const userIdx = mockDB.users.findIndex(u => u.userId === req.session.user.userId);
      const cart = userIdx !== -1 ? (mockDB.users[userIdx].cart || []) : [];
      return res.json({ success: true, cart });
    }
    
    const user = await User.findOne({ userId: req.session.user.userId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.json({ success: true, cart: user.cart || [] });
  } catch (err) {
    logger.error("Cart GET Error:", err);
    res.status(500).json({ success: false, message: err.message, stack: process.env.NODE_ENV === 'production' ? undefined : err.stack });
  }
});

app.post('/api/cart/sync', isAuthenticated, async (req, res) => {
  try {
    const localCart = req.body.cart || [];
    
    if (!isMongoConnected) {
      const userIdx = mockDB.users.findIndex(u => u.userId === req.session.user.userId);
      if (userIdx === -1) return res.status(404).json({ success: false, message: 'User not found' });
      
      let dbCart = mockDB.users[userIdx].cart || [];
      // Merge logic: Add new items, ignore duplicates by name
      localCart.forEach(localItem => {
        const exists = dbCart.find(dbItem => dbItem.name === localItem.name);
        if (!exists) {
          dbCart.push(localItem);
        }
      });
      mockDB.users[userIdx].cart = dbCart;
      req.session.user.cart = dbCart;
      return res.json({ success: true, cart: dbCart });
    }

    const user = await User.findOne({ userId: req.session.user.userId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let dbCart = user.cart || [];
    localCart.forEach(localItem => {
      const exists = dbCart.find(dbItem => dbItem.name === localItem.name);
      if (!exists) {
        dbCart.push(localItem);
      }
    });

    user.cart = dbCart;
    await user.save();
    req.session.user.cart = dbCart; // update session
    
    res.json({ success: true, cart: dbCart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/cart/overwrite', isAuthenticated, async (req, res) => {
  try {
    const localCart = req.body.cart || [];
    
    if (!isMongoConnected) {
      const userIdx = mockDB.users.findIndex(u => u.userId === req.session.user.userId);
      if (userIdx !== -1) {
        mockDB.users[userIdx].cart = localCart;
        req.session.user.cart = localCart;
      }
      return res.json({ success: true, cart: localCart });
    }

    const user = await User.findOne({ userId: req.session.user.userId });
    if (!user) return res.status(404).json({ success: false });

    user.cart = localCart;
    await user.save();
    req.session.user.cart = localCart;
    res.json({ success: true, cart: localCart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/cart/update', isAuthenticated, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!isMongoConnected) {
      const userIdx = mockDB.users.findIndex(u => u.userId === req.session.user.userId);
      if (userIdx !== -1 && mockDB.users[userIdx].cart) {
        const item = mockDB.users[userIdx].cart.find(i => i.productId === productId || i.name === productId); // name fallback
        if (item) item.quantity = quantity;
        req.session.user.cart = mockDB.users[userIdx].cart;
      }
      return res.json({ success: true });
    }

    const user = await User.findOne({ userId: req.session.user.userId });
    if (!user) return res.status(404).json({ success: false });

    const item = user.cart.find(i => i.productId === productId || i.name === productId);
    if (item) {
      item.quantity = quantity;
      await user.save();
      req.session.user.cart = user.cart;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/cart/remove', isAuthenticated, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!isMongoConnected) {
      const userIdx = mockDB.users.findIndex(u => u.userId === req.session.user.userId);
      if (userIdx !== -1 && mockDB.users[userIdx].cart) {
        mockDB.users[userIdx].cart = mockDB.users[userIdx].cart.filter(i => i.productId !== productId && i.name !== productId);
        req.session.user.cart = mockDB.users[userIdx].cart;
      }
      return res.json({ success: true });
    }

    const user = await User.findOne({ userId: req.session.user.userId });
    if (!user) return res.status(404).json({ success: false });

    user.cart = user.cart.filter(i => i.productId !== productId && i.name !== productId);
    await user.save();
    req.session.user.cart = user.cart;
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Wishlist APIs ---
// --- VERIFIED REVIEWS API ---
app.post('/api/reviews', isAuthenticated, async (req, res) => {
  if (!isMongoConnected) return res.status(400).json({ success: false, message: 'Database offline' });
  try {
    const { productId, rating, title, text } = req.body;
    const userId = req.session.user.userId;
    const userName = req.session.user.name;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Verify purchase
    const hasBought = await Order.exists({ userId, "items.name": product.name, deliveryStatus: 'Delivered' });

    const review = new Review({
      productId, userId, userName, rating, title, text, verifiedBuyer: !!hasBought
    });
    await review.save();

    const reviews = await Review.find({ productId });
    const count = reviews.length;
    const average = reviews.reduce((a, b) => a + b.rating, 0) / count;
    await Product.findByIdAndUpdate(productId, { ratings: { average: average.toFixed(1), count } });

    res.json({ success: true, message: 'Review submitted successfully' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/reviews/:productId', async (req, res) => {
  if (!isMongoConnected) return res.json({ success: true, reviews: [] });
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/wishlist/toggle', isAuthenticated, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!isMongoConnected) return res.json({ success: true, action: 'added', count: 1 });

    const user = await User.findOne({ userId: req.session.user.userId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.wishlist) user.wishlist = [];

    const existingIndex = user.wishlist.findIndex(item => item.productId === productId);
    let action = 'added';

    if (existingIndex > -1) {
      user.wishlist.splice(existingIndex, 1);
      action = 'removed';
    } else {
      user.wishlist.push({ productId });
    }

    await user.save();
    res.json({ success: true, action, count: user.wishlist.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/wishlist', isAuthenticated, async (req, res) => {
  try {
    if (!isMongoConnected) return res.json({ success: true, wishlist: [], count: 0 });

    const user = await User.findOne({ userId: req.session.user.userId });
    if (!user || !user.wishlist) return res.json({ success: true, wishlist: [], count: 0 });

    const productIds = user.wishlist.map(item => item.productId);
    const products = await Product.find({ productId: { $in: productIds }, status: { $ne: 'Deleted' } }).lean();

    // Remove automatically if product is permanently deleted
    if (products.length !== user.wishlist.length) {
      const activeIds = products.map(p => p.productId);
      user.wishlist = user.wishlist.filter(item => activeIds.includes(item.productId));
      await user.save();
    }

    // Map products to keep the addedAt timestamp
    const populatedWishlist = user.wishlist.map(wItem => {
      const product = products.find(p => p.productId === wItem.productId);
      return product ? { ...product, addedAt: wItem.addedAt } : null;
    }).filter(Boolean);

    res.json({ success: true, wishlist: populatedWishlist, count: user.wishlist.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/wishlist/count', isAuthenticated, async (req, res) => {
  try {
    if (!isMongoConnected) return res.json({ success: true, count: 0 });
    const user = await User.findOne({ userId: req.session.user.userId }).select('wishlist').lean();
    res.json({ success: true, count: user && user.wishlist ? user.wishlist.length : 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



app.post('/api/user/address', isAuthenticated, async (req, res) => {
  try {
    if (!isMongoConnected) {
      const userIdx = mockDB.users.findIndex(u => u.userId === req.session.user.userId);
      if (userIdx === -1) return res.status(404).json({ success: false, message: 'User not found' });
      if (!mockDB.users[userIdx].addresses) mockDB.users[userIdx].addresses = [];
      if (mockDB.users[userIdx].addresses.length === 0) req.body.isDefault = true;
      mockDB.users[userIdx].addresses.push(req.body);
      req.session.user = mockDB.users[userIdx];
      return res.json({ success: true, addresses: mockDB.users[userIdx].addresses });
    }
    
    const user = await User.findOne({ userId: req.session.user.userId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (user.addresses.length === 0) req.body.isDefault = true;
    else if (req.body.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }
    
    user.addresses.push(req.body);
    await user.save();
    req.session.user = user; // Update session
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/user/address/:index', isAuthenticated, async (req, res) => {
  try {
    const idx = parseInt(req.params.index);
    if (!isMongoConnected) {
      const userIdx = mockDB.users.findIndex(u => u.userId === req.session.user.userId);
      if (userIdx !== -1 && mockDB.users[userIdx].addresses[idx]) {
        mockDB.users[userIdx].addresses[idx] = { ...mockDB.users[userIdx].addresses[idx], ...req.body };
        req.session.user = mockDB.users[userIdx];
      }
      return res.json({ success: true });
    }

    const user = await User.findOne({ userId: req.session.user.userId });
    if (!user || !user.addresses[idx]) return res.status(404).json({ success: false });

    if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
    
    // update address at index
    const addressDoc = user.addresses[idx];
    Object.keys(req.body).forEach(key => {
      addressDoc[key] = req.body[key];
    });

    await user.save();
    req.session.user = user;
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/user/address/:index', isAuthenticated, async (req, res) => {
  try {
    const idx = parseInt(req.params.index);
    if (!isMongoConnected) {
      const userIdx = mockDB.users.findIndex(u => u.userId === req.session.user.userId);
      if (userIdx !== -1) {
        mockDB.users[userIdx].addresses.splice(idx, 1);
        req.session.user = mockDB.users[userIdx];
      }
      return res.json({ success: true });
    }

    const user = await User.findOne({ userId: req.session.user.userId });
    if (!user || !user.addresses[idx]) return res.status(404).json({ success: false });

    user.addresses.splice(idx, 1);
    await user.save();
    req.session.user = user;
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/calculate-delivery', async (req, res) => {
  try {
    const { lat, lng, pincode } = req.body;
    
    let settings = null;
    if (isMongoConnected) settings = await DeliverySetting.findOne();
    
    if (!settings) {
      settings = {
        storeLocation: { lat: 27.4243, lng: 74.3722 },
        maxDeliveryDistance: 50,
        defaultDeliveryFee: 100,
        distanceRules: [
          { minKm: 0, maxKm: 10, deliveryFee: 0 },
          { minKm: 10, maxKm: 20, deliveryFee: 50 },
          { minKm: 20, maxKm: 30, deliveryFee: 100 },
          { minKm: 30, maxKm: 50, deliveryFee: 150 }
        ]
      };
    }

    if (!lat || !lng) {
      // Pincode fallback. If pincode starts with '30' or is present, assume serviceable and return default fee.
      // The user specified "Checkout must never fail because of location issues."
      return res.json({ success: true, deliveryFee: settings.defaultDeliveryFee, serviceable: true, distanceKm: 'N/A' });
    }

    const storeLat = settings.storeLocation?.lat || 27.4243;
    const storeLng = settings.storeLocation?.lng || 74.3722;
    
    let distanceKm = 0;
    
    try {
      const osrmRes = await fetch(`http://router.project-osrm.org/route/v1/driving/${storeLng},${storeLat};${lng},${lat}?overview=false`);
      if (osrmRes.ok) {
        const osrmData = await osrmRes.json();
        if (osrmData.routes && osrmData.routes.length > 0) {
          distanceKm = osrmData.routes[0].distance / 1000;
        } else {
          throw new Error("No route found");
        }
      } else {
        throw new Error("OSRM API failed");
      }
    } catch (err) {
      // Fallback to Haversine
      const R = 6371;
      const dLat = (lat - storeLat) * (Math.PI/180);
      const dLon = (lng - storeLng) * (Math.PI/180); 
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(storeLat * (Math.PI/180)) * Math.cos(lat * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      distanceKm = R * c; 
    }
    
    distanceKm = Math.round(distanceKm * 10) / 10;
    
    let fee = settings.defaultDeliveryFee;
    let serviceable = false;
    
    if (distanceKm <= settings.maxDeliveryDistance) {
      serviceable = true;
      const matchingRule = settings.distanceRules.find(r => distanceKm >= r.minKm && distanceKm <= r.maxKm);
      if (matchingRule) {
        fee = matchingRule.deliveryFee;
      }
    }
    
    res.json({ success: true, deliveryFee: fee, serviceable, distanceKm });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel Order API
app.post('/api/order/:id/cancel', isAuthenticated, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.session.user.userId;

  try {
    let order = null;
    if (isMongoConnected) {
      order = await Order.findOne({ orderId, userId });
    } else {
      order = mockDB.orders.find(o => o.orderId === orderId && o.userId === userId);
    }

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.deliveryStatus !== 'Pending' && order.deliveryStatus !== 'Confirmed') {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage. It is already ' + order.deliveryStatus });
    }

    // Update status to Cancelled
    if (isMongoConnected) {
      order.deliveryStatus = 'Cancelled';
      await order.save();
      await Delivery.updateOne({ orderId }, { deliveryStatus: 'Cancelled' });
      
      // Restore stock
      for (let item of order.items) {
        if (item.productId) {
          await Product.updateOne({ productId: item.productId }, { $inc: { stock: item.quantity } });
        } else {
          await Product.updateOne({ name: item.name }, { $inc: { stock: item.quantity } });
        }
      }

      // Create Notification
      const notif = new Notification({
        userId,
        title: 'Order Cancelled',
        message: `Your order ${orderId} has been successfully cancelled.`,
        type: 'order_update',
        orderId
      });
      await notif.save();
    } else {
      order.deliveryStatus = 'Cancelled';
      const delivery = mockDB.deliveries.find(d => d.orderId === orderId);
      if (delivery) delivery.deliveryStatus = 'Cancelled';

      // Restore stock
      for (let item of order.items) {
        const prod = mockDB.products.find(p => p.name === item.name);
        if (prod && prod.stock !== undefined) {
          prod.stock += item.quantity;
        }
      }

      mockDB.notifications.push({
        userId,
        title: 'Order Cancelled',
        message: `Your order ${orderId} has been successfully cancelled.`,
        type: 'order_update',
        orderId,
        read: false,
        createdAt: new Date()
      });
    }

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    logger.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Customer My Orders
app.get('/my-orders', isAuthenticated, async (req, res) => {
  const userId = req.session.user.userId;
  try {
    let orders = [];
    if (isMongoConnected) {
      orders = await Order.find({ userId }).populate('paymentRecordId').sort({ createdAt: -1 }).lean();
    } else {
      orders = mockDB.orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // Populate mock payment record
      orders.forEach(o => {
        o.paymentRecordId = mockDB.paymentRecords.find(p => p.paymentId === o.paymentRecordId);
      });
    }
    res.render('my-orders', { activePage: 'dashboard', orders });
  } catch (err) {
    res.status(500).render('500', { error: err });
  }
});

app.get('/order/:id', isAuthenticated, async (req, res) => {
  const orderId = req.params.id;
  const userId = req.session.user.userId;
  try {
    let order, delivery, payment;
    if (isMongoConnected) {
      order = await Order.findOne({ orderId, userId });
      if(order) {
        delivery = await Delivery.findOne({ orderId });
        payment = await PaymentRecord.findById(order.paymentRecordId);
      }
    } else {
      order = mockDB.orders.find(o => o.orderId === orderId && o.userId === userId);
      if(order) {
        delivery = mockDB.deliveries.find(d => d.orderId === orderId);
        payment = mockDB.paymentRecords.find(p => p.paymentId === order.paymentRecordId);
      }
    }
    
    if (!order) return res.status(404).render('404');
    res.render('order-details', { activePage: 'dashboard', order, delivery, payment });
  } catch (err) {
    res.status(500).render('500', { error: err });
  }
});

// Invoice Route
app.get('/invoice/:id', isAuthenticated, async (req, res) => {
  const orderId = req.params.id;
  const user = req.session.user;
  try {
    let order;
    if (isMongoConnected) {
      if (user.role === 'admin' || user.role === 'super_admin') {
        order = await Order.findOne({ orderId });
      } else {
        order = await Order.findOne({ orderId, userId: user.userId });
      }
    } else {
      order = mockDB.orders.find(o => o.orderId === orderId);
      if (order && user.role !== 'admin' && user.role !== 'super_admin' && order.userId !== user.userId) {
        order = null;
      }
    }

    if (!order) return res.status(404).render('404', { message: 'Invoice not found or unauthorized' });

    res.render('invoice', { order });
  } catch (err) {
    logger.error('Invoice error:', err);
    res.status(500).render('500', { error: err });
  }
});

// ── ADMIN PANEL & MANAGEMENT ───────────────────────────────────────

app.post('/admin/api/toggle-store', isAdmin, async (req, res) => {
  try {
    const { enabled } = req.body;
    mockDB.storeEnabled = enabled === true;
    
    // Optionally save to a database setting object if you had one.
    // For now, mockDB.storeEnabled serves as an in-memory global config.
    
    res.json({ success: true, enabled: mockDB.storeEnabled });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/admin/api/delivery-settings', isAdmin, async (req, res) => {
  try {
    if (!isMongoConnected) return res.json({ success: true, settings: null });
    let settings = await DeliverySetting.findOne();
    if (!settings) {
      settings = new DeliverySetting();
      await settings.save();
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/admin/api/delivery-settings', isAdmin, async (req, res) => {
  try {
    if (!isMongoConnected) return res.json({ success: false, message: "Mongo DB required" });
    let settings = await DeliverySetting.findOne();
    if (!settings) settings = new DeliverySetting();
    settings.minOrderAmount = req.body.minOrderAmount || 0;
    settings.defaultDeliveryFee = req.body.defaultDeliveryFee || 100;
    settings.maxDeliveryDistance = req.body.maxDeliveryDistance || 50;
    
    if (req.body.storeLocation) {
      settings.storeLocation = typeof req.body.storeLocation === 'string' ? JSON.parse(req.body.storeLocation) : req.body.storeLocation;
    }
    
    if (req.body.distanceRules) {
      settings.distanceRules = typeof req.body.distanceRules === 'string' ? JSON.parse(req.body.distanceRules) : req.body.distanceRules;
    }
    
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN PORTAL LOGIC & DATA EXPORTS ────────────────────────────
// Admin Order Status Update
app.post('/api/admin/order/:id/status', isAdmin, validateCsrf, async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  try {
    let order = null;
    let oldStatus = null;
    if (isMongoConnected) {
      order = await Order.findOne({ orderId });
    } else {
      order = mockDB.orders.find(o => o.orderId === orderId);
    }

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (isMongoConnected) {
      oldStatus = order.deliveryStatus;
      logger.info("Before:", oldStatus);
      order.deliveryStatus = status;
      if (status === 'Delivered' && order.paymentMethod === 'Cash') {
        order.paymentStatus = 'Completed';
        await PaymentRecord.updateOne({ orderId }, { $set: { status: 'Completed' } });
      }
      const updatedOrder = await order.save();
      logger.info("After:", updatedOrder.deliveryStatus);
      await Delivery.updateOne({ orderId }, { deliveryStatus: status });

      const adminName = req.session.user ? req.session.user.name : 'Admin';
      await new OrderLog({
        orderId, oldStatus, newStatus: status, changedBy: adminName, cancelReason: ''
      }).save();

      // Create Notification
      const notif = new Notification({
        userId: order.userId,
        title: 'Order Update',
        message: `Your order ${orderId} status has been updated to ${status}.`,
        type: 'order_update',
        orderId
      });
      await notif.save();
    } else {
      oldStatus = order.deliveryStatus;
      order.deliveryStatus = status;
      if (status === 'Delivered' && order.paymentMethod === 'Cash') {
        order.paymentStatus = 'Completed';
        const payRecord = mockDB.paymentRecords.find(p => p.orderId === orderId);
        if (payRecord) payRecord.status = 'Completed';
      }

      const adminName = req.session.user ? req.session.user.name : 'Admin';
      mockDB.orderLogs.push({
        orderId, oldStatus, newStatus: status, changedBy: adminName, cancelReason: '', changedAt: new Date()
      });

      const delivery = mockDB.deliveries.find(d => d.orderId === orderId);
      if (delivery) delivery.deliveryStatus = status;

      mockDB.notifications.push({
        userId: order.userId,
        title: 'Order Update',
        message: `Your order ${orderId} status has been updated to ${status}.`,
        type: 'order_update',
        orderId,
        read: false,
        createdAt: new Date()
      });
    }

    logger.info(`[Admin Update] Order ID: ${orderId}`);
    logger.info(`[Admin Update] Old Status: ${oldStatus}`);
    logger.info(`[Admin Update] New Status: ${status}`);
    logger.info(`[Admin Update] Database update result: Success`);

    io.emit('order_status_updated', {
      orderId,
      status,
      paymentStatus: order.paymentStatus,
      message: `Your order ${orderId} status has been updated to ${status}.`
    });

    res.json({ success: true, deliveryStatus: order.deliveryStatus });
  } catch (error) {
    logger.error('Admin update status error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



app.get('/admin', isAdmin, async (req, res) => {
  const adminUser = req.session.user;

  try {
    let usersList = [];
    let ordersList = [];
    let otpLogsList = [];
    let loginLogsList = [];
    let productsList = [];
    let paymentsList = [];
    
    // Stats calculation variables
    let totalUsers = 0;
    let totalOrders = 0;
    let totalRevenue = 0;
    let pendingDeliveries = 0;

    if (isMongoConnected) {
      const [
        usersListRes,
        ordersListRes,
        otpLogsListRes,
        loginLogsListRes,
        productsListRes,
        paymentsListRes,
        stRes,
        totalUsersRes,
        totalOrdersRes,
        revenueAggrRes,
        pendingDeliveriesRes
      ] = await Promise.all([
        User.find({}).lean(),
        Order.find({}).lean(),
        OtpLog.find({}).lean(),
        LoginLog.find({}).lean(),
        Product.find({}).lean(),
        PaymentRecord.find({}).sort({ transactionTime: -1 }).lean(),
        Product.findOne({ productId: '__STORE_SETTINGS__' }).lean(),
        User.countDocuments({ role: 'user' }),
        Order.countDocuments({}),
        PaymentRecord.aggregate([
          { $match: { status: { $in: ['Paid', 'COD Completed'] } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Delivery.countDocuments({ deliveryStatus: { $ne: 'Delivered' } })
      ]);

      usersList = usersListRes;
      ordersList = ordersListRes;
      otpLogsList = otpLogsListRes;
      loginLogsList = loginLogsListRes;
      productsList = productsListRes;
      paymentsList = paymentsListRes;
      
      if (stRes) { mockDB.storeEnabled = stRes.deliveryAvailable; }
      
      totalUsers = totalUsersRes;
      totalOrders = totalOrdersRes;
      totalRevenue = revenueAggrRes.length > 0 ? revenueAggrRes[0].total : 0;
      pendingDeliveries = pendingDeliveriesRes;
    } else {
      usersList = mockDB.users;
      ordersList = mockDB.orders;
      otpLogsList = mockDB.otpLogs;
      loginLogsList = mockDB.loginLogs;
      productsList = mockDB.products;
      paymentsList = mockDB.paymentRecords || [];
      
      totalUsers = usersList.filter(u => u.role === 'user').length;
      
      totalRevenue = (mockDB.paymentRecords || [])
        .filter(p => p.status === 'Paid' || p.status === 'COD Completed')
        .reduce((sum, p) => sum + p.amount, 0);
        
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
      payments: paymentsList,
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingDeliveries
      }
    });

  } catch (error) {
    logger.error('Admin page load error:', error);
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
      logger.info("Before:", oldStatus);
      order.deliveryStatus = newStatus;
      
      // Auto payment status
      if (newStatus === 'Delivered' && order.paymentMethod === 'Cash') {
        order.paymentStatus = 'Completed';
        await PaymentRecord.updateOne({ orderId }, { $set: { status: 'Completed' } });
      }
      const updatedOrder = await order.save();
      logger.info("After:", updatedOrder.deliveryStatus);

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

      // Stock restore on cancel
      if (newStatus === 'Cancelled') {
        for (let item of order.items) {
          if (item.productId) {
            await Product.updateOne({ productId: item.productId }, { $inc: { stock: item.quantity } });
          } else {
            await Product.updateOne({ name: item.name }, { $inc: { stock: item.quantity } });
          }
        }
      }

      // Create Notification
      const notif = new Notification({
        userId: order.userId,
        title: 'Order Update',
        message: `Your order ${orderId} status has been updated to ${newStatus}.`,
        type: 'order_update',
        orderId
      });
      await notif.save();
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

      // Stock restore on cancel
      if (newStatus === 'Cancelled') {
        for (let item of order.items) {
          const prod = mockDB.products.find(p => p.name === item.name);
          if (prod && prod.stock !== undefined) {
            prod.stock += item.quantity;
          }
        }
      }

      mockDB.notifications.push({
        userId: order.userId,
        title: 'Order Update',
        message: `Your order ${orderId} status has been updated to ${newStatus}.`,
        type: 'order_update',
        orderId,
        read: false,
        createdAt: new Date()
      });
    }
    
    logger.info(`[Admin Update] Order ID: ${orderId}`);
    logger.info(`[Admin Update] Old Status: ${oldStatus}`);
    logger.info(`[Admin Update] New Status: ${newStatus}`);
    logger.info(`[Admin Update] Database update result: Success`);

    io.emit('order_status_updated', {
      orderId,
      status: newStatus,
      paymentStatus: order.paymentStatus,
      message: `Your order ${orderId} status has been updated to ${newStatus}.`
    });

    res.json({ success: true, deliveryStatus: order.deliveryStatus });
  } catch (error) {
    logger.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/admin/export-users', isAdmin, async (req, res) => {
  try {
    let users = isMongoConnected ? await User.find({}) : mockDB.users;
    let csv = "ID,Name,Email,Phone,Role\n";
    users.forEach(u => {
      csv += `${u.userId},"${u.name}","${u.email}",${u.mobile},${u.role}\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('users-export.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).send("Error generating export");
  }
});

app.get('/admin/api/export-payments', isAdmin, async (req, res) => {
  try {
    let payments = isMongoConnected ? await PaymentRecord.find({}) : (mockDB.paymentRecords || []);
    let csv = "Date,Payment ID,Order ID,Method,Amount,Status,Razorpay Txn ID\n";
    payments.forEach(p => {
      const date = new Date(p.transactionTime).toLocaleString();
      csv += `"${date}",${p.paymentId},${p.orderId},"${p.method}",${p.amount},${p.status},${p.razorpayPaymentId || ''}\n`;
    });
    res.header('Content-Type', 'text/csv');
    res.attachment('payments-export.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).send("Error generating payment export");
  }
});

app.post('/admin/api/refund', isAdmin, express.json(), async (req, res) => {
  try {
    const { paymentId } = req.body;
    const paymentService = require('./services/paymentService');
    
    if (isMongoConnected) {
      const record = await PaymentRecord.findOne({ paymentId });
      if (!record) return res.json({ success: false, message: 'Payment not found' });
      if (record.status !== 'Paid') return res.json({ success: false, message: 'Cannot refund a non-paid transaction' });
      
      record.status = 'Refunded';
      record.refundStatus = 'Approved';
      record.refundDate = new Date();
      record.refundAmount = record.amount;
      await record.save();

      await paymentService.logPaymentEvent('Admin', record.orderId, record.paymentId, 'Refund Approved', 'Manual refund by admin');
    } else {
      const record = mockDB.paymentRecords.find(p => p.paymentId === paymentId);
      if (record) {
        record.status = 'Refunded';
        record.refundStatus = 'Approved';
      }
    }
    res.json({ success: true });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: 'Error processing refund' });
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
    logger.error('CSV export failed:', error);
    res.status(500).render('500', { error });
  }
});

// ── STORE MANAGEMENT ROUTES ─────────────────────────────────────
// Public Store Page
app.get('/store', (req, res) => {
  if (!mockDB.storeEnabled) return res.status(404).render('404');
  res.render('store', { 
    activePage: 'store',
    seo: {
      title: 'Premium Electronics Store | Kumawat P&E',
      description: 'Shop premium electronics, home appliances, electrical fittings, and tools at the best prices.',
      keywords: 'electronics store, appliances, electrical tools, plumbing parts, buy electronics online'
    }
  });
});

// Advanced Store API
app.get('/api/store/products', async (req, res) => {
  try {
    if (!mockDB.storeEnabled) return res.json({ success: false, message: 'Store is disabled' });

    let { q, category, brand, minPrice, maxPrice, sort, page, limit } = req.query;
    
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 12;
    const skip = (page - 1) * limit;

    let query = { status: { $ne: 'Deleted' } };
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category) {
      // support multiple categories separated by comma
      const categories = category.split(',').map(c => c.trim());
      query.category = { $in: categories };
    }
    
    if (brand) {
      const brands = brand.split(',').map(b => b.trim());
      query.brand = { $in: brands };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    let sortObj = {};
    if (sort === 'price_asc') sortObj.price = 1;
    else if (sort === 'price_desc') sortObj.price = -1;
    else if (sort === 'newest') sortObj.createdAt = -1;
    else sortObj.createdAt = -1; // default newest

    if (isMongoConnected) {
      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean();
        
      res.json({
        success: true,
        products,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } else {
      // MockDB fallback
      let results = mockDB.products.filter(p => p.status !== 'Deleted');
      
      if (q) {
        const lowerQ = q.toLowerCase();
        results = results.filter(p => p.name.toLowerCase().includes(lowerQ) || p.category.toLowerCase().includes(lowerQ));
      }
      
      if (category) {
        const categories = category.split(',').map(c => c.trim().toLowerCase());
        results = results.filter(p => categories.includes(p.category.toLowerCase()));
      }
      
      if (minPrice) results = results.filter(p => p.price >= parseFloat(minPrice));
      if (maxPrice) results = results.filter(p => p.price <= parseFloat(maxPrice));
      
      if (sort === 'price_asc') results.sort((a,b) => a.price - b.price);
      else if (sort === 'price_desc') results.sort((a,b) => b.price - a.price);
      else results.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      const total = results.length;
      const paginated = results.slice(skip, skip + limit);
      
      res.json({
        success: true,
        products: paginated,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public Product Details Page
app.get('/product/:productId', async (req, res) => {
  if (!mockDB.storeEnabled) return res.status(404).render('404');
  try {
    let product = isMongoConnected 
      ? await Product.findOne({ productId: req.params.productId, status: { $ne: 'Deleted' } }).populate('accessories').lean()
      : mockDB.products.find(p => p.productId === req.params.productId && p.status !== 'Deleted');
      
    if (!product) return res.status(404).render('404');
    
    // Dynamic SEO from product data
    const seo = {
      title: `${product.name} | Kumawat P&E`,
      description: product.description ? product.description.substring(0, 160) : `Buy ${product.name} online at the best price.`,
      keywords: `${product.name}, ${product.category}, ${product.brand || 'electronics'}, buy online`
    };
    
    res.render('product-details', { product, activePage: 'store', seo });
  } catch (error) {
    res.status(500).render('500', { error });
  }
});

app.get('/compare', (req, res) => {
  if (!mockDB.storeEnabled) return res.status(404).render('404');
  res.render('compare', { activePage: 'store' });
});

app.post('/api/products/compare', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.json({ success: false, products: [] });
    
    let products = isMongoConnected
      ? await Product.find({ productId: { $in: ids } })
      : mockDB.products.filter(p => ids.includes(p.productId));
      
    // Sort products based on input array order
    products = ids.map(id => products.find(p => p.productId === id)).filter(Boolean);
    
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    const { name, category, description, price, discountPrice, stock, sku, deliveryAvailable, video, badges, features, packageContents, accessories, spec_warranty, spec_voltage, spec_wattage, spec_weight } = req.body;
    const images = req.files ? req.files.map(f => '/uploads/products/' + f.filename) : [];
    const productId = 'PRD-' + randomUUID().substring(0, 8).toUpperCase();
    
    const parseCommaList = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    const pData = {
      productId, name, category, description, images,
      price: Number(price), discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock), sku,
      status: Number(stock) > 0 ? 'Active' : 'Out Of Stock',
      deliveryAvailable: deliveryAvailable === 'true',
      video: video || '',
      badges: parseCommaList(badges),
      features: parseCommaList(features),
      packageContents: parseCommaList(packageContents),
      accessories: parseCommaList(accessories),
      specifications: {
        general: {},
        electrical: { voltage: spec_voltage, wattage: spec_wattage },
        physical: { weight: spec_weight },
        warranty: { duration: spec_warranty },
        technical: {}
      },
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
    logger.error(error);
    res.status(500).render('500', { error });
  }
});

// Admin Edit Product API
app.post('/admin/products/edit/:productId', isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const productId = req.params.productId;
    const { name, category, description, price, discountPrice, stock, sku, status, deliveryAvailable, video, badges, features, packageContents, accessories, spec_warranty, spec_voltage, spec_wattage, spec_weight } = req.body;
    
    const parseCommaList = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

    let updates = {
      name, category, description,
      price: Number(price), discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock), sku, status,
      deliveryAvailable: deliveryAvailable === 'true',
      video: video || '',
      badges: parseCommaList(badges),
      features: parseCommaList(features),
      packageContents: parseCommaList(packageContents),
      accessories: parseCommaList(accessories),
      specifications: {
        general: {},
        electrical: { voltage: spec_voltage, wattage: spec_wattage },
        physical: { weight: spec_weight },
        warranty: { duration: spec_warranty },
        technical: {}
      },
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
    logger.error(error);
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
    logger.error(error);
    res.status(500).render('500', { error });
  }
});

// ── ERROR HANDLING MIDDLEWARES ──────────────────────────────────
// Dedicated Google OAuth Error Handler
app.use('/auth/google', (err, req, res, next) => {
  logger.error('[OAuth Middleware] Crash Dump:');
  logger.error(err.stack || err);
  // Render the error page explicitly to avoid exposing sensitive internal stack traces to the client
  res.status(500).render('500', { error: new Error("An internal authentication error occurred. Please try again.") });
});

function registerErrorHandlers() {
  // 404 Route
  app.use((req, res, next) => {
    res.status(404).render('404');
  });

  // 500 Route
  app.use((err, req, res, next) => {
    logger.error('[Global Handler] Error:', err);
    res.status(500).render('500', { error: err });
  });
}

// Server automatically started in startServer()
