const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  brand: {
    type: String,
    trim: true,
    default: 'Generic'
  },
  images: [{
    type: String
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reservedStock: {
    type: Number,
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Out Of Stock', 'Hidden', 'Deleted'],
    default: 'Active'
  },
  video: { type: String, default: '' },
  badges: [{ type: String }],
  features: [{ type: String }],
  specifications: {
    general: { type: Map, of: String, default: {} },
    electrical: { type: Map, of: String, default: {} },
    physical: { type: Map, of: String, default: {} },
    warranty: { type: Map, of: String, default: {} },
    technical: { type: Map, of: String, default: {} }
  },
  packageContents: [{ type: String }],
  accessories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' }
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  deliveryAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes for Advanced Search and Filtering Performance
productSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text', sku: 'text' }, {
  weights: { name: 10, brand: 5, sku: 5, category: 3, description: 1 }
});
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
