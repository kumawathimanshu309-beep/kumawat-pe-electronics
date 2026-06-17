const mongoose = require('mongoose');

const OtpLogSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Expired'],
    default: 'Pending'
  },
  requestCount: {
    type: Number,
    default: 1
  },
  lastRequestedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('OtpLog', OtpLogSchema);
