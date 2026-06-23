const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 }
});

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    default: ''
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentRecord'
  },
  paymentMethod: {
    type: String,
    default: ''
  },
  paymentStatus: {
    type: String,
    default: 'Pending'
  },
  deliveryAddress: {
    fullName: String,
    mobile: String,
    altMobile: String,
    house: String,
    street: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    lat: Number,
    lng: Number
  },
  distanceKm: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  },
  preferredDate: {
    type: Date
  },
  timeSlot: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

OrderSchema.index({ userId: 1 });
OrderSchema.index({ deliveryStatus: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
