const mongoose = require('mongoose');

const PaymentRecordSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String, // Optional initially if order isn't created yet
    default: ''
  },
  userId: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['Cash On Delivery', 'Cash', 'COD', 'Google Pay', 'PhonePe', 'Paytm', 'Instant UPI QR Scan', 'UPI', 'Debit Card', 'Net Banking', 'Razorpay'],
    required: true
  },
  razorpayOrderId: {
    type: String,
    default: '',
    sparse: true // Allows multiple empty strings while maintaining uniqueness for real IDs
  },
  razorpayPaymentId: {
    type: String,
    default: '',
    sparse: true
  },
  receipt: {
    type: String,
    sparse: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Cancelled', 'Refunded', 'COD Pending', 'COD Completed'],
    default: 'Pending'
  },
  transactionTime: {
    type: Date,
    default: Date.now
  },
  refundId: {
    type: String,
    default: ''
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String,
    default: ''
  },
  refundStatus: {
    type: String,
    enum: ['None', 'Requested', 'Approved', 'Rejected'],
    default: 'None'
  },
  refundDate: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  cartSnapshot: {
    type: Array,
    default: []
  }
});

// Removed duplicate index declarations. Mongoose already creates these from the schema configuration.
module.exports = mongoose.model('PaymentRecord', PaymentRecordSchema);
