const paymentService = require('../services/paymentService');
const PaymentRecord = require('../models/PaymentRecord');
const Product = require('../models/Product');
const crypto = require('crypto');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, paymentMethod, cartData, existingPaymentId } = req.body;
    const sessionUser = req.user;
    
    let items = [];
    try {
      items = JSON.parse(cartData);
    } catch(e) {}

    // 1. If retrying an existing payment, check if it's still valid
    if (existingPaymentId) {
      const existing = await PaymentRecord.findOne({ paymentId: existingPaymentId, userId: sessionUser.userId, status: 'Pending' });
      if (existing) {
        // Reuse it
        return res.json({
          success: true,
          paymentId: existing.paymentId,
          order_id: existing.razorpayOrderId,
          amount: existing.amount,
          currency: 'INR',
          key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          isTestMode: !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder'
        });
      }
    }

    // 2. Validate Amount
    const numericAmount = parseFloat(amount);
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid Amount" });
    }

    // 2.5. Developer Mode Check (Early Exit)
    const hasRazorpayKeys = !!process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder';
    if (!hasRazorpayKeys) {
      return res.status(200).json({
        success: false,
        developerMode: true,
        message: "Online Payment is running in Developer Mode. Configure Razorpay Test Keys."
      });
    }

    // 3. Create PaymentRecord (Pending)
    const paymentId = 'PAY' + Date.now() + Math.floor(Math.random()*1000);
    const receipt = 'rcpt_' + paymentId;
    
    // 4. Reserve Inventory
    await paymentService.reserveInventory(items);

    // 5. Generate Razorpay Order
    let rzpOrder;
    try {
      rzpOrder = await paymentService.createRazorpayOrder(numericAmount, receipt);
    } catch (err) {
      // If Razorpay fails, release inventory immediately
      await paymentService.releaseInventory(items);
      return res.status(500).json({ success: false, message: err.message || "Failed to contact Payment Gateway" });
    }

    // 6. Save PaymentRecord
    const record = new PaymentRecord({
      paymentId,
      userId: sessionUser.userId,
      method: paymentMethod,
      amount: numericAmount,
      razorpayOrderId: rzpOrder.id,
      receipt,
      status: 'Pending',
      cartSnapshot: items,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 min timeout
    });
    await record.save();

    await paymentService.logPaymentEvent(sessionUser.userId, '', paymentId, 'Payment Started', `Intent created for ₹${numericAmount}`, req.ip);

    res.json({
      success: true,
      paymentId,
      order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      isTestMode: rzpOrder.isMock
    });

  } catch (error) {
    console.error('Create Payment Intent Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.cancelPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const sessionUser = req.user;

    const record = await PaymentRecord.findOne({ paymentId, userId: sessionUser.userId, status: 'Pending' });
    if (!record) return res.status(404).json({ success: false, message: 'Payment not found or already processed' });

    record.status = 'Cancelled';
    await record.save();

    // Release inventory
    if (record.cartSnapshot && record.cartSnapshot.length > 0) {
      await paymentService.releaseInventory(record.cartSnapshot);
    }

    await paymentService.logPaymentEvent(sessionUser.userId, '', paymentId, 'Payment Cancelled', 'User manually cancelled', req.ip);

    res.json({ success: true, message: 'Payment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Webhook Controller
exports.handleWebhook = async (req, res) => {
  // Signature is already verified by middleware
  try {
    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment.entity;
      const rzpOrderId = paymentEntity.order_id;
      const rzpPaymentId = paymentEntity.id;

      const record = await PaymentRecord.findOne({ razorpayOrderId: rzpOrderId });
      if (!record) return res.status(200).send('OK'); // Not our order or old

      if (record.status === 'Paid') {
        return res.status(200).send('OK'); // Idempotency
      }

      record.status = 'Paid';
      record.razorpayPaymentId = rzpPaymentId;
      await record.save();

      // Deduct inventory permanently
      if (record.cartSnapshot && record.cartSnapshot.length > 0) {
        await paymentService.deductInventory(record.cartSnapshot);
      }

      await paymentService.logPaymentEvent(record.userId, record.orderId, record.paymentId, 'Payment Success', `Captured via webhook: ${rzpPaymentId}`, req.ip);
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment.entity;
      const rzpOrderId = paymentEntity.order_id;
      
      const record = await PaymentRecord.findOne({ razorpayOrderId: rzpOrderId });
      if (record && record.status === 'Pending') {
        await paymentService.logPaymentEvent(record.userId, record.orderId, record.paymentId, 'Payment Failed', `Failed via webhook`, req.ip);
        // We don't mark it failed immediately, allow retry until timeout!
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Error');
  }
};
