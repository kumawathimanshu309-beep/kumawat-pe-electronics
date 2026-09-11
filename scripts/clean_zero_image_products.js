const mongoose = require('e:/PROJECT/kumawat-E-commerse/node_modules/mongoose');
const fs = require('fs');
require('e:/PROJECT/kumawat-E-commerse/node_modules/dotenv').config({ path: 'e:/PROJECT/kumawat-E-commerse/.env' });

const Product = require('e:/PROJECT/kumawat-E-commerse/models/Product');
const Order = require('e:/PROJECT/kumawat-E-commerse/models/Order');

async function cleanZeroImageProducts() {
  const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kumawat_pe';
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB at', MONGODB_URI);

  const reportData = JSON.parse(fs.readFileSync('C:/Users/DELL/.gemini/antigravity/brain/03a426e3-5fee-422a-b124-3b27b7225fc1/scratch/product_image_audit.json', 'utf8'));
  const deleteList = reportData.auditReport.filter(p => p.action === 'DELETE');
  console.log(`Found ${deleteList.length} products marked for deletion.`);

  const orders = await Order.find({}).lean();
  let deletedCount = 0;
  let disabledCount = 0;

  for (const item of deleteList) {
    let referencedInOrders = false;
    for (const order of orders) {
      if (order.items && Array.isArray(order.items)) {
        if (order.items.some(i => i.productId === item.productId || i.sku === item.sku)) {
          referencedInOrders = true;
          break;
        }
      }
    }

    if (referencedInOrders) {
      await Product.updateOne({ productId: item.productId }, { status: 'Disabled' });
      disabledCount++;
      console.log(`SOFT DELETED (Disabled): [${item.productId}] ${item.name}`);
    } else {
      await Product.deleteOne({ productId: item.productId });
      deletedCount++;
      console.log(`HARD DELETED: [${item.productId}] ${item.name}`);
    }
  }

  const remainingProductsCount = await Product.countDocuments();
  console.log(`\n================ CLEANUP SUMMARY ================`);
  console.log(`Hard Deleted (0 order refs): ${deletedCount}`);
  console.log(`Soft Deleted (Disabled): ${disabledCount}`);
  console.log(`Remaining Products in MongoDB: ${remainingProductsCount}`);

  await mongoose.disconnect();
}

cleanZeroImageProducts().catch(err => {
  console.error('Cleanup Error:', err);
  process.exit(1);
});
