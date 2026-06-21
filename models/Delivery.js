const mongoose = require('mongoose');

const DeliveryLogSchema = new mongoose.Schema({
  status: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  remarks: { type: String, default: '' }
});

const DeliverySchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  statusLogs: [DeliveryLogSchema],
  assignedTo: {
    type: String,
    default: 'Deepak Kumawat' // By default, Deepak, Himanshu's assistant
  },
  confirmationCode: {
    type: String,
    required: true
  },
  deliveredAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Delivery', DeliverySchema);
