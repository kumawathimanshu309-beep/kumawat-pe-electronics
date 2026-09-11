const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  brandId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true
  },
  logo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Disabled'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);
