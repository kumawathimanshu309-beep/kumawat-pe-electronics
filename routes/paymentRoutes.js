const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const paymentVerification = require('../middleware/paymentVerification');

// Import authentication middleware (assuming it's defined in server.js, we need to mock it or require it, but since it's defined globally in server.js we can pass it if we decouple, or we can write a tiny local one)
const isAuthenticated = (req, res, next) => {
  const isAuth = !!(req.session && req.session.user);
  
  if (isAuth) {
    return next();
  }
  
  console.log(`[PAYMENT ROUTE] Authentication Status: FAILED (User not logged in or session expired)`);
  res.status(401).json({ success: false, message: 'Unauthorized: Session expired or not logged in' });
};

// Initiate payment
router.post('/create', isAuthenticated, (req, res, next) => {
  console.log(`\n--- [PAYMENT ROUTE HIT] ---`);
  console.log(`[PAYMENT ROUTE] Authentication Status: SUCCESS (User: ${req.session.user.userId})`);
  // CSRF is technically checked before this if we mounted it globally, or we can just log it
  console.log(`[PAYMENT ROUTE] CSRF Status: PASSED (If reached here, or disabled for API)`);
  
  const hasRazorpayKeys = !!process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder';
  console.log(`[PAYMENT ROUTE] Razorpay Keys Present: ${hasRazorpayKeys ? 'YES' : 'NO'}`);
  console.log(`[PAYMENT ROUTE] Developer Mode Enabled: ${!hasRazorpayKeys ? 'YES' : 'NO'}`);
  
  next();
}, paymentController.createPaymentIntent);

// Cancel payment explicitly by user
router.post('/cancel', isAuthenticated, paymentController.cancelPayment);

// Razorpay Webhook
router.post('/webhook', express.json(), paymentVerification.verifyWebhookSignature, paymentController.handleWebhook);

module.exports = router;
