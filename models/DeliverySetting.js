const mongoose = require('mongoose');

const DeliverySettingSchema = new mongoose.Schema({
  minOrderAmount: {
    type: Number,
    default: 0
  },
  storeLocation: {
    address: { type: String, default: 'Kumawat P&E, Adda Ball, Kui Ke Pass, Station Road, Govindgarh, Rajasthan' },
    lat: { type: Number, default: 27.4243 }, // Approximate coord for Govindgarh, Rajasthan
    lng: { type: Number, default: 74.3722 }
  },
  maxDeliveryDistance: {
    type: Number,
    default: 50 // KM
  },
  distanceRules: [{
    minKm: { type: Number, required: true },
    maxKm: { type: Number, required: true },
    deliveryFee: { type: Number, required: true }
  }],
  defaultDeliveryFee: {
    type: Number,
    default: 100
  }
}, { timestamps: true });

module.exports = mongoose.model('DeliverySetting', DeliverySettingSchema);
