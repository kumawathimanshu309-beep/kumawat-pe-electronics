const mongoose = require('mongoose');

const PaymentLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: '0.0.0.0'
  },
  userId: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    default: ''
  },
  paymentId: {
    type: String,
    default: ''
  },
  action: {
    type: String,
    enum: [
      'Payment Started', 
      'Payment Success', 
      'Payment Failed', 
      'Payment Cancelled', 
      'Refund Requested', 
      'Refund Approved', 
      'Refund Rejected',
      'Refund Completed', 
      'Retry Attempt'
    ],
    required: true
  },
  details: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('PaymentLog', PaymentLogSchema);
