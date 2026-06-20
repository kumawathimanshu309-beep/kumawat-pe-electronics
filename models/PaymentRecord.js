const mongoose = require('mongoose');

const PaymentRecordSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['Cash On Delivery', 'Google Pay', 'PhonePe', 'Paytm', 'Instant UPI QR Scan', 'Debit Card', 'Net Banking'],
    required: true
  },
  razorpayOrderId: {
    type: String,
    default: ''
  },
  razorpayPaymentId: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  transactionTime: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PaymentRecord', PaymentRecordSchema);
