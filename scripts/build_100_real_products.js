const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const mongoose = require('e:/PROJECT/kumawat-E-commerse/node_modules/mongoose');
require('e:/PROJECT/kumawat-E-commerse/node_modules/dotenv').config({ path: 'e:/PROJECT/kumawat-E-commerse/.env' });

const Product = require('e:/PROJECT/kumawat-E-commerse/models/Product');
const csvHandler = require('e:/PROJECT/kumawat-E-commerse/utils/csvHandler');

const PRODUCTS_DATA = [
  // --- SMARTPHONES (15 Products) ---
  {
    productId: 'PRD-APP-IPHONE15-128',
    name: 'Apple iPhone 15 (128 GB) - Black',
    category: 'Smartphones',
    subcategory: 'iOS Smartphones',
    brand: 'Apple',
    price: 79900,
    discountPrice: 69900,
    costPrice: 58000,
    stock: 35,
    sku: 'APP-IP15-128-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Dynamic Island brings up alerts and Live Activities. 48MP Main camera with 2x Telephoto. Durable color-infused glass and aluminum design with USB-C.',
    slug: 'apple-iphone-15-128gb-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SAM-S24ULTRA-256',
    name: 'Samsung Galaxy S24 Ultra 5G (256GB, Titanium Gray)',
    category: 'Smartphones',
    subcategory: 'Android Smartphones',
    brand: 'Samsung',
    price: 134999,
    discountPrice: 129999,
    costPrice: 105000,
    stock: 20,
    sku: 'SAM-S24U-256-GRY',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Meet Galaxy S24 Ultra with Galaxy AI, titanium frame, built-in S Pen, 200MP camera system, and Snapdragon 8 Gen 3 Mobile Platform.',
    slug: 'samsung-galaxy-s24-ultra-256gb',
    imageUrls: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800',
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-GOO-PIXEL8PRO-128',
    name: 'Google Pixel 8 Pro (128GB, Bay)',
    category: 'Smartphones',
    subcategory: 'Android Smartphones',
    brand: 'Google',
    price: 106999,
    discountPrice: 93999,
    costPrice: 78000,
    stock: 18,
    sku: 'GOO-PIX8P-128-BAY',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Google Tensor G3 chip powers Google AI features. Fully upgraded cameras, Super Actua display, and 24+ hour battery life with 7 years of OS updates.',
    slug: 'google-pixel-8-pro-128gb-bay',
    imageUrls: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=800',
      'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-ONE-12-256',
    name: 'OnePlus 12 5G (256GB, Silky Black)',
    category: 'Smartphones',
    subcategory: 'Android Smartphones',
    brand: 'OnePlus',
    price: 64999,
    discountPrice: 64999,
    costPrice: 53000,
    stock: 25,
    sku: 'ONE-12-256-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera for Mobile, 2K 120 Hz ProXDR Display, 5400 mAh battery with 100W SUPERVOOC charging.',
    slug: 'oneplus-12-5g-256gb-silky-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-NOT-PHONE2-256',
    name: 'Nothing Phone (2) (256GB, Dark Gray)',
    category: 'Smartphones',
    subcategory: 'Android Smartphones',
    brand: 'Nothing',
    price: 49999,
    discountPrice: 39999,
    costPrice: 31000,
    stock: 15,
    sku: 'NOT-PH2-256-GRY',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Iconic Glyph Interface with customized LED light patterns. Dual 50MP rear camera, Snapdragon 8+ Gen 1, and Nothing OS 2.5.',
    slug: 'nothing-phone-2-256gb-dark-gray',
    imageUrls: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=800',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800',
      'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-XIA-14-512',
    name: 'Xiaomi 14 (512GB, Black)',
    category: 'Smartphones',
    subcategory: 'Android Smartphones',
    brand: 'Xiaomi',
    price: 79999,
    discountPrice: 69999,
    costPrice: 56000,
    stock: 14,
    sku: 'XIA-14-512-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Leica Summilux optical lens, Snapdragon 8 Gen 3, 1.5K 120Hz LTPO AMOLED display, 90W HyperCharge + 50W wireless charging.',
    slug: 'xiaomi-14-512gb-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800',
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-MOT-EDGE50ULTRA',
    name: 'Motorola Edge 50 Ultra 5G (512GB, Peach Fuzz)',
    category: 'Smartphones',
    subcategory: 'Android Smartphones',
    brand: 'Motorola',
    price: 64999,
    discountPrice: 59999,
    costPrice: 48000,
    stock: 12,
    sku: 'MOT-EDG50U-512',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Real vegan leather / wood finish back, Snapdragon 8s Gen 3, 50MP periscope telephoto camera, 125W TurboPower charging.',
    slug: 'motorola-edge-50-ultra-512gb',
    imageUrls: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-APP-IPHONE15PRO-256',
    name: 'Apple iPhone 15 Pro (256 GB) - Natural Titanium',
    category: 'Smartphones',
    subcategory: 'iOS Smartphones',
    brand: 'Apple',
    price: 144900,
    discountPrice: 134900,
    costPrice: 112000,
    stock: 10,
    sku: 'APP-IP15P-256-TIT',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Forged in titanium with A17 Pro chip, customizable Action button, 48MP Main camera system, and USB 3 speeds.',
    slug: 'apple-iphone-15-pro-256gb-titanium',
    imageUrls: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SAM-FLIP5-256',
    name: 'Samsung Galaxy Z Flip5 5G (256GB, Mint)',
    category: 'Smartphones',
    subcategory: 'Foldable Smartphones',
    brand: 'Samsung',
    price: 99999,
    discountPrice: 79999,
    costPrice: 64000,
    stock: 8,
    sku: 'SAM-FLP5-256-MNT',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Compact 3.4-inch Flex Window for quick replies, hands-free selfies with FlexCam, zero-gap Flex Hinge design.',
    slug: 'samsung-galaxy-z-flip5-256gb',
    imageUrls: [
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800',
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800',
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-ONE-12R-256',
    name: 'OnePlus 12R 5G (256GB, Cool Blue)',
    category: 'Smartphones',
    subcategory: 'Android Smartphones',
    brand: 'OnePlus',
    price: 45999,
    discountPrice: 42999,
    costPrice: 35000,
    stock: 30,
    sku: 'ONE-12R-256-BLU',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Snapdragon 8 Gen 2, 4th-Gen LTPO 120Hz display, 5500 mAh largest OnePlus battery, 100W SUPERVOOC charging.',
    slug: 'oneplus-12r-5g-256gb-cool-blue',
    imageUrls: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-XIA-REDMINOTE13PRO',
    name: 'Xiaomi Redmi Note 13 Pro+ 5G (256GB, Fusion Purple)',
    category: 'Smartphones',
    subcategory: 'Android Smartphones',
    brand: 'Xiaomi',
    price: 33999,
    discountPrice: 29999,
    costPrice: 24000,
    stock: 40,
    sku: 'XIA-RN13P-256-PUR',
    status: 'Active',
    deliveryAvailable: true,
    description: '200MP OIS camera, 3D Curved 1.5K AMOLED display, IP68 water & dust resistance, 120W HyperCharge.',
    slug: 'xiaomi-redmi-note-13-pro-plus-256gb',
    imageUrls: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=800',
      'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-GOO-PIXEL8A-128',
    name: 'Google Pixel 8a (128GB, Aloe)',
    category: 'Smartphones',
    subcategory: 'Android Smartphones',
    brand: 'Google',
    price: 52999,
    discountPrice: 47999,
    costPrice: 38000,
    stock: 22,
    sku: 'GOO-PIX8A-128-ALO',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Google Tensor G3, AI-powered camera with Best Take and Audio Magic Eraser, IP67 durable design.',
    slug: 'google-pixel-8a-128gb-aloe',
    imageUrls: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800',
      'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=800',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-MOT-EDGE50PRO-256',
    name: 'Motorola Edge 50 Pro 5G (256GB, Luxe Lavender)',
    category: 'Smartphones',
    subcategory: 'Android Smartphones',
    brand: 'Motorola',
    price: 36999,
    discountPrice: 31999,
    costPrice: 25000,
    stock: 28,
    sku: 'MOT-EDG50P-256-LAV',
    status: 'Active',
    deliveryAvailable: true,
    description: 'World-first Pantone Validated Display and Camera, 50MP AI camera with telephoto, 125W TurboPower + 50W wireless.',
    slug: 'motorola-edge-50-pro-256gb',
    imageUrls: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-NOT-PHONE2A-128',
    name: 'Nothing Phone (2a) (128GB, White)',
    category: 'Smartphones',
    subcategory: 'Android Smartphones',
    brand: 'Nothing',
    price: 25999,
    discountPrice: 23999,
    costPrice: 19000,
    stock: 35,
    sku: 'NOT-PH2A-128-WHT',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Dimensity 7200 Pro processor, unique Glyph Interface, dual 50MP camera, 120Hz flexible AMOLED display.',
    slug: 'nothing-phone-2a-128gb-white',
    imageUrls: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=800',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800',
      'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SAM-A55-256',
    name: 'Samsung Galaxy A55 5G (256GB, Awesome Iceblue)',
    category: 'Smartphones',
    subcategory: 'Android Smartphones',
    brand: 'Samsung',
    price: 45999,
    discountPrice: 42999,
    costPrice: 34000,
    stock: 24,
    sku: 'SAM-A55-256-BLU',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Metal frame design with Key Island, Nightography camera, Knox Vault security, IP67 dust & water resistance.',
    slug: 'samsung-galaxy-a55-256gb',
    imageUrls: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800',
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?q=80&w=800'
    ]
  },

  // --- LAPTOPS & COMPUTERS (15 Products) ---
  {
    productId: 'PRD-APP-MACBOOKAIRM3-8',
    name: 'Apple MacBook Air 13" (M3, 8GB RAM, 256GB SSD) - Midnight',
    category: 'Laptops',
    subcategory: 'Thin & Light Laptops',
    brand: 'Apple',
    price: 114900,
    discountPrice: 104900,
    costPrice: 88000,
    stock: 16,
    sku: 'APP-MBA-M3-256-MID',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Supercharged by M3 chip with up to 18 hours of battery life. Liquid Retina display, 1080p FaceTime HD camera, MagSafe 3 charging.',
    slug: 'apple-macbook-air-13-m3-midnight',
    imageUrls: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-APP-MACBOOKPROM3-16',
    name: 'Apple MacBook Pro 14" (M3 Pro, 18GB RAM, 512GB SSD) - Space Black',
    category: 'Laptops',
    subcategory: 'Professional Laptops',
    brand: 'Apple',
    price: 199900,
    discountPrice: 184900,
    costPrice: 155000,
    stock: 10,
    sku: 'APP-MBP-M3P-512-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'M3 Pro chip delivers extreme performance for demanding workflows. Liquid Retina XDR display, HDMI, SDXC card slot, MagSafe 3.',
    slug: 'apple-macbook-pro-14-m3-pro-space-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-DEL-XPS13-16',
    name: 'Dell XPS 13 Laptop (Intel Core Ultra 7, 16GB, 512GB SSD) - Platinum',
    category: 'Laptops',
    subcategory: 'Ultrabooks',
    brand: 'Dell',
    price: 149990,
    discountPrice: 139990,
    costPrice: 115000,
    stock: 12,
    sku: 'DEL-XPS13-U7-512',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Iconic CNC machined aluminum design, FHD+ InfinityEdge display, capacitive touch function row, seamless glass touchpad.',
    slug: 'dell-xps-13-intel-core-ultra-7',
    imageUrls: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-HP-SPECTRE14',
    name: 'HP Spectre x360 14 2-in-1 Laptop (Intel Core Ultra 7, 16GB, 1TB SSD)',
    category: 'Laptops',
    subcategory: '2-in-1 Touch Laptops',
    brand: 'HP',
    price: 169999,
    discountPrice: 154999,
    costPrice: 128000,
    stock: 8,
    sku: 'HP-SPC360-14-1TB',
    status: 'Active',
    deliveryAvailable: true,
    description: '2.8K OLED touch display with 120Hz VRR, 9MP AI camera with night mode, Poly Studio audio, rechargeable tilt pen included.',
    slug: 'hp-spectre-x360-14-2in1-laptop',
    imageUrls: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-LEN-THINKPADX1',
    name: 'Lenovo ThinkPad X1 Carbon Gen 12 (Intel Core Ultra 7, 32GB, 1TB SSD)',
    category: 'Laptops',
    subcategory: 'Business Laptops',
    brand: 'Lenovo',
    price: 210000,
    discountPrice: 189990,
    costPrice: 160000,
    stock: 9,
    sku: 'LEN-TPX1C-G12-1TB',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Ultralight carbon fiber chassis, MIL-STD 810H durability, TrackPoint pointing stick, Communications Bar with 8MP camera.',
    slug: 'lenovo-thinkpad-x1-carbon-gen-12',
    imageUrls: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-ASU-ROGZEPHYRUSG14',
    name: 'ASUS ROG Zephyrus G14 Gaming Laptop (Ryzen 9, RTX 4060, 16GB, 1TB SSD)',
    category: 'Laptops',
    subcategory: 'Gaming Laptops',
    brand: 'ASUS',
    price: 174990,
    discountPrice: 159990,
    costPrice: 132000,
    stock: 11,
    sku: 'ASU-G14-R9-4060',
    status: 'Active',
    deliveryAvailable: true,
    description: '3K 120Hz ROG Nebula OLED display, CNC aluminum chassis, AniMe Matrix lighting array, Vapor Chamber cooling.',
    slug: 'asus-rog-zephyrus-g14-gaming-laptop',
    imageUrls: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-ACE-PREDATORHELIOS16',
    name: 'Acer Predator Helios 16 (Intel i9 14th Gen, RTX 4080, 32GB, 1TB SSD)',
    category: 'Laptops',
    subcategory: 'Gaming Laptops',
    brand: 'Acer',
    price: 249999,
    discountPrice: 229999,
    costPrice: 190000,
    stock: 7,
    sku: 'ACE-PH16-I9-4080',
    status: 'Active',
    deliveryAvailable: true,
    description: 'WQXGA 240Hz Mini-LED display, 5th Gen AeroBlade 3D fans, liquid metal thermal grease, per-key RGB mechanical keyboard.',
    slug: 'acer-predator-helios-16-i9-rtx4080',
    imageUrls: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-DEL-ALIENWAREM16',
    name: 'Dell Alienware m16 R2 Gaming Laptop (Intel Core Ultra 7, RTX 4070, 16GB)',
    category: 'Laptops',
    subcategory: 'Gaming Laptops',
    brand: 'Dell',
    price: 215000,
    discountPrice: 199990,
    costPrice: 165000,
    stock: 6,
    sku: 'DEL-ALM16-U7-4070',
    status: 'Active',
    deliveryAvailable: true,
    description: 'QHD+ 240Hz display, Cryo-tech cooling with Element 31 thermal interface, AlienFX per-key RGB lighting.',
    slug: 'dell-alienware-m16-r2-gaming-laptop',
    imageUrls: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-HP-PAVILIONPLUS14',
    name: 'HP Pavilion Plus 14 (Intel Core i5 13th Gen, 16GB, 512GB SSD) - Silver',
    category: 'Laptops',
    subcategory: 'Mainstream Laptops',
    brand: 'HP',
    price: 76999,
    discountPrice: 67999,
    costPrice: 56000,
    stock: 25,
    sku: 'HP-PAV14-I5-512',
    status: 'Active',
    deliveryAvailable: true,
    description: '2.2K IPS micro-edge display, 5MP IR camera with shutter, B&O dual speakers, full metal body design.',
    slug: 'hp-pavilion-plus-14-intel-i5',
    imageUrls: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-LEN-IDEAPADSLIM5',
    name: 'Lenovo IdeaPad Slim 5 (Ryzen 7 7730U, 16GB, 512GB SSD) - Cloud Grey',
    category: 'Laptops',
    subcategory: 'Thin & Light Laptops',
    brand: 'Lenovo',
    price: 69990,
    discountPrice: 62990,
    costPrice: 51000,
    stock: 20,
    sku: 'LEN-IPS5-R7-512',
    status: 'Active',
    deliveryAvailable: true,
    description: '16" WUXGA IPS display, full metal aluminum top cover, FHD IR camera with privacy shutter, Smart Power battery optimization.',
    slug: 'lenovo-ideapad-slim-5-ryzen-7',
    imageUrls: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-ASU-VIVOBOOKS15',
    name: 'ASUS Vivobook S 15 OLED (Snapdragon X Elite, 16GB, 1TB SSD)',
    category: 'Laptops',
    subcategory: 'Copilot+ PC Laptops',
    brand: 'ASUS',
    price: 124990,
    discountPrice: 114990,
    costPrice: 94000,
    stock: 14,
    sku: 'ASU-VBS15-SNX-1TB',
    status: 'Active',
    deliveryAvailable: true,
    description: '3K 120Hz ASUS Lumina OLED display, Qualcomm Hexagon NPU for Copilot+ AI features, 18+ hours battery, RGB backlit keyboard.',
    slug: 'asus-vivobook-s15-oled-snapdragon-x-elite',
    imageUrls: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-ACE-SWIFTGO14',
    name: 'Acer Swift Go 14 OLED (Intel Core Ultra 5, 16GB, 512GB SSD)',
    category: 'Laptops',
    subcategory: 'Thin & Light Laptops',
    brand: 'Acer',
    price: 79999,
    discountPrice: 69999,
    costPrice: 57000,
    stock: 18,
    sku: 'ACE-SWG14-U5-512',
    status: 'Active',
    deliveryAvailable: true,
    description: '2.8K 90Hz OLED display, 1440p QHD webcam with Acer PurifiedVoice AI noise reduction, Intel Arc graphics.',
    slug: 'acer-swift-go-14-oled-intel-core-ultra-5',
    imageUrls: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-APP-IMAC24M3',
    name: 'Apple iMac 24" (M3, 8-core CPU, 8-core GPU, 8GB, 256GB SSD) - Blue',
    category: 'Laptops',
    subcategory: 'Desktop All-In-One',
    brand: 'Apple',
    price: 134900,
    discountPrice: 124900,
    costPrice: 102000,
    stock: 8,
    sku: 'APP-IMAC24-M3-BLU',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Striking 11.5mm thin design, 4.5K Retina display, 1080p FaceTime HD camera, studio-quality mics, 6-speaker sound system.',
    slug: 'apple-imac-24-m3-blue',
    imageUrls: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-APP-MACMINIM2PRO',
    name: 'Apple Mac Mini (M2 Pro, 16GB RAM, 512GB SSD)',
    category: 'Laptops',
    subcategory: 'Mini Desktop',
    brand: 'Apple',
    price: 129900,
    discountPrice: 119900,
    costPrice: 98000,
    stock: 12,
    sku: 'APP-MACMINI-M2P-512',
    status: 'Active',
    deliveryAvailable: true,
    description: 'M2 Pro chip powers intensive tasks like editing 8K video. 4 Thunderbolt 4 ports, HDMI port supporting 8K display output.',
    slug: 'apple-mac-mini-m2-pro-512gb',
    imageUrls: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-ASU-TUFGAMINGF15',
    name: 'ASUS TUF Gaming F15 (Intel Core i5 11th Gen, RTX 2050, 16GB, 512GB SSD)',
    category: 'Laptops',
    subcategory: 'Gaming Laptops',
    brand: 'ASUS',
    price: 62990,
    discountPrice: 52990,
    costPrice: 43000,
    stock: 22,
    sku: 'ASU-TUF15-I5-2050',
    status: 'Active',
    deliveryAvailable: true,
    description: '144Hz vIPS display, military-grade MIL-STD-810H toughness, self-cleaning dual fan cooling, DTS:X Ultra audio.',
    slug: 'asus-tuf-gaming-f15-rtx-2050',
    imageUrls: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800'
    ]
  },

  // --- AUDIO & HEADPHONES (15 Products) ---
  {
    productId: 'PRD-SON-WH1000XM5',
    name: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones - Black',
    category: 'Audio',
    subcategory: 'Over-Ear Headphones',
    brand: 'Sony',
    price: 34990,
    discountPrice: 29990,
    costPrice: 23500,
    stock: 20,
    sku: 'SON-XM5-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Two processors and 8 microphones for unparalleled noise canceling. 30-hour battery life with quick charging (3 min for 3 hours).',
    slug: 'sony-wh-1000xm5-headphones-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-BOS-QCULTRA-HEADPHONES',
    name: 'Bose QuietComfort Ultra Wireless Noise Cancelling Headphones - Black',
    category: 'Audio',
    subcategory: 'Over-Ear Headphones',
    brand: 'Bose',
    price: 35900,
    discountPrice: 32900,
    costPrice: 26000,
    stock: 15,
    sku: 'BOS-QCU-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Breakthrough Bose Immersive Audio, custom-tailored sound with CustomTune technology, Quiet, Aware, and Immersion modes.',
    slug: 'bose-quietcomfort-ultra-headphones-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-APP-AIRPODSPRO2',
    name: 'Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)',
    category: 'Audio',
    subcategory: 'True Wireless Earbuds',
    brand: 'Apple',
    price: 24900,
    discountPrice: 21900,
    costPrice: 17500,
    stock: 30,
    sku: 'APP-APP2-USBC',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Up to 2x more Active Noise Cancellation, Transparency mode, Adaptive Audio, Personalized Spatial Audio with dynamic head tracking.',
    slug: 'apple-airpods-pro-2-usbc',
    imageUrls: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=800',
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-JBL-FLIP6-BLK',
    name: 'JBL Flip 6 Portable Waterproof Bluetooth Speaker - Black',
    category: 'Audio',
    subcategory: 'Bluetooth Speakers',
    brand: 'JBL',
    price: 13999,
    discountPrice: 9999,
    costPrice: 7500,
    stock: 25,
    sku: 'JBL-FLIP6-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: '2-way speaker system delivers loud, crystal clear, powerful sound. IP67 waterproof and dustproof, 12 hours of playtime.',
    slug: 'jbl-flip-6-bluetooth-speaker-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SEN-MOMENTUM4',
    name: 'Sennheiser Momentum 4 Wireless Headphones - Black/Copper',
    category: 'Audio',
    subcategory: 'Over-Ear Headphones',
    brand: 'Sennheiser',
    price: 34990,
    discountPrice: 26990,
    costPrice: 21000,
    stock: 12,
    sku: 'SEN-M4-COPPER',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Audiophile-inspired 42mm transducer system. Exceptional 60-hour battery life, Adaptive Noise Cancellation and Transparency mode.',
    slug: 'sennheiser-momentum-4-headphones',
    imageUrls: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-ANK-SOUNDCOREMOTIONPLUS',
    name: 'Anker Soundcore Motion+ Bluetooth Speaker (30W Hi-Res Audio)',
    category: 'Audio',
    subcategory: 'Bluetooth Speakers',
    brand: 'Anker',
    price: 9999,
    discountPrice: 6999,
    costPrice: 5200,
    stock: 22,
    sku: 'ANK-SC-MOTIONP',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Hi-Res Audio with Qualcomm aptX, ultra-wide frequency range (50Hz to 40kHz), BassUp technology, IPX7 waterproof.',
    slug: 'anker-soundcore-motion-plus-speaker',
    imageUrls: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SON-WF1000XM5',
    name: 'Sony WF-1000XM5 Truly Wireless Noise Canceling Earbuds - Black',
    category: 'Audio',
    subcategory: 'True Wireless Earbuds',
    brand: 'Sony',
    price: 24990,
    discountPrice: 20990,
    costPrice: 16500,
    stock: 18,
    sku: 'SON-WFXM5-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'The best noise canceling technology with Integrated Processor V2 and HD Noise Canceling Processor QN2e. 8h battery + 16h case.',
    slug: 'sony-wf-1000xm5-earbuds-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=800',
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-BOS-SOUNDLINKFLEX',
    name: 'Bose SoundLink Flex Bluetooth Speaker - Black',
    category: 'Audio',
    subcategory: 'Bluetooth Speakers',
    brand: 'Bose',
    price: 15900,
    discountPrice: 13900,
    costPrice: 10800,
    stock: 16,
    sku: 'BOS-SLF-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'PositionIQ technology automatically optimizes sound for any orientation. IP67 waterproof and dustproof (it floats!).',
    slug: 'bose-soundlink-flex-speaker-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-JBL-CHARGE5',
    name: 'JBL Charge 5 Portable Wi-Fi & Bluetooth Speaker - Black',
    category: 'Audio',
    subcategory: 'Bluetooth Speakers',
    brand: 'JBL',
    price: 18999,
    discountPrice: 14999,
    costPrice: 11500,
    stock: 20,
    sku: 'JBL-CHG5-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'JBL Original Pro Sound with long excursion driver, separate tweeter, dual bass radiators. Built-in powerbank charges your devices.',
    slug: 'jbl-charge-5-bluetooth-speaker',
    imageUrls: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-APP-AIRPODSMAX',
    name: 'Apple AirPods Max - Space Gray',
    category: 'Audio',
    subcategory: 'Over-Ear Headphones',
    brand: 'Apple',
    price: 59900,
    discountPrice: 53900,
    costPrice: 44000,
    stock: 9,
    sku: 'APP-APM-GRY',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Apple-designed dynamic driver provides high-fidelity audio. Computational audio combines custom acoustic design with H1 chips.',
    slug: 'apple-airpods-max-space-gray',
    imageUrls: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SAM-BUDS3PRO',
    name: 'Samsung Galaxy Buds3 Pro - Silver',
    category: 'Audio',
    subcategory: 'True Wireless Earbuds',
    brand: 'Samsung',
    price: 19999,
    discountPrice: 17999,
    costPrice: 14000,
    stock: 14,
    sku: 'SAM-BD3P-SLV',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Iconic blade design with Blade Lights, 24-bit Hi-Fi audio, dual amplifiers and dual woofer/tweeter drivers, Galaxy AI interpreter mode.',
    slug: 'samsung-galaxy-buds3-pro-silver',
    imageUrls: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=800',
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-ONE-BUDSPRO3',
    name: 'OnePlus Buds Pro 3 - Midnight Shadow',
    category: 'Audio',
    subcategory: 'True Wireless Earbuds',
    brand: 'OnePlus',
    price: 13999,
    discountPrice: 11999,
    costPrice: 9200,
    stock: 22,
    sku: 'ONE-BP3-MID',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Co-created with Dynaudio, dual drivers (11mm woofer + 6mm tweeter), 50dB Smart Adaptive Noise Cancellation, 43 hours battery.',
    slug: 'oneplus-buds-pro-3-midnight-shadow',
    imageUrls: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=800',
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SON-WHCH720N',
    name: 'Sony WH-CH720N Wireless Noise Canceling Headphones - Blue',
    category: 'Audio',
    subcategory: 'Over-Ear Headphones',
    brand: 'Sony',
    price: 14990,
    discountPrice: 9990,
    costPrice: 7600,
    stock: 28,
    sku: 'SON-CH720-BLU',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Lightweight ergonomic design (192g), Integrated Processor V1 for noise cancellation, 35-hour battery life with fast charge.',
    slug: 'sony-wh-ch720n-headphones-blue',
    imageUrls: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-JBL-PARTYBOX110',
    name: 'JBL PartyBox 110 Portable Party Speaker (160W, Dynamic Light Show)',
    category: 'Audio',
    subcategory: 'Party Speakers',
    brand: 'JBL',
    price: 35999,
    discountPrice: 27999,
    costPrice: 22000,
    stock: 7,
    sku: 'JBL-PB110-160W',
    status: 'Active',
    deliveryAvailable: true,
    description: '160 Watts of powerful JBL Original Pro Sound, dynamic LED light show synced to the beat, mic & guitar inputs, IPX4 splashproof.',
    slug: 'jbl-partybox-110-speaker',
    imageUrls: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-NOT-EAR-WHT',
    name: 'Nothing Ear Wireless Earbuds - White',
    category: 'Audio',
    subcategory: 'True Wireless Earbuds',
    brand: 'Nothing',
    price: 14999,
    discountPrice: 11999,
    costPrice: 9000,
    stock: 20,
    sku: 'NOT-EAR-WHT',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Custom 11mm ceramic driver for crisp highs and deep bass, 45dB Smart Active Noise Cancellation, Advanced EQ with sound profile sharing.',
    slug: 'nothing-ear-earbuds-white',
    imageUrls: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=800',
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'
    ]
  },

  // --- SMARTWATCHES & WEARABLES (10 Products) ---
  {
    productId: 'PRD-APP-WATCHULTRA2',
    name: 'Apple Watch Ultra 2 (GPS + Cellular, 49mm Titanium Case)',
    category: 'Smartwatches',
    subcategory: 'Rugged Smartwatches',
    brand: 'Apple',
    price: 89900,
    discountPrice: 84900,
    costPrice: 71000,
    stock: 12,
    sku: 'APP-AWU2-49-TIT',
    status: 'Active',
    deliveryAvailable: true,
    description: 'S9 SiP with Double Tap gesture, 3000 nits brightest display, precision dual-frequency GPS, 36 hours battery life (72h low power).',
    slug: 'apple-watch-ultra-2-49mm',
    imageUrls: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SAM-WATCH6CLASSIC',
    name: 'Samsung Galaxy Watch6 Classic (47mm LTE, Black)',
    category: 'Smartwatches',
    subcategory: 'Lifestyle Smartwatches',
    brand: 'Samsung',
    price: 43999,
    discountPrice: 36999,
    costPrice: 29000,
    stock: 15,
    sku: 'SAM-GW6C-47-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Iconic rotating bezel design, 30% larger Sapphire Crystal display, advanced sleep coaching, ECG & blood pressure monitoring.',
    slug: 'samsung-galaxy-watch6-classic-47mm',
    imageUrls: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-GARMIN-FORERUNNER265',
    name: 'Garmin Forerunner 265 GPS Running Smartwatch - Black',
    category: 'Smartwatches',
    subcategory: 'Sports & Fitness Watches',
    brand: 'Garmin',
    price: 50490,
    discountPrice: 46990,
    costPrice: 38000,
    stock: 10,
    sku: 'GAR-FR265-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Vibrant AMOLED touchscreen display, training readiness insights, multi-band GPS precision, up to 13 days of battery life.',
    slug: 'garmin-forerunner-265-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-APP-WATCHSERIES9',
    name: 'Apple Watch Series 9 (GPS 45mm Midnight Aluminum Case)',
    category: 'Smartwatches',
    subcategory: 'Lifestyle Smartwatches',
    brand: 'Apple',
    price: 44900,
    discountPrice: 39900,
    costPrice: 32500,
    stock: 20,
    sku: 'APP-AWS9-45-MID',
    status: 'Active',
    deliveryAvailable: true,
    description: 'S9 SiP powers 2000 nits display, Double Tap gesture, faster on-device Siri, Precision Finding for iPhone.',
    slug: 'apple-watch-series-9-45mm',
    imageUrls: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-FOS-GEN6TOUCHSCREEN',
    name: 'Fossil Gen 6 Touchscreen Smartwatch with Brown Leather Strap',
    category: 'Smartwatches',
    subcategory: 'Fashion Smartwatches',
    brand: 'Fossil',
    price: 23995,
    discountPrice: 17995,
    costPrice: 13500,
    stock: 14,
    sku: 'FOS-G6-LEA-BRN',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Snapdragon Wear 4100+ platform, fast charging (80% in 30 mins), SpO2 sensor, Wear OS by Google.',
    slug: 'fossil-gen-6-smartwatch-leather',
    imageUrls: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-TIT-CRESTPREMIUM',
    name: 'Titan Crest Premium Mesh Strap Smartwatch - Black',
    category: 'Smartwatches',
    subcategory: 'Fashion Smartwatches',
    brand: 'Titan',
    price: 11995,
    discountPrice: 7995,
    costPrice: 5800,
    stock: 25,
    sku: 'TIT-CRST-MSH-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: '1.43" AMOLED Display (466x466), Premium Stainless Steel Mesh strap, Single Sync BT Calling, 100+ Sports modes.',
    slug: 'titan-crest-smartwatch-mesh-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SAM-WATCHFIT3',
    name: 'Samsung Galaxy Fit3 Fitness Tracker - Pink Gold',
    category: 'Smartwatches',
    subcategory: 'Fitness Bands',
    brand: 'Samsung',
    price: 4999,
    discountPrice: 4499,
    costPrice: 3400,
    stock: 30,
    sku: 'SAM-FIT3-PNK',
    status: 'Active',
    deliveryAvailable: true,
    description: '1.6" large AMOLED display, 13-day long battery life, 100+ workout tracking, fall detection and SOS alerts.',
    slug: 'samsung-galaxy-fit3-pink-gold',
    imageUrls: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-GAR-VENU3S',
    name: 'Garmin Venu 3S Fitness Smartwatch - Soft Gold with Dust Rose Strap',
    category: 'Smartwatches',
    subcategory: 'Sports & Fitness Watches',
    brand: 'Garmin',
    price: 50990,
    discountPrice: 45990,
    costPrice: 37000,
    stock: 8,
    sku: 'GAR-VENU3S-GLD',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Body Battery energy monitoring, Sleep Coach with HRV status, built-in speaker and mic for phone calls.',
    slug: 'garmin-venu-3s-soft-gold',
    imageUrls: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-GOO-PIXELWATCH2',
    name: 'Google Pixel Watch 2 (WiFi, Matte Black Case / Obsidian Band)',
    category: 'Smartwatches',
    subcategory: 'Lifestyle Smartwatches',
    brand: 'Google',
    price: 39900,
    discountPrice: 34900,
    costPrice: 28000,
    stock: 14,
    sku: 'GOO-PW2-WIFI-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Three all-new heart rate sensors, cEDA stress detection sensor, Safety Check, seamlessly integrated with Fitbit.',
    slug: 'google-pixel-watch-2-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-NOT-WATCHPRO',
    name: 'CMF by Nothing Watch Pro - Dark Grey',
    category: 'Smartwatches',
    subcategory: 'Budget Smartwatches',
    brand: 'Nothing',
    price: 4999,
    discountPrice: 3499,
    costPrice: 2600,
    stock: 40,
    sku: 'CMF-WPRO-GRY',
    status: 'Active',
    deliveryAvailable: true,
    description: '1.96" AMOLED Display with 58 FPS, Bluetooth Calls with AI Noise Reduction, Multi-system Built-in GPS, 13-day battery.',
    slug: 'cmf-by-nothing-watch-pro-dark-grey',
    imageUrls: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800'
    ]
  },

  // --- HOME APPLIANCES & TV (10 Products) ---
  {
    productId: 'PRD-LG-OLEDC3-55',
    name: 'LG 55" Class C3 Series OLED evo 4K Smart TV',
    category: 'Home Appliances',
    subcategory: 'Smart TVs',
    brand: 'LG',
    price: 169990,
    discountPrice: 124990,
    costPrice: 98000,
    stock: 7,
    sku: 'LG-OLED55C3-4K',
    status: 'Active',
    deliveryAvailable: true,
    description: 'α9 AI Processor Gen6, Brightness Booster, Dolby Vision & Atmos, 0.1ms response time with 120Hz refresh rate and G-Sync.',
    slug: 'lg-55-inch-c3-oled-4k-tv',
    imageUrls: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800',
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=800',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SAM-THEFRAME-55',
    name: 'Samsung 55" The Frame QLED 4K Smart TV',
    category: 'Home Appliances',
    subcategory: 'Smart TVs',
    brand: 'Samsung',
    price: 124990,
    discountPrice: 89990,
    costPrice: 72000,
    stock: 9,
    sku: 'SAM-FRAME55-QLED',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Art Mode transforms TV into personal art gallery. Matte Display prevents reflections. Quantum Processor 4K with 100% Color Volume.',
    slug: 'samsung-55-inch-the-frame-qled-4k-tv',
    imageUrls: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=800',
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-DYS-V15DETECT',
    name: 'Dyson V15 Detect Cordless Vacuum Cleaner',
    category: 'Home Appliances',
    subcategory: 'Vacuum Cleaners',
    brand: 'Dyson',
    price: 65900,
    discountPrice: 59900,
    costPrice: 48000,
    stock: 10,
    sku: 'DYS-V15-DETECT',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Laser reveals microscopic dust. Piezo sensor automatically adapts suction power. LCD screen displays real-time proof of deep clean.',
    slug: 'dyson-v15-detect-cordless-vacuum',
    imageUrls: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=800',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-PHI-AIRFRYER-HD9252',
    name: 'Philips Digital Air Fryer HD9252/90 (4.1 Liter, 1400W)',
    category: 'Home Appliances',
    subcategory: 'Kitchen Appliances',
    brand: 'Philips',
    price: 11995,
    discountPrice: 8995,
    costPrice: 6500,
    stock: 25,
    sku: 'PHI-AF-HD9252',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Rapid Air technology for up to 90% less fat. Touch screen with 7 presets for easy cooking. NutriU app integration.',
    slug: 'philips-digital-air-fryer-hd9252',
    imageUrls: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-PRE-INDUCTION-PIC20',
    name: 'Prestige PIC 20.0 2000-Watt Induction Cooktop',
    category: 'Home Appliances',
    subcategory: 'Kitchen Appliances',
    brand: 'Prestige',
    price: 3895,
    discountPrice: 2295,
    costPrice: 1700,
    stock: 45,
    sku: 'PRE-IND-PIC20',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Push button controls, Indian menu preset options, automatic voltage regulator, anti-magnetic wall design.',
    slug: 'prestige-pic-20-induction-cooktop',
    imageUrls: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=800',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-LG-REFRIGERATOR-408L',
    name: 'LG 408L 3 Star Frost Free Double Door Refrigerator - Shiny Steel',
    category: 'Home Appliances',
    subcategory: 'Refrigerators',
    brand: 'LG',
    price: 58990,
    discountPrice: 46990,
    costPrice: 38000,
    stock: 6,
    sku: 'LG-REF-408L-SS',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Smart Inverter Compressor, Door Cooling+, Convertible 3-in-1 mode, Auto Smart Connect (connects to home inverter).',
    slug: 'lg-408l-frost-free-refrigerator',
    imageUrls: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=800',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-PHI-GARMENTSTEAMER',
    name: 'Philips EasyTouch Stand Garment Steamer (1800W, 1.4L Water Tank)',
    category: 'Home Appliances',
    subcategory: 'Garment Care',
    brand: 'Philips',
    price: 9995,
    discountPrice: 7995,
    costPrice: 5800,
    stock: 18,
    sku: 'PHI-GS-EASYTOUCH',
    status: 'Active',
    deliveryAvailable: true,
    description: '20% more powerful steam output, 5 steam settings for different fabrics, integrated adjustable pole and glove for safety.',
    slug: 'philips-easytouch-garment-steamer',
    imageUrls: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SON-BRAVIAX80L-55',
    name: 'Sony Bravia 55" X80L Series 4K Ultra HD Smart LED Google TV',
    category: 'Home Appliances',
    subcategory: 'Smart TVs',
    brand: 'Sony',
    price: 99900,
    discountPrice: 77990,
    costPrice: 62000,
    stock: 8,
    sku: 'SON-BRV55-X80L',
    status: 'Active',
    deliveryAvailable: true,
    description: '4K HDR Processor X1 delivers smooth, clear picture. Triluminos Pro reproduces over a billion accurate colors. Motionflow XR 200.',
    slug: 'sony-bravia-55-inch-x80l-4k-google-tv',
    imageUrls: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800',
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=800',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-DYS-AIRWRAP-MULTI',
    name: 'Dyson Airwrap Multi-Styler Complete Long (Strawberry Bronze/Blush Pink)',
    category: 'Home Appliances',
    subcategory: 'Personal Care Appliances',
    brand: 'Dyson',
    price: 49900,
    discountPrice: 45900,
    costPrice: 37000,
    stock: 12,
    sku: 'DYS-AIRWRAP-LONG',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Curl, shape, smooth, and hide flyaways using the Coanda effect with no extreme heat damage. Intelligent heat control.',
    slug: 'dyson-airwrap-multi-styler-complete-long',
    imageUrls: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800',
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=800',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-PRE-MIXER-ZODIAC',
    name: 'Prestige Zodiac 2.0 750W Mixer Grinder with 4 Jars',
    category: 'Home Appliances',
    subcategory: 'Kitchen Appliances',
    brand: 'Prestige',
    price: 6995,
    discountPrice: 4995,
    costPrice: 3800,
    stock: 22,
    sku: 'PRE-MIX-ZODIAC-750',
    status: 'Active',
    deliveryAvailable: true,
    description: '750W heavy duty motor, 3 stainless steel jars + 1 juicer jar, 3-speed control with pulse function, overload protection.',
    slug: 'prestige-zodiac-750w-mixer-grinder',
    imageUrls: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=800',
      'https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800'
    ]
  },

  // --- CAMERAS & ACCESORIES (10 Products) ---
  {
    productId: 'PRD-SON-A7IV-BODY',
    name: 'Sony Alpha 7 IV Full-Frame Mirrorless Camera Body',
    category: 'Cameras',
    subcategory: 'Mirrorless Cameras',
    brand: 'Sony',
    price: 242990,
    discountPrice: 219990,
    costPrice: 182000,
    stock: 8,
    sku: 'SON-A7IV-BODY',
    status: 'Active',
    deliveryAvailable: true,
    description: '33MP Exmor R CMOS sensor, BIONZ XR image processor, 4K 60p 10-bit 4:2:2 movie recording, Real-time Eye AF for human/animal/bird.',
    slug: 'sony-alpha-7-iv-mirrorless-camera-body',
    imageUrls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-CAN-EOSR6II-BODY',
    name: 'Canon EOS R6 Mark II Full-Frame Mirrorless Camera Body',
    category: 'Cameras',
    subcategory: 'Mirrorless Cameras',
    brand: 'Canon',
    price: 243995,
    discountPrice: 214995,
    costPrice: 178000,
    stock: 6,
    sku: 'CAN-R6MK2-BODY',
    status: 'Active',
    deliveryAvailable: true,
    description: '24.2MP Full-frame CMOS sensor, Dual Pixel CMOS AF II, up to 40 fps electronic shutter shooting, 4K 60p oversampled from 6K.',
    slug: 'canon-eos-r6-mark-ii-camera-body',
    imageUrls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-GOP-HERO12BLACK',
    name: 'GoPro HERO12 Black Action Camera',
    category: 'Cameras',
    subcategory: 'Action Cameras',
    brand: 'GoPro',
    price: 45000,
    discountPrice: 37990,
    costPrice: 31000,
    stock: 20,
    sku: 'GOP-HERO12-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Incredible 5.3K video quality, HyperSmooth 6.0 video stabilization with Horizon Lock, HDR video and photos, waterproof to 33ft.',
    slug: 'gopro-hero12-black-action-camera',
    imageUrls: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=800',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-NIK-Z6II-KIT',
    name: 'Nikon Z6 II Mirrorless Camera with 24-70mm f/4 Lens Kit',
    category: 'Cameras',
    subcategory: 'Mirrorless Cameras',
    brand: 'Nikon',
    price: 209995,
    discountPrice: 189995,
    costPrice: 156000,
    stock: 7,
    sku: 'NIK-Z6MK2-KIT',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Dual EXPEED 6 processors, 24.5MP BSI CMOS sensor, dual card slots (CFexpress + SD), 4K 60p video capture.',
    slug: 'nikon-z6-ii-camera-24-70mm-kit',
    imageUrls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SND-EXTREME1TB',
    name: 'SanDisk 1TB Extreme Portable SSD (V2, Up to 1050MB/s USB 3.2 Gen 2)',
    category: 'Cameras',
    subcategory: 'Memory & Storage',
    brand: 'SanDisk',
    price: 18000,
    discountPrice: 9499,
    costPrice: 7200,
    stock: 35,
    sku: 'SND-EXTSSD-1TB',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Ruggedized design with up to 2-meter drop protection and IP55 water & dust resistance. USB 3.2 Gen 2 NVMe speeds.',
    slug: 'sandisk-1tb-extreme-portable-ssd',
    imageUrls: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=800',
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?q=80&w=800',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SND-SDCARD128',
    name: 'SanDisk 128GB Extreme PRO SDXC UHS-I Memory Card (Up to 200MB/s)',
    category: 'Cameras',
    subcategory: 'Memory & Storage',
    brand: 'SanDisk',
    price: 3999,
    discountPrice: 2199,
    costPrice: 1600,
    stock: 50,
    sku: 'SND-SD128GB-EXPRO',
    status: 'Active',
    deliveryAvailable: true,
    description: 'V30 speed class suitable for 4K UHD video recording, shot speeds up to 140MB/s, temperature/water/shock proof.',
    slug: 'sandisk-128gb-extreme-pro-sd-card',
    imageUrls: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=800',
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?q=80&w=800',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-CAN-EF50MM',
    name: 'Canon EF 50mm f/1.8 STM Lens for DSLR Cameras',
    category: 'Cameras',
    subcategory: 'Camera Lenses',
    brand: 'Canon',
    price: 9995,
    discountPrice: 8995,
    costPrice: 6800,
    stock: 25,
    sku: 'CAN-EF50MM-STM',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Compact light prime lens with large f/1.8 aperture for low light photography and soft background blur (bokeh).',
    slug: 'canon-ef-50mm-f18-stm-lens',
    imageUrls: [
      'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=800',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SON-FE2470GM2',
    name: 'Sony FE 24-70mm f/2.8 GM II Full-Frame Zoom Lens',
    category: 'Cameras',
    subcategory: 'Camera Lenses',
    brand: 'Sony',
    price: 214990,
    discountPrice: 199990,
    costPrice: 165000,
    stock: 5,
    sku: 'SON-FE2470-GM2',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Lightest & smallest standard f/2.8 zoom lens in its class. Four XD Linear Motors for lightning fast AF.',
    slug: 'sony-fe-24-70mm-f28-gm-ii-lens',
    imageUrls: [
      'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=800',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-NIK-Z50-KIT',
    name: 'Nikon Z50 Mirrorless Camera Body with NIKKOR Z DX 16-50mm Lens',
    category: 'Cameras',
    subcategory: 'Mirrorless Cameras',
    brand: 'Nikon',
    price: 85995,
    discountPrice: 74995,
    costPrice: 61000,
    stock: 12,
    sku: 'NIK-Z50-1650-KIT',
    status: 'Active',
    deliveryAvailable: true,
    description: '20.9MP DX-Format CMOS sensor, Eye-Detection AF, flip-down LCD screen tailored for vlogging, 4K UHD video.',
    slug: 'nikon-z50-camera-16-50mm-kit',
    imageUrls: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-GOP-VOLTABATTERYGRIP',
    name: 'GoPro Volta External Battery Grip / Tripod / Remote',
    category: 'Cameras',
    subcategory: 'Camera Accessories',
    brand: 'GoPro',
    price: 13900,
    discountPrice: 11900,
    costPrice: 9100,
    stock: 18,
    sku: 'GOP-VOLTA-GRIP',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Built-in 4900 mAh battery triples camera battery life. Integrated camera buttons for easy one-handed control, folds into tripod.',
    slug: 'gopro-volta-battery-grip',
    imageUrls: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=800',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=800'
    ]
  },

  // --- PERIPHERALS & NETWORKING (10 Products) ---
  {
    productId: 'PRD-LOG-MXMASTER3S',
    name: 'Logitech MX Master 3S Wireless Performance Mouse - Graphite',
    category: 'Computer Peripherals',
    subcategory: 'Computer Mice',
    brand: 'Logitech',
    price: 10995,
    discountPrice: 9495,
    costPrice: 7200,
    stock: 30,
    sku: 'LOG-MXM3S-GRP',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Quiet Clicks technology with 8000 DPI track-on-glass sensor. MagSpeed electromagnetic scrolling up to 1000 lines per second.',
    slug: 'logitech-mx-master-3s-mouse-graphite',
    imageUrls: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-LOG-MXKEYS-S',
    name: 'Logitech MX Keys S Wireless Illuminated Keyboard - Graphite',
    category: 'Computer Peripherals',
    subcategory: 'Keyboards',
    brand: 'Logitech',
    price: 13295,
    discountPrice: 11495,
    costPrice: 8900,
    stock: 25,
    sku: 'LOG-MXKS-GRP',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Perfect Stroke spherically-dished keys matching shape of fingertips. Smart backlighting adjusts to environment.',
    slug: 'logitech-mx-keys-s-keyboard-graphite',
    imageUrls: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-TPL-ARCHERAX73',
    name: 'TP-Link Archer AX73 Dual-Band Gigabit Wi-Fi 6 Router (5400 Mbps)',
    category: 'Computer Peripherals',
    subcategory: 'Networking & Routers',
    brand: 'TP-Link',
    price: 14999,
    discountPrice: 9999,
    costPrice: 7800,
    stock: 20,
    sku: 'TPL-AX73-AX5400',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Full-featured Wi-Fi 6 up to 5.4 Gbps. 6 high-gain antennas with Beamforming for broad coverage. HomeShield security.',
    slug: 'tp-link-archer-ax73-wifi6-router',
    imageUrls: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SAM-T7SHIELD-1TB',
    name: 'Samsung T7 Shield 1TB Portable SSD - Black (Up to 1050MB/s)',
    category: 'Computer Peripherals',
    subcategory: 'External Hard Drives & SSDs',
    brand: 'Samsung',
    price: 15999,
    discountPrice: 8999,
    costPrice: 6900,
    stock: 40,
    sku: 'SAM-T7SH-1TB-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Rugged elastomer outer casing protects against 3-meter drops. IP65 dust and water resistant, PCIe NVMe speeds.',
    slug: 'samsung-t7-shield-1tb-portable-ssd-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=800',
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?q=80&w=800',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-ANK-737POWERBANK',
    name: 'Anker 737 Power Bank (PowerCore 24K, 24000mAh 140W Output)',
    category: 'Computer Peripherals',
    subcategory: 'Power Banks & Chargers',
    brand: 'Anker',
    price: 14999,
    discountPrice: 11999,
    costPrice: 9100,
    stock: 18,
    sku: 'ANK-737-24K-140W',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Ultra-powerful bi-directional 140W charging with Smart Digital Display showing output/input power and estimated recharge time.',
    slug: 'anker-737-power-bank-24000mah-140w',
    imageUrls: [
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?q=80&w=800',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-LOG-C920PRO',
    name: 'Logitech C920 HD Pro Webcam (Full HD 1080p Video Calling)',
    category: 'Computer Peripherals',
    subcategory: 'Webcams',
    brand: 'Logitech',
    price: 8995,
    discountPrice: 6495,
    costPrice: 4800,
    stock: 35,
    sku: 'LOG-C920-FHD',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Full HD 1080p at 30fps with automatic HD light correction, dual stereo microphones, premium glass lens.',
    slug: 'logitech-c920-hd-pro-webcam',
    imageUrls: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-TPL-DECOx50-3PACK',
    name: 'TP-Link Deco X50 AX3000 Mesh Wi-Fi 6 System (3-Pack)',
    category: 'Computer Peripherals',
    subcategory: 'Networking & Routers',
    brand: 'TP-Link',
    price: 24999,
    discountPrice: 18999,
    costPrice: 14800,
    stock: 10,
    sku: 'TPL-DECO-X50-3P',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Covers up to 6500 sq ft with seamless AI-driven Mesh Wi-Fi 6 up to 3.0 Gbps. Connect up to 150 devices.',
    slug: 'tp-link-deco-x50-mesh-wifi6-3pack',
    imageUrls: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-ANK-737CHARGER-120W',
    name: 'Anker 737 Charger (GaNPrime 120W 3-Port USB-C Fast Wall Charger)',
    category: 'Computer Peripherals',
    subcategory: 'Power Banks & Chargers',
    brand: 'Anker',
    price: 8999,
    discountPrice: 6999,
    costPrice: 5300,
    stock: 28,
    sku: 'ANK-GANP-120W',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Power 3 devices at once with 2 USB-C ports and 1 USB-A port. ActiveShield 2.0 dynamic temperature monitoring.',
    slug: 'anker-737-ganprime-120w-charger',
    imageUrls: [
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?q=80&w=800',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-SND-DUALDRIVE128',
    name: 'SanDisk 128GB Ultra Dual Drive Luxe USB Type-C (Up to 150MB/s)',
    category: 'Computer Peripherals',
    subcategory: 'Flash Drives',
    brand: 'SanDisk',
    price: 2200,
    discountPrice: 1299,
    costPrice: 950,
    stock: 60,
    sku: 'SND-LUXE-128GB-C',
    status: 'Active',
    deliveryAvailable: true,
    description: '2-in-1 all-metal flash drive with reversible USB Type-C and traditional Type-A connectors. Swivel design.',
    slug: 'sandisk-128gb-ultra-dual-drive-luxe-type-c',
    imageUrls: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=800',
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?q=80&w=800',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-LOG-PROXSUPERLIGHT2',
    name: 'Logitech G PRO X SUPERLIGHT 2 Wireless Gaming Mouse - Magenta',
    category: 'Computer Peripherals',
    subcategory: 'Gaming Mice',
    brand: 'Logitech',
    price: 16995,
    discountPrice: 14995,
    costPrice: 11800,
    stock: 15,
    sku: 'LOG-SL2-MAG',
    status: 'Active',
    deliveryAvailable: true,
    description: 'LIGHTFORCE Hybrid switches, HERO 2 Sensor with 32000 DPI, 60g ultralight weight design, 95 hours battery life.',
    slug: 'logitech-g-pro-x-superlight-2-magenta',
    imageUrls: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800'
    ]
  },

  // --- FASHION & APPAREL (15 Products) ---
  {
    productId: 'PRD-NIK-AIRFORCE1-07',
    name: "Nike Air Force 1 '07 Men's Sneakers - Triple White",
    category: 'Fashion',
    subcategory: 'Footwear & Sneakers',
    brand: 'Nike',
    price: 9695,
    discountPrice: 8195,
    costPrice: 6200,
    stock: 25,
    sku: 'NIK-AF1-07-WHT',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Stitched leather overlays on the upper add heritage style, durability, and support. Nike Air cushioning adds lightweight comfort.',
    slug: 'nike-air-force-1-07-white',
    imageUrls: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-ADI-ULTRABOOSTLIGHT',
    name: "Adidas Ultraboost Light Running Shoes - Core Black",
    category: 'Fashion',
    subcategory: 'Footwear & Sneakers',
    brand: 'Adidas',
    price: 18999,
    discountPrice: 13999,
    costPrice: 10500,
    stock: 20,
    sku: 'ADI-UBL-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: '30% lighter Light BOOST material. Primeknit+ textile upper provides adaptive fit, Continental Rubber outsole.',
    slug: 'adidas-ultraboost-light-running-shoes',
    imageUrls: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-PUM-VELOCITYNITRO3',
    name: "Puma Velocity Nitro 3 Men's Running Shoes - Sun Stream",
    category: 'Fashion',
    subcategory: 'Footwear & Sneakers',
    brand: 'Puma',
    price: 11999,
    discountPrice: 8999,
    costPrice: 6800,
    stock: 18,
    sku: 'PUM-VELN3-SUN',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Advanced NITROFOAM technology providing superior responsiveness and cushioning in a lightweight package. PUMAGRIP outsole.',
    slug: 'puma-velocity-nitro-3-running-shoes',
    imageUrls: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-LEV-501ORIGINAL',
    name: "Levi's 501 Original Fit Jeans - Medium Indigo",
    category: 'Fashion',
    subcategory: 'Men Jeans',
    brand: "Levi's",
    price: 4599,
    discountPrice: 3499,
    costPrice: 2400,
    stock: 35,
    sku: 'LEV-501-IND',
    status: 'Active',
    deliveryAvailable: true,
    description: 'The original blue jean since 1873. Signature button fly, iconic straight leg fit, 100% heavyweight cotton denim.',
    slug: 'levis-501-original-fit-jeans',
    imageUrls: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-NIK-PEGASUS41',
    name: "Nike Pegasus 41 Road Running Shoes - Volt / Black",
    category: 'Fashion',
    subcategory: 'Footwear & Sneakers',
    brand: 'Nike',
    price: 11895,
    discountPrice: 10295,
    costPrice: 8100,
    stock: 22,
    sku: 'NIK-PEG41-VLT',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Dual Air Zoom units combined with ReactX foam midsole for responsive energy return. Engineered mesh upper.',
    slug: 'nike-pegasus-41-running-shoes',
    imageUrls: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-ADI-SAMBAOG',
    name: "Adidas Samba OG Shoes - Cloud White / Core Black",
    category: 'Fashion',
    subcategory: 'Footwear & Sneakers',
    brand: 'Adidas',
    price: 10999,
    discountPrice: 9999,
    costPrice: 7500,
    stock: 30,
    sku: 'ADI-SAMBA-WHT',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Full grain leather upper with gritty suede details and classic gum rubber outsole. Iconic 3-Stripes.',
    slug: 'adidas-samba-og-shoes-white',
    imageUrls: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-PUM-SMASHV2',
    name: "Puma Smash v2 Leather Sneakers - White/Black",
    category: 'Fashion',
    subcategory: 'Footwear & Sneakers',
    brand: 'Puma',
    price: 4999,
    discountPrice: 2999,
    costPrice: 2100,
    stock: 40,
    sku: 'PUM-SMASH-WHT',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Clean tennis-inspired silhouette with soft leather upper, durable rubber outsole for grip, classic Formstrip.',
    slug: 'puma-smash-v2-leather-sneakers',
    imageUrls: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-LEV-TRUCKERJACKET',
    name: "Levi's Original Trucker Jacket - Dark Wash Denim",
    category: 'Fashion',
    subcategory: 'Jackets & Outerwear',
    brand: "Levi's",
    price: 6599,
    discountPrice: 4999,
    costPrice: 3600,
    stock: 18,
    sku: 'LEV-TRK-DARK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'The original jean jacket since 1967. Point collar, front button placket, welt hand pockets and spade chest pockets.',
    slug: 'levis-original-trucker-jacket-dark-wash',
    imageUrls: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-NIK-TECHFLEECEHOODIE',
    name: "Nike Sportswear Tech Fleece Windrunner Full-Zip Hoodie",
    category: 'Fashion',
    subcategory: 'Hoodies & Sweatshirts',
    brand: 'Nike',
    price: 8495,
    discountPrice: 6995,
    costPrice: 5200,
    stock: 20,
    sku: 'NIK-TF-HOOD-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Smooth on both sides, Tech Fleece delivers premium warmth and elevated look without adding weight or bulk.',
    slug: 'nike-tech-fleece-windrunner-hoodie',
    imageUrls: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-ADI-TIRO23TRACKPANTS',
    name: "Adidas Tiro 23 League Training Track Pants - Black",
    category: 'Fashion',
    subcategory: 'Track Pants & Joggers',
    brand: 'Adidas',
    price: 3999,
    discountPrice: 2999,
    costPrice: 2100,
    stock: 30,
    sku: 'ADI-TIRO23-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Moisture-absorbing AEROREADY fabric keeps you dry. Ankle zips for easy on and off over boots or shoes.',
    slug: 'adidas-tiro-23-track-pants-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-PUM-ESSENTIALSGRAPHIC',
    name: "Puma Essentials Logo Men's Cotton T-Shirt - Black",
    category: 'Fashion',
    subcategory: 'T-Shirts',
    brand: 'Puma',
    price: 1499,
    discountPrice: 899,
    costPrice: 600,
    stock: 50,
    sku: 'PUM-TEE-ESS-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Regular fit t-shirt crafted from 100% BCI cotton with iconic Puma No. 1 Logo rubber print across the chest.',
    slug: 'puma-essentials-logo-cotton-tshirt',
    imageUrls: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-LEV-SLIMSLTJEANS',
    name: "Levi's 511 Slim Fit Stretchable Jeans - Dark Blue",
    category: 'Fashion',
    subcategory: 'Men Jeans',
    brand: "Levi's",
    price: 4299,
    discountPrice: 3199,
    costPrice: 2200,
    stock: 30,
    sku: 'LEV-511-DBLU',
    status: 'Active',
    deliveryAvailable: true,
    description: 'A modern slim with room to move. Added stretch for all-day comfort, classic 5-pocket styling.',
    slug: 'levis-511-slim-fit-jeans-dark-blue',
    imageUrls: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-TIT-NEO-CHRONO',
    name: "Titan Neo Chronograph Quartz Men's Watch - Blue Dial",
    category: 'Fashion',
    subcategory: 'Watches',
    brand: 'Titan',
    price: 9995,
    discountPrice: 7495,
    costPrice: 5300,
    stock: 18,
    sku: 'TIT-NEO-CHRO-BLU',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Stainless steel case with deep blue dial, date display, 50m water resistance, genuine brown leather strap.',
    slug: 'titan-neo-chronograph-watch-blue-dial',
    imageUrls: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-FOS-NEUTRACHRONO',
    name: "Fossil Neutra Chronograph Stainless Steel Watch - Black",
    category: 'Fashion',
    subcategory: 'Watches',
    brand: 'Fossil',
    price: 14995,
    discountPrice: 11245,
    costPrice: 8100,
    stock: 15,
    sku: 'FOS-NEUT-CHRO-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: '44mm case size, stopwatch functionality with 3 sub-dials, black ion-plated stainless steel bracelet.',
    slug: 'fossil-neutra-chronograph-watch-black',
    imageUrls: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800'
    ]
  },
  {
    productId: 'PRD-NIK-DUFFLEBAG-60L',
    name: "Nike Academy Team Medium Football Duffle Bag (60L)",
    category: 'Fashion',
    subcategory: 'Bags & Accessories',
    brand: 'Nike',
    price: 2995,
    discountPrice: 2395,
    costPrice: 1700,
    stock: 25,
    sku: 'NIK-DUF-60L-BLK',
    status: 'Active',
    deliveryAvailable: true,
    description: 'Durable outer layer protects gear from wet conditions. Main compartment offers spacious storage, wet/dry separator pocket.',
    slug: 'nike-academy-team-duffle-bag-60l',
    imageUrls: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800'
    ]
  }
];

