const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true
  },
  adminName: {
    type: String,
    default: 'Admin'
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: {
    type: String,
    default: ''
  },
  details: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: '0.0.0.0'
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminLog', adminLogSchema);
