const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');

async function test() {
  console.log("Coupon model:", typeof Coupon);
  try {
    const coupons = await Coupon.find();
    console.log("Coupons:", coupons);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit();
}

test();