function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      return resolve(true);
    }

    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const client = url.startsWith('https') ? https : http;
    const request = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadImage(response.headers.location, destPath).then(resolve);
      }
      if (response.statusCode !== 200) {
        return resolve(false);
      }
      const file = fs.createWriteStream(destPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(fs.statSync(destPath).size > 1000));
      });
    });

    request.on('error', () => resolve(false));
    request.setTimeout(10000, () => { request.destroy(); resolve(false); });
  });
}

async function build100RealProducts() {
  console.log('======================================================');
  console.log('BUILDING 100 REAL COMMERCIAL PRODUCTS DATASET & IMAGES');
  console.log('======================================================\n');

  console.log(`Configured ${PRODUCTS_DATA.length} real commercial products.`);
  if (PRODUCTS_DATA.length !== 100) {
    throw new Error(`Catalog count error! Expected 100 products, got ${PRODUCTS_DATA.length}`);
  }

  const baseUploadDir = path.join(__dirname, '../public/uploads/products');
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir, { recursive: true });
  }

  let totalImagesVerified = 0;
  const verifiedProducts = [];

  console.log('\n[1/4] Downloading & Verifying 300+ Local Product Images...');
  
  // Download in batches of 10 products concurrently
  for (let i = 0; i < PRODUCTS_DATA.length; i += 10) {
    const batch = PRODUCTS_DATA.slice(i, i + 10);
    await Promise.all(batch.map(async (prod) => {
      const prodSlug = prod.slug;
      const prodDir = path.join(baseUploadDir, prodSlug);
      if (!fs.existsSync(prodDir)) {
        fs.mkdirSync(prodDir, { recursive: true });
      }

      const localImages = [];
      for (let imgIdx = 0; imgIdx < prod.imageUrls.length; imgIdx++) {
        const imgNum = imgIdx + 1;
        const fileName = `${imgNum}.jpg`;
        const localFilePath = path.join(prodDir, fileName);
        const publicUrlPath = `/uploads/products/${prodSlug}/${fileName}`;

        const success = await downloadImage(prod.imageUrls[imgIdx], localFilePath);
        if (success && fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 0) {
          localImages.push(publicUrlPath);
          totalImagesVerified++;
        } else {
          console.error(`❌ Failed image for ${prod.productId} image ${imgNum}`);
        }
      }

      if (localImages.length < 3) {
        throw new Error(`Product ${prod.productId} failed 3 image threshold! Only got ${localImages.length}`);
      }

      verifiedProducts.push({
        productId: prod.productId,
        name: prod.name,
        category: prod.category,
        subcategory: prod.subcategory,
        brand: prod.brand,
        price: prod.price,
        discountPrice: prod.discountPrice,
        costPrice: prod.costPrice,
        stock: prod.stock,
        sku: prod.sku,
        status: prod.status,
        deliveryAvailable: prod.deliveryAvailable,
        description: prod.description,
        images: localImages
      });
    }));
    console.log(` - Processed batch up to product ${Math.min(i + 10, PRODUCTS_DATA.length)}/100 (${totalImagesVerified} images confirmed).`);
  }

  console.log(`\n✓ Downloaded & Verified ${totalImagesVerified} local images across 100 products.`);

  // Write strict_real_products_100.csv
  console.log('\n[2/4] Generating CSV & TXT Dataset Files...');
  const csvContent = csvHandler.exportProductsCSV(verifiedProducts);
  const csvPath = path.join(__dirname, '../strict_real_products_100.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log(` - Created strict_real_products_100.csv (${fs.statSync(csvPath).size} bytes)`);

  const rawTxtPath = path.join(__dirname, '../strict_real_products_100_raw.txt');
  fs.writeFileSync(rawTxtPath, csvContent, 'utf8');
  console.log(` - Created strict_real_products_100_raw.txt (${fs.statSync(rawTxtPath).size} bytes)`);

  const reportJsonPath = path.join(__dirname, '../real_products_100_report.json');
  const reportObj = {
    generatedAt: new Date().toISOString(),
    totalProducts: verifiedProducts.length,
    totalVerifiedImages: totalImagesVerified,
    brandsCount: new Set(verifiedProducts.map(p => p.brand)).size,
    categoriesCount: new Set(verifiedProducts.map(p => p.category)).size,
    subcategoriesCount: new Set(verifiedProducts.map(p => p.subcategory)).size,
    productsSummary: verifiedProducts.map(p => ({
      productId: p.productId,
      name: p.name,
      sku: p.sku,
      brand: p.brand,
      category: p.category,
      price: p.price,
      discountPrice: p.discountPrice,
      costPrice: p.costPrice,
      stock: p.stock,
      imageCount: p.images.length,
      firstImage: p.images[0]
    }))
  };
  fs.writeFileSync(reportJsonPath, JSON.stringify(reportObj, null, 2), 'utf8');
  console.log(` - Created real_products_100_report.json`);

  // Import into MongoDB
  console.log('\n[3/4] Importing 100 Products into MongoDB...');
  const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kumawat_pe';
  await mongoose.connect(MONGODB_URI);

  const importResult = await csvHandler.processProductImport(csvContent, true, null);
  console.log(` - Import Result: Total=${importResult.total}, Successful=${importResult.successCount}, Failed=${importResult.failCount}`);

  if (importResult.failCount > 0) {
    console.error('Import Errors:', importResult.errors);
    throw new Error('Bulk CSV Import of 100 products had failures!');
  }

  const finalDbCount = await Product.countDocuments();
  console.log(`\n[4/4] Database Verification:`);
  console.log(` - Total Products now in MongoDB: ${finalDbCount}`);

  await mongoose.disconnect();

  console.log('\n======================================================');
  console.log('100 REAL COMMERCIAL PRODUCTS & 300+ IMAGES FULLY READY');
  console.log('======================================================');
}

build100RealProducts().catch(err => {
  console.error('\nBuild Error:', err);
  process.exit(1);
});
