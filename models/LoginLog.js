const mongoose = require('mongoose');

const LoginLogSchema = new mongoose.Schema({
  emailOrMobile: {
    type: String,
    required: true,
    trim: true
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Success', 'Failed'],
    required: true
  },
  failureReason: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LoginLog', LoginLogSchema);
