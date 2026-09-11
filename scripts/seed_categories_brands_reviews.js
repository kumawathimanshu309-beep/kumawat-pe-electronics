const mongoose = require('e:/PROJECT/kumawat-E-commerse/node_modules/mongoose');
require('e:/PROJECT/kumawat-E-commerse/node_modules/dotenv').config({ path: 'e:/PROJECT/kumawat-E-commerse/.env' });

const Product = require('e:/PROJECT/kumawat-E-commerse/models/Product');
const Category = require('e:/PROJECT/kumawat-E-commerse/models/Category');
const Brand = require('e:/PROJECT/kumawat-E-commerse/models/Brand');
const Review = require('e:/PROJECT/kumawat-E-commerse/models/Review');

const CATEGORY_META = {
  'Smartphones': { image: '/uploads/categories/smartphones.jpg', description: 'Flagship & budget iOS and Android smartphones' },
  'Laptops': { image: '/uploads/categories/laptops.jpg', description: 'Ultrabooks, gaming laptops, and business notebooks' },
  'Audio': { image: '/uploads/categories/audio.jpg', description: 'Noise canceling headphones, earbuds, and Bluetooth speakers' },
  'Smartwatches': { image: '/uploads/categories/smartwatches.jpg', description: 'Fitness trackers, sports watches, and premium wearables' },
  'Home Appliances': { image: '/uploads/categories/home-appliances.jpg', description: '4K Smart TVs, vacuum cleaners, and kitchen appliances' },
  'Cameras': { image: '/uploads/categories/cameras.jpg', description: 'Mirrorless cameras, action cams, lenses, and storage' },
  'Computer Peripherals': { image: '/uploads/categories/peripherals.jpg', description: 'Mice, keyboards, Wi-Fi 6 routers, and power banks' },
  'Fashion': { image: '/uploads/categories/fashion.jpg', description: 'Sneakers, denim jeans, outerwear, and accessories' }
};

const BRAND_META = {
  'Apple': { website: 'https://www.apple.com', description: 'Innovative consumer electronics and computers' },
  'Samsung': { website: 'https://www.samsung.com', description: 'Global leader in smartphones, TVs, and storage' },
  'Google': { website: 'https://store.google.com', description: 'Pixel smartphones and smart home devices' },
  'OnePlus': { website: 'https://www.oneplus.com', description: 'Never Settle flagship smartphones and audio' },
  'Xiaomi': { website: 'https://www.mi.com', description: 'Feature-packed smartphones and smart ecosystems' },
  'Nothing': { website: 'https://nothing.tech', description: 'Iconic transparent design smartphones and earbuds' },
  'Motorola': { website: 'https://www.motorola.com', description: 'Pioneer in mobile communication' },
  'Dell': { website: 'https://www.dell.com', description: 'XPS ultrabooks and Alienware gaming laptops' },
  'HP': { website: 'https://www.hp.com', description: 'Spectre 2-in-1s and Pavilion laptops' },
  'Lenovo': { website: 'https://www.lenovo.com', description: 'ThinkPad business laptops and LOQ gaming' },
  'ASUS': { website: 'https://www.asus.com', description: 'ROG Zephyrus gaming laptops and Vivobook' },
  'Acer': { website: 'https://www.acer.com', description: 'Predator gaming laptops and Swift ultrabooks' },
  'Sony': { website: 'https://www.sony.com', description: 'Industry-leading audio, Alpha cameras, and Bravia TVs' },
  'Bose': { website: 'https://www.bose.com', description: 'QuietComfort noise canceling headphones and speakers' },
  'JBL': { website: 'https://www.jbl.com', description: 'Pro sound Bluetooth speakers and party sound' },
  'Sennheiser': { website: 'https://www.sennheiser.com', description: 'Audiophile headphones and sound systems' },
  'Canon': { website: 'https://www.canon.com', description: 'EOS mirrorless cameras and EF/RF lenses' },
  'Nikon': { website: 'https://www.nikon.com', description: 'Z series mirrorless cameras and optics' },
  'GoPro': { website: 'https://www.gopro.com', description: 'HERO action cameras and vlogging accessories' },
  'LG': { website: 'https://www.lg.com', description: 'OLED evo TVs and home appliances' },
  'Dyson': { website: 'https://www.dyson.com', description: 'Cordless vacuum cleaners and hair styling tools' },
  'Philips': { website: 'https://www.philips.com', description: 'Kitchen appliances, air fryers, and garment care' },
  'Prestige': { website: 'https://www.ttkprestige.com', description: 'Induction cooktops, mixer grinders, and cookware' },
  'SanDisk': { website: 'https://www.sandisk.com', description: 'Extreme portable SSDs and SD memory cards' },
  'TP-Link': { website: 'https://www.tp-link.com', description: 'Archer Wi-Fi 6 routers and Deco mesh systems' },
  'Logitech': { website: 'https://www.logitech.com', description: 'MX Master mice, mechanical keyboards, webcams' },
  'Anker': { website: 'https://www.anker.com', description: 'PowerCore power banks, GaN chargers, Motion+ audio' },
  'Garmin': { website: 'https://www.garmin.com', description: 'Forerunner and Venu GPS sports smartwatches' },
  'Titan': { website: 'https://www.titan.co.in', description: 'Crest smartwatches and Neo chronograph timepieces' },
  'Fossil': { website: 'https://www.fossil.com', description: 'Gen 6 Wear OS smartwatches and Neutra chronographs' },
  'Nike': { website: 'https://www.nike.com', description: 'Air Force 1, Pegasus running shoes, Tech Fleece' },
  'Adidas': { website: 'https://www.adidas.com', description: 'Ultraboost Light running shoes and Samba OG classics' },
  'Puma': { website: 'https://www.puma.com', description: 'Velocity Nitro running shoes and Smash sneakers' },
  "Levi's": { website: 'https://www.levi.in', description: '501 Original Fit jeans and Trucker jackets' }
};

