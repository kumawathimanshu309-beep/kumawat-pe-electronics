const crypto = require('crypto');

/**
 * Middleware to verify Razorpay Webhook signatures
 */
exports.verifyWebhookSignature = (req, res, next) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (!secret || secret === 'rzp_test_webhook_secret') {
    // If webhook secret isn't configured, we reject real requests or pass mock test requests
    if (req.body.isMockWebhook) {
      return next(); // Mock fallback
    }
    console.error('Webhook signature verification failed: RAZORPAY_WEBHOOK_SECRET not configured');
    return res.status(403).json({ success: false, message: 'Invalid Signature' });
  }

  const razorpaySignature = req.headers['x-razorpay-signature'];
  if (!razorpaySignature) {
    return res.status(400).json({ success: false, message: 'Missing Razorpay Signature' });
  }

  try {
    const bodyString = JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac('sha256', secret).update(bodyString).digest('hex');

    if (expectedSignature === razorpaySignature) {
      return next();
    } else {
      console.error('Webhook signature mismatch');
      return res.status(403).json({ success: false, message: 'Invalid Signature' });
    }
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Utility function to verify payment signature for manual checkout
 */
exports.verifyPaymentSignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || secret === 'rzp_test_secret_placeholder') {
    // MOCK MODE FALLBACK
    if (signature === 'mock_signature' && paymentId.startsWith('pay_mock_')) {
      return true;
    }
    return false;
  }

  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex');
  return expectedSignature === signature;
};
