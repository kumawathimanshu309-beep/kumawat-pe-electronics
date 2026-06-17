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
    enum: ['Cash', 'UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Credit Card', 'Debit Card'],
    required: true
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