const SAMPLE_REVIEWS = [
  { customerName: 'Rahul Sharma', rating: 5, title: 'Absolute Masterpiece!', comment: 'Incredible performance and build quality. Exceeded my expectations in every way!', isVerified: true, status: 'Approved' },
  { customerName: 'Priya Patel', rating: 5, title: 'Best Purchase This Year', comment: 'Battery life is exceptional and the display is super crisp. Highly recommend!', isVerified: true, status: 'Approved' },
  { customerName: 'Amit Verma', rating: 4, title: 'Great Product Overall', comment: 'Very happy with the delivery and packaging. Works smoothly for daily tasks.', isVerified: true, status: 'Approved' },
  { customerName: 'Sneha Gupta', rating: 5, title: 'Super Premium Feel', comment: 'Sleek design and blazing fast performance. Truly worth every rupee.', isVerified: true, status: 'Approved' },
  { customerName: 'Vikram Singh', rating: 3, title: 'Decent, But Pricey', comment: 'Good quality overall but expected slightly better battery backup under heavy load.', isVerified: false, status: 'Pending' },
  { customerName: 'Ananya Roy', rating: 5, title: 'Top-tier Quality', comment: 'Camera and sound quality are unmatched. Super fast shipping from Kumawat P&E!', isVerified: true, status: 'Approved' }
];

async function seedCategoriesBrandsReviews() {
  const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kumawat_pe';
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB at', MONGODB_URI);

  const products = await Product.find({ status: { $ne: 'Deleted' } }).lean();
  console.log(`Auditing ${products.length} active products to populate Categories and Brands...`);

  // 1. Sync Categories
  const categoryNames = [...new Set(products.map(p => p.category).filter(Boolean))];
  console.log(`Found ${categoryNames.length} distinct product categories.`);

  let catOrder = 1;
  for (const catName of categoryNames) {
    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const meta = CATEGORY_META[catName] || {};
    const catId = 'CAT-' + slug.toUpperCase();

    await Category.updateOne(
      { categoryId: catId },
      {
        $set: {
          categoryId: catId,
          name: catName,
          slug,
          image: meta.image || `/uploads/categories/${slug}.jpg`,
          description: meta.description || `${catName} category products`,
          status: 'Active',
          displayOrder: catOrder++
        }
      },
      { upsert: true }
    );
  }
  console.log(`✓ Seeded/Synced ${categoryNames.length} Category records in MongoDB.`);

  // 2. Sync Brands
  const brandNames = [...new Set(products.map(p => p.brand).filter(Boolean))];
  console.log(`Found ${brandNames.length} distinct product brands.`);

  for (const bName of brandNames) {
    const slug = bName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const meta = BRAND_META[bName] || {};
    const brandId = 'BRD-' + slug.toUpperCase();

    await Brand.updateOne(
      { brandId },
      {
        $set: {
          brandId,
          name: bName,
          slug,
          logo: `/uploads/brands/${slug}.png`,
          description: meta.description || `${bName} official brand products`,
          website: meta.website || `https://www.${slug}.com`,
          status: 'Active'
        }
      },
      { upsert: true }
    );
  }
  console.log(`✓ Seeded/Synced ${brandNames.length} Brand records in MongoDB.`);

  // 3. Seed Reviews across Top Products
  const reviewCount = await Review.countDocuments();
  if (reviewCount < 10) {
    console.log('Seeding initial customer reviews across top products...');
    const topProducts = products.slice(0, 15);

    for (const prod of topProducts) {
      // Add 2 reviews per top product
      for (let rIdx = 0; rIdx < 2; rIdx++) {
        const template = SAMPLE_REVIEWS[(Math.floor(Math.random() * SAMPLE_REVIEWS.length))];
        const revId = 'REV-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

        const revDoc = new Review({
          productId: prod.productId,
          userId: 'USER-' + (100 + rIdx) + '-' + Math.floor(Math.random() * 1000),
          userName: template.customerName,
          rating: template.rating,
          title: template.title,
          text: template.comment,
          verifiedBuyer: template.isVerified,
          status: template.status,
          createdAt: new Date()
        });

        await revDoc.save();
      }

      // Recalculate average rating on product
      const approvedRevs = await Review.find({ productId: prod.productId, status: 'Approved' });
      if (approvedRevs.length > 0) {
        const avgRating = approvedRevs.reduce((sum, r) => sum + r.rating, 0) / approvedRevs.length;
        await Product.updateOne({ productId: prod.productId }, { $set: { ratings: { average: Number(avgRating.toFixed(1)), count: approvedRevs.length } } });
      }
    }
    console.log('✓ Seeded customer reviews and recalculated ratings.');
  }

  const finalCats = await Category.countDocuments();
  const finalBrands = await Brand.countDocuments();
  const finalRevs = await Review.countDocuments();

  console.log('\n================ SUMMARY ================');
  console.log(`Categories in DB: ${finalCats}`);
  console.log(`Brands in DB: ${finalBrands}`);
  console.log(`Reviews in DB: ${finalRevs}`);

  await mongoose.disconnect();
}

seedCategoriesBrandsReviews().catch(err => {
  console.error('Seed Error:', err);
  process.exit(1);
});
