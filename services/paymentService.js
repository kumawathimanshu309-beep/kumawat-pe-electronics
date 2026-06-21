const Razorpay = require('razorpay');
const Product = require('../models/Product');
const PaymentRecord = require('../models/PaymentRecord');
const PaymentLog = require('../models/PaymentLog');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_placeholder',
});

exports.createRazorpayOrder = async (amount, receipt) => {
  const isTestKeys = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder';
  
  if (isTestKeys) {
    // We return a mock order instead of crashing, allowing Frontend "Developer Mode" warning.
    return {
      isMock: true,
      id: 'mock_order_' + Date.now(),
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
      status: 'created'
    };
  }

  const options = {
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt
  };

  const order = await razorpay.orders.create(options);
  return { isMock: false, ...order };
};

exports.reserveInventory = async (items) => {
  // Items is array of { productId, quantity }
  for (let item of items) {
    if (item.productId) {
      await Product.updateOne(
        { productId: item.productId, stock: { $gte: item.quantity } },
        { $inc: { reservedStock: item.quantity, stock: -item.quantity } }
      );
    }
  }
};

exports.releaseInventory = async (items) => {
  for (let item of items) {
    if (item.productId) {
      await Product.updateOne(
        { productId: item.productId, reservedStock: { $gte: item.quantity } },
        { $inc: { reservedStock: -item.quantity, stock: item.quantity } }
      );
    }
  }
};

exports.deductInventory = async (items) => {
  // If payment successful, we permanently remove from reservedStock (since it was already taken out of main stock during reservation)
  for (let item of items) {
    if (item.productId) {
      await Product.updateOne(
        { productId: item.productId, reservedStock: { $gte: item.quantity } },
        { $inc: { reservedStock: -item.quantity } }
      );
    }
  }
};

exports.logPaymentEvent = async (userId, orderId, paymentId, action, details, ipAddress = '0.0.0.0') => {
  try {
    const log = new PaymentLog({
      userId,
      orderId,
      paymentId,
      action,
      details,
      ipAddress
    });
    await log.save();
  } catch (err) {
    console.error('Failed to log payment event:', err);
  }
};

exports.sweepAbandonedPayments = async () => {
  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    // Find pending payments that are expired
    const abandonedPayments = await PaymentRecord.find({
      status: 'Pending',
      expiresAt: { $lte: new Date() }
    });

    for (let payment of abandonedPayments) {
      payment.status = 'Cancelled';
      await payment.save();

      await this.logPaymentEvent(payment.userId, payment.orderId, payment.paymentId, 'Payment Cancelled', 'Auto-cancelled due to timeout');

      if (payment.cartSnapshot && payment.cartSnapshot.length > 0) {
        await this.releaseInventory(payment.cartSnapshot);
      }
    }
  } catch (err) {
    console.error('Sweeper Error:', err);
  }
};
