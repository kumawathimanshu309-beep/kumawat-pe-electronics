const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['fixed', 'percentage'],
    required: true
  },
  discount: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderValue: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscount: {
    type: Number, // Only applicable if type is percentage
    default: null
  },
  expiryDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number, // Total number of times this coupon can be used globally
    default: null
  },
  perUserLimit: {
    type: Number, // Times a single user can use it
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  usedBy: [{
    userId: { type: String, required: true },
    count: { type: Number, default: 0 }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Coupon', CouponSchema);
