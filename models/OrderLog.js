const mongoose = require('mongoose');

const OrderLogSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  oldStatus: {
    type: String,
    required: true
  },
  newStatus: {
    type: String,
    required: true
  },
  changedBy: {
    type: String,
    required: true
  },
  cancelReason: {
    type: String,
    default: ''
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('OrderLog', OrderLogSchema);
