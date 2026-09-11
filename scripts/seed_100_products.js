const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');
const Order = require('../models/Order');

const productsData = [
  // ── 1. SMARTPHONES (10) ──────────────────────────────────────────────────
  {
    productId: 'PRD-IPHONE15PROMAX-256',
    name: 'Apple iPhone 15 Pro Max (256GB) - Natural Titanium',
    category: 'Smartphones',
    brand: 'Apple',
    price: 159900,
    discountPrice: 148900,
    stock: 18,
    sku: 'AAPL-IP15PM-256-NT',
    status: 'Active',
    badges: ['Flagship', 'Bestseller', 'A17 Pro'],
    features: [
      '6.7-inch Super Retina XDR OLED Display with ProMotion 120Hz',
      'A17 Pro Bionic Chip with 6-core GPU for Console-level Gaming',
      '48MP Main Camera + 12MP 5x Telephoto + 12MP Ultra Wide',
      'Grade 5 Titanium Frame with Textured Matte Glass Back',
      'Action Button, USB-C Port with USB 3 Speeds (10Gbps)',
      'All-day battery life with up to 29 hours video playback'
    ],
    description: 'iPhone 15 Pro Max is forged in titanium and features the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever with 5x Optical Zoom.',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop'
    ],
    packageContents: ['iPhone 15 Pro Max', 'USB-C Charge Cable (1m)', 'Documentation'],
    specifications: {
      general: { modelNumber: 'MU773HN/A', countryOfOrigin: 'India / China', color: 'Natural Titanium' },
      electrical: { batteryCapacity: '4422 mAh', chargingSpeed: '20W Fast Charging, 15W MagSafe', voltage: '5V' },
      physical: { weight: '221g', dimensions: '159.9 x 76.7 x 8.25 mm', displaySize: '6.7 Inches' },
      warranty: { duration: '1 Year Manufacturer Warranty', coverage: 'Defects in material and workmanship' },
      technical: { processor: 'Apple A17 Pro (3nm)', ram: '8 GB', storage: '256 GB', operatingSystem: 'iOS 17', camera: '48MP + 12MP + 12MP' }
    },
    ratings: { average: 4.8, count: 142 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-IPHONE15-128',
    name: 'Apple iPhone 15 (128GB) - Black',
    category: 'Smartphones',
    brand: 'Apple',
    price: 79900,
    discountPrice: 70900,
    stock: 25,
    sku: 'AAPL-IP15-128-BLK',
    status: 'Active',
    badges: ['Dynamic Island', '48MP Camera'],
    features: [
      'Dynamic Island bubbles up alerts and Live Activities',
      '48MP Main camera with 2x Telephoto lens',
      'A16 Bionic chip with 5-core GPU',
      'Color-infused glass and aluminum design',
      'USB-C connector for universal charging'
    ],
    description: 'iPhone 15 brings you Dynamic Island, a 48MP Main camera, and USB-C — all in a durable color-infused glass and aluminum design.',
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop'
    ],
    packageContents: ['iPhone 15', 'USB-C Charge Cable', 'Documentation'],
    specifications: {
      general: { modelNumber: 'MTP03HN/A', countryOfOrigin: 'India', color: 'Black' },
      electrical: { batteryCapacity: '3349 mAh', chargingSpeed: '20W Fast Charging', voltage: '5V' },
      physical: { weight: '171g', dimensions: '147.6 x 71.6 x 7.8 mm', displaySize: '6.1 Inches' },
      warranty: { duration: '1 Year Manufacturer Warranty', coverage: 'Brand warranty for phone and accessories' },
      technical: { processor: 'Apple A16 Bionic', ram: '6 GB', storage: '128 GB', operatingSystem: 'iOS 17', camera: '48MP + 12MP Dual Rear' }
    },
    ratings: { average: 4.7, count: 210 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SAMS24ULTRA-256',
    name: 'Samsung Galaxy S24 Ultra 5G (256GB) - Titanium Gray',
    category: 'Smartphones',
    brand: 'Samsung',
    price: 134999,
    discountPrice: 129999,
    stock: 14,
    sku: 'SAM-S24U-256-GY',
    status: 'Active',
    badges: ['Galaxy AI', '200MP Camera', 'S-Pen Included'],
    features: [
      '6.8-inch QHD+ Dynamic AMOLED 2X Display with 2600 nits Peak Brightness',
      'Snapdragon 8 Gen 3 for Galaxy Processor',
      '200MP Quad Camera with 100x Space Zoom and AI ProVisual Engine',
      'Built-in S Pen for note taking and precise control',
      'Titanium Frame with Corning Gorilla Armor Protection',
      'Galaxy AI features: Circle to Search, Live Translate, Note Assist'
    ],
    description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Galaxy S24 Ultra', 'S-Pen', 'Type-C Data Cable', 'Ejection Pin', 'Quick Start Guide'],
    specifications: {
      general: { modelNumber: 'SM-S928BZGDINS', countryOfOrigin: 'India / Vietnam', color: 'Titanium Gray' },
      electrical: { batteryCapacity: '5000 mAh', chargingSpeed: '45W Super Fast Charging', voltage: '5V' },
      physical: { weight: '232g', dimensions: '162.3 x 79.0 x 8.6 mm', displaySize: '6.8 Inches' },
      warranty: { duration: '1 Year Manufacturer Warranty', coverage: '1 year handset & 6 months in-box accessories warranty' },
      technical: { processor: 'Snapdragon 8 Gen 3', ram: '12 GB', storage: '256 GB', operatingSystem: 'Android 14 (One UI 6.1)', camera: '200MP + 50MP + 12MP + 10MP' }
    },
    ratings: { average: 4.8, count: 98 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SAMGA55-128',
    name: 'Samsung Galaxy A55 5G (128GB) - Awesome Iceblue',
    category: 'Smartphones',
    brand: 'Samsung',
    price: 42999,
    discountPrice: 39999,
    stock: 22,
    sku: 'SAM-A55-128-BLU',
    status: 'Active',
    badges: ['IP67 Water Resistant', 'Knox Vault'],
    features: [
      '6.6-inch FHD+ Super AMOLED Display, 120Hz Refresh Rate',
      'Exynos 1480 Octa-Core Processor with AMD Xclipse GPU',
      '50MP OIS Triple Camera with Nightography',
      'Metal Frame with Corning Gorilla Glass Victus+ Front & Back',
      'IP67 Dust and Water Resistance rating'
    ],
    description: 'Meet Galaxy A55 5G. The simple yet improved A series comes in an iconic design featuring a 3-camera layout in a metal flat frame for an easy and intuitive grip.',
    images: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Galaxy A55 5G', 'Type-C Data Cable', 'SIM Ejector Tool', 'Quick Guide'],
    specifications: {
      general: { modelNumber: 'SM-A556ELBDINS', countryOfOrigin: 'India', color: 'Awesome Iceblue' },
      electrical: { batteryCapacity: '5000 mAh', chargingSpeed: '25W Fast Charging', voltage: '5V' },
      physical: { weight: '213g', dimensions: '161.1 x 77.4 x 8.2 mm', displaySize: '6.6 Inches' },
      warranty: { duration: '1 Year Manufacturer Warranty', coverage: 'Brand warranty for phone' },
      technical: { processor: 'Exynos 1480 Octa-core', ram: '8 GB', storage: '128 GB', operatingSystem: 'Android 14', camera: '50MP + 12MP + 5MP' }
    },
    ratings: { average: 4.5, count: 64 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ONEPLUS12-256',
    name: 'OnePlus 12 5G (256GB) - Silky Black',
    category: 'Smartphones',
    brand: 'OnePlus',
    price: 64999,
    discountPrice: 61999,
    stock: 16,
    sku: 'OP-12-256-BLK',
    status: 'Active',
    badges: ['Hasselblad Camera', '100W SUPERVOOC'],
    features: [
      '6.82-inch 2K 120Hz ProXDR AMOLED Display with Aqua Touch',
      'Snapdragon 8 Gen 3 Mobile Platform',
      '4th Gen Hasselblad Camera System for Mobile (50MP + 64MP Periscope + 48MP)',
      '5400 mAh Battery with 100W SUPERVOOC and 50W AIRVOOC Wireless',
      'Dual Cryo-velocity VC Cooling System'
    ],
    description: 'The OnePlus 12 defines the gold standard for flagship performance, combining raw power with elegant craftsmanship and Hasselblad camera magic.',
    images: [
      'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=800&auto=format&fit=crop'
    ],
    packageContents: ['OnePlus 12', '100W SUPERVOOC Adapter', 'Type-A to Type-C Cable', 'Protective Case', 'SIM Ejector'],
    specifications: {
      general: { modelNumber: 'CPH2573', countryOfOrigin: 'India', color: 'Silky Black' },
      electrical: { batteryCapacity: '5400 mAh', chargingSpeed: '100W Wired, 50W Wireless', voltage: '5V' },
      physical: { weight: '220g', dimensions: '164.3 x 75.8 x 9.15 mm', displaySize: '6.82 Inches' },
      warranty: { duration: '1 Year Manufacturer Warranty', coverage: 'Phone 1 year, In-box accessories 6 months' },
      technical: { processor: 'Snapdragon 8 Gen 3', ram: '12 GB', storage: '256 GB', operatingSystem: 'OxygenOS 14.0 (Android 14)', camera: '50MP + 64MP + 48MP' }
    },
    ratings: { average: 4.7, count: 115 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-OPNORDCE4-128',
    name: 'OnePlus Nord CE4 5G (128GB) - Dark Chrome',
    category: 'Smartphones',
    brand: 'OnePlus',
    price: 24999,
    discountPrice: 22999,
    stock: 30,
    sku: 'OP-NCE4-128-CHRM',
    status: 'Active',
    badges: ['Value King', '100W Charging'],
    features: [
      '6.7-inch 120Hz FHD+ AMOLED Display',
      'Snapdragon 7 Gen 3 Octa-Core Processor',
      '50MP Sony LYT-600 Camera with OIS',
      '5500 mAh Battery with 100W SUPERVOOC Fast Charge',
      'Expandable Storage up to 1TB via microSD'
    ],
    description: 'OnePlus Nord CE4 features mega battery, ultra-fast 100W charging, and smooth Snapdragon power tailored for everyday performance.',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Nord CE4', '100W SUPERVOOC Power Adapter', 'Type-C Cable', 'Phone Case', 'SIM Tray Ejector'],
    specifications: {
      general: { modelNumber: 'CPH2613', countryOfOrigin: 'India', color: 'Dark Chrome' },
      electrical: { batteryCapacity: '5500 mAh', chargingSpeed: '100W SUPERVOOC', voltage: '5V' },
      physical: { weight: '186g', dimensions: '162.5 x 75.3 x 8.4 mm', displaySize: '6.7 Inches' },
      warranty: { duration: '1 Year Manufacturer Warranty', coverage: 'Brand warranty' },
      technical: { processor: 'Snapdragon 7 Gen 3', ram: '8 GB', storage: '128 GB', operatingSystem: 'OxygenOS 14', camera: '50MP + 8MP Dual Camera' }
    },
    ratings: { average: 4.6, count: 175 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-XIAOMI14U-512',
    name: 'Xiaomi 14 Ultra 5G (512GB) - Black',
    category: 'Smartphones',
    brand: 'Xiaomi',
    price: 119999,
    discountPrice: 99999,
    stock: 8,
    sku: 'XMI-14U-512-BLK',
    status: 'Active',
    badges: ['Leica Quad Camera', '1-inch Sensor'],
    features: [
      'Leica Quad Camera System with 1-inch Sony LYT-900 Main Sensor & Stepless Variable Aperture',
      'Snapdragon 8 Gen 3 Flagship Processor',
      '6.73-inch WQHD+ 120Hz LTPO AMOLED Display',
      '5000 mAh Battery with 90W HyperCharge & 80W Wireless HyperCharge',
      'Xiaomi Shield Glass & High-strength Aluminum Frame'
    ],
    description: 'Xiaomi 14 Ultra represents a pinnacle of mobile optical engineering co-developed with Leica, bringing professional photography capabilities to your pocket.',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Xiaomi 14 Ultra', '90W Adapter', 'USB Type-C Cable', 'Protective Case', 'SIM Eject Tool'],
    specifications: {
      general: { modelNumber: '24030PN60G', countryOfOrigin: 'China', color: 'Black' },
      electrical: { batteryCapacity: '5000 mAh', chargingSpeed: '90W HyperCharge, 80W Wireless', voltage: '5V' },
      physical: { weight: '219.8g', dimensions: '161.4 x 75.3 x 9.2 mm', displaySize: '6.73 Inches' },
      warranty: { duration: '1 Year Manufacturer Warranty', coverage: 'Brand warranty' },
      technical: { processor: 'Snapdragon 8 Gen 3', ram: '16 GB', storage: '512 GB', operatingSystem: 'Xiaomi HyperOS (Android 14)', camera: '50MP Quad Leica Camera' }
    },
    ratings: { average: 4.9, count: 42 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-REDMINOTE13P-256',
    name: 'Redmi Note 13 Pro+ 5G (256GB) - Fusion Purple',
    category: 'Smartphones',
    brand: 'Redmi',
    price: 33999,
    discountPrice: 30999,
    stock: 28,
    sku: 'RDM-N13PP-256-PRP',
    status: 'Active',
    badges: ['200MP OIS', '120W HyperCharge', 'Curved AMOLED'],
    features: [
      '200MP Ultra-Clear Camera with OIS and 4x In-sensor Zoom',
      '1.5K 120Hz Curved AMOLED Display with Dolby Vision',
      'MediaTek Dimensity 7200-Ultra 4nm Processor',
      '120W HyperCharge — 100% in 19 minutes',
      'IP68 Water and Dust Resistance'
    ],
    description: 'Redmi Note 13 Pro+ 5G is equipped with a flagship 200MP camera with OIS, 120W HyperCharge, and a stunning 1.5K curved AMOLED display.',
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Redmi Note 13 Pro+', '120W Charger', 'USB Type-C Cable', 'Protective Case', 'SIM Eject Tool'],
    specifications: {
      general: { modelNumber: '23090RA98I', countryOfOrigin: 'India', color: 'Fusion Purple' },
      electrical: { batteryCapacity: '5000 mAh', chargingSpeed: '120W HyperCharge', voltage: '5V' },
      physical: { weight: '204.5g', dimensions: '161.4 x 74.2 x 8.9 mm', displaySize: '6.67 Inches' },
      warranty: { duration: '1 Year Manufacturer Warranty', coverage: 'Brand warranty for phone' },
      technical: { processor: 'Dimensity 7200-Ultra', ram: '8 GB', storage: '256 GB', operatingSystem: 'MIUI 14 (Android 13)', camera: '200MP + 8MP + 2MP Triple Camera' }
    },
    ratings: { average: 4.6, count: 190 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-REALME12PP-256',
    name: 'Realme 12 Pro+ 5G (256GB) - Submarine Blue',
    category: 'Smartphones',
    brand: 'Realme',
    price: 34999,
    discountPrice: 29999,
    stock: 20,
    sku: 'RLM-12PP-256-BLU',
    status: 'Active',
    badges: ['Periscope Portrait Camera', '64MP 3X Telephoto'],
    features: [
      '64MP Periscope Telephoto Lens with 3X Optical Zoom and 120X Digital Zoom',
      '50MP Sony IMX890 Main Camera with OIS',
      'Qualcomm Snapdragon 7s Gen 2 4nm 5G Chipset',
      '120Hz Curved Vision AMOLED Display',
      'Premium Vegan Leather Luxury Watch Design'
    ],
    description: 'Realme 12 Pro+ 5G brings flagship periscope telephoto photography and a luxury watch-inspired design to the mid-premium segment.',
    images: [
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Realme 12 Pro+', '67W SUPERVOOC Charge Adapter', 'USB Type-C Cable', 'Protect Case', 'SIM Card Needle'],
    specifications: {
      general: { modelNumber: 'RMX3840', countryOfOrigin: 'India', color: 'Submarine Blue' },
      electrical: { batteryCapacity: '5000 mAh', chargingSpeed: '67W SUPERVOOC', voltage: '5V' },
      physical: { weight: '196g', dimensions: '161.4 x 74.0 x 8.75 mm', displaySize: '6.7 Inches' },
      warranty: { duration: '1 Year Manufacturer Warranty', coverage: 'Brand warranty' },
      technical: { processor: 'Snapdragon 7s Gen 2', ram: '8 GB', storage: '256 GB', operatingSystem: 'realme UI 5.0 (Android 14)', camera: '64MP + 50MP + 8MP' }
    },
    ratings: { average: 4.5, count: 130 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-PIXEL8PRO-128',
    name: 'Google Pixel 8 Pro (128GB) - Bay Blue',
    category: 'Smartphones',
    brand: 'Google',
    price: 106999,
    discountPrice: 97999,
    stock: 10,
    sku: 'GGL-PX8P-128-BAY',
    status: 'Active',
    badges: ['Google AI', 'Best Take', '7 Years OS Updates'],
    features: [
      'Google Tensor G3 Chip with Titan M2 Security Coprocessor',
      '6.7-inch Super Actua LTPO OLED Display (1-120Hz)',
      'Triple Rear Camera: 50MP Wide + 48MP Ultra Wide + 48MP 5x Telephoto',
      'Best Take, Audio Magic Eraser, and Pro Camera Controls',
      'Built-in Thermometer Sensor on Rear Camera Bar',
      '7 Years of OS, Security, and Feature Drop Updates'
    ],
    description: 'Pixel 8 Pro is the most powerful and personal phone from Google yet, featuring groundbreaking Google AI capabilities and an unparalleled pro camera system.',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Google Pixel 8 Pro', '1m USB-C to USB-C Cable', 'Quick Switch Adapter', 'SIM Tool'],
    specifications: {
      general: { modelNumber: 'GC3VE', countryOfOrigin: 'Vietnam', color: 'Bay Blue' },
      electrical: { batteryCapacity: '5050 mAh', chargingSpeed: '30W Fast Charging, Qi Wireless', voltage: '5V' },
      physical: { weight: '213g', dimensions: '162.6 x 76.5 x 8.8 mm', displaySize: '6.7 Inches' },
      warranty: { duration: '1 Year Manufacturer Warranty', coverage: 'Google official warranty' },
      technical: { processor: 'Google Tensor G3', ram: '12 GB', storage: '128 GB', operatingSystem: 'Android 14', camera: '50MP + 48MP + 48MP' }
    },
    ratings: { average: 4.7, count: 77 },
    deliveryAvailable: true
  },

  // ── 2. LAPTOPS (8) ────────────────────────────────────────────────────────
  {
    productId: 'PRD-MACBOOKAIRM3-512',
    name: 'Apple MacBook Air M3 (15-inch, 8GB RAM, 512GB SSD) - Space Grey',
    category: 'Laptops',
    brand: 'Apple',
    price: 154900,
    discountPrice: 144900,
    stock: 12,
    sku: 'AAPL-MBA-M3-15-512',
    status: 'Active',
    badges: ['Apple M3', 'Thin & Light', 'Up to 18H Battery'],
    features: [
      'Apple M3 Chip with 8-core CPU and 10-core GPU',
      '15.3-inch Liquid Retina Display with 500 nits brightness and True Tone',
      'Silent Fanless Design for completely quiet operation',
      '1080p FaceTime HD Camera with three-mic array',
      'Six-speaker sound system with Spatial Audio',
      'MagSafe 3 Charging Port, Two Thunderbolt / USB 4 Ports'
    ],
    description: 'The 15-inch MacBook Air is impossibly thin and has a stunning Liquid Retina display. Supercharged by the M3 chip, it delivers extraordinary performance and up to 18 hours of battery life.',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop'
    ],
    packageContents: ['15-inch MacBook Air', '35W Dual USB-C Port Compact Power Adapter', 'USB-C to MagSafe 3 Cable (2m)'],
    specifications: {
      general: { modelNumber: 'MRYM3HN/A', countryOfOrigin: 'China', color: 'Space Grey' },
      electrical: { batteryCapacity: '66.5 Wh', chargingSpeed: '35W MagSafe 3 / USB-C', voltage: '20V' },
      physical: { weight: '1.51 kg', dimensions: '34.04 x 23.76 x 1.15 cm', displaySize: '15.3 Inches' },
      warranty: { duration: '1 Year Apple Limited Warranty', coverage: 'Apple hardware warranty' },
      technical: { processor: 'Apple M3 Chip', ram: '8 GB Unified Memory', storage: '512 GB SSD', operatingSystem: 'macOS Sonoma', gpu: '10-core GPU' }
    },
    ratings: { average: 4.9, count: 88 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-MACBOOKPROM3PRO-512',
    name: 'Apple MacBook Pro M3 Pro (16-inch, 18GB RAM, 512GB SSD) - Space Black',
    category: 'Laptops',
    brand: 'Apple',
    price: 249900,
    discountPrice: 234900,
    stock: 6,
    sku: 'AAPL-MBP-M3PRO-16-512',
    status: 'Active',
    badges: ['M3 Pro', 'XDR Display', 'Pro Performance'],
    features: [
      'Apple M3 Pro Chip with 12-core CPU and 18-core GPU',
      '16.2-inch Liquid Retina XDR Display (3024x1964, 1600 nits Peak Brightness)',
      '18GB Unified Memory + 512GB Superfast SSD Storage',
      'Up to 22 Hours Battery Life for heavy pro workflows',
      'SDXC Card Slot, HDMI Port, 3.5mm Headphone Jack, 3x Thunderbolt 4 Ports',
      'Space Black finish with breakthrough anodization seal to reduce fingerprints'
    ],
    description: 'The 16-inch MacBook Pro with M3 Pro takes performance and capability further than ever. With mind-blowing XDR display quality and legendary battery life.',
    images: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop'
    ],
    packageContents: ['16-inch MacBook Pro', '140W USB-C Power Adapter', 'USB-C to MagSafe 3 Cable (2m)'],
    specifications: {
      general: { modelNumber: 'MRW13HN/A', countryOfOrigin: 'China', color: 'Space Black' },
      electrical: { batteryCapacity: '100 Wh', chargingSpeed: '140W Fast Charging', voltage: '20V' },
      physical: { weight: '2.14 kg', dimensions: '35.57 x 24.81 x 1.68 cm', displaySize: '16.2 Inches' },
      warranty: { duration: '1 Year Apple Limited Warranty', coverage: '1 year global Apple warranty' },
      technical: { processor: 'Apple M3 Pro (12-core)', ram: '18 GB Unified Memory', storage: '512 GB SSD', operatingSystem: 'macOS Sonoma', gpu: '18-core GPU' }
    },
    ratings: { average: 4.9, count: 54 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ASUSROG-G16-4060',
    name: 'ASUS ROG Strix G16 Gaming Laptop (Intel i7 13th Gen, 16GB, 1TB SSD, RTX 4060)',
    category: 'Laptops',
    brand: 'ASUS',
    price: 169990,
    discountPrice: 144990,
    stock: 9,
    sku: 'ASUS-G614JV-N4041WS',
    status: 'Active',
    badges: ['RTX 4060', '165Hz FHD+', 'ROG Intelligent Cooling'],
    features: [
      '13th Gen Intel Core i7-13650HX Processor (14 Cores, up to 4.9 GHz)',
      'NVIDIA GeForce RTX 4060 8GB GDDR6 Laptop GPU (140W Max TGP)',
      '16-inch FHD+ 165Hz 100% sRGB Anti-glare Display',
      '16GB DDR5 4800MHz RAM + 1TB PCIe 4.0 NVMe M.2 SSD',
      'Tri-Fan Technology with Full-surround Heatsink & Conductonaut Extreme Liquid Metal',
      '4-Zone RGB Backlit Chiclet Keyboard'
    ],
    description: 'Draw more frames and win more games with the 2023 ROG Strix G16. Powered by 13th Gen Intel Core i7 processor and NVIDIA GeForce RTX 4060 GPU.',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop'
    ],
    packageContents: ['ASUS ROG Strix G16', '280W AC Power Adapter', 'User Manual'],
    specifications: {
      general: { modelNumber: 'G614JV-N4041WS', countryOfOrigin: 'China', color: 'Eclipse Gray' },
      electrical: { batteryCapacity: '90 Wh', chargingSpeed: '280W Adapter', voltage: '20V' },
      physical: { weight: '2.50 kg', dimensions: '35.4 x 26.4 x 2.26 cm', displaySize: '16.0 Inches' },
      warranty: { duration: '1 Year Onsite Manufacturer Warranty', coverage: 'Hardware defects warranty' },
      technical: { processor: 'Intel Core i7-13650HX', ram: '16 GB DDR5', storage: '1 TB PCIe 4.0 SSD', operatingSystem: 'Windows 11 Home', gpu: 'NVIDIA RTX 4060 8GB' }
    },
    ratings: { average: 4.7, count: 62 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-HPPAVILION14-I5',
    name: 'HP Pavilion Plus 14 (Intel Core i5 13th Gen, 16GB, 512GB SSD) - Natural Silver',
    category: 'Laptops',
    brand: 'HP',
    price: 86999,
    discountPrice: 74990,
    stock: 15,
    sku: 'HP-PAV-P14-EW0018TU',
    status: 'Active',
    badges: ['Intel Evo Certified', 'OLED Display'],
    features: [
      '13th Gen Intel Core i5-1340P Processor (12 Cores, up to 4.6 GHz)',
      '14-inch 2.8K (2880x1800) OLED 120Hz 500 nits HDR Display',
      '16GB LPDDR5x RAM + 512GB PCIe NVMe M.2 SSD',
      'Intel Iris Xe Graphics',
      '5MP IR Camera with Temporal Noise Reduction and Dual Array Mics',
      'Full-size Backlit Keyboard & Fingerprint Reader'
    ],
    description: 'The HP Pavilion Plus 14 Laptop is ready to work as hard as you do. Run your system at peak efficiency with an Intel Core processor and 2.8K OLED display.',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop'
    ],
    packageContents: ['HP Pavilion Plus 14', '65W USB Type-C Power Adapter', 'Documentation'],
    specifications: {
      general: { modelNumber: '14-ew0018TU', countryOfOrigin: 'China', color: 'Natural Silver' },
      electrical: { batteryCapacity: '68 Wh', chargingSpeed: '65W USB-C', voltage: '20V' },
      physical: { weight: '1.40 kg', dimensions: '31.4 x 22.7 x 1.75 cm', displaySize: '14.0 Inches' },
      warranty: { duration: '1 Year Onsite Manufacturer Warranty', coverage: 'HP standard warranty' },
      technical: { processor: 'Intel Core i5-1340P', ram: '16 GB LPDDR5x', storage: '512 GB SSD', operatingSystem: 'Windows 11 Home + MS Office 2021', gpu: 'Intel Iris Xe Graphics' }
    },
    ratings: { average: 4.6, count: 94 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-DELLXPS13-I7',
    name: 'Dell XPS 13 Laptop (Intel Core i7 13th Gen, 16GB, 512GB SSD) - Platinum',
    category: 'Laptops',
    brand: 'Dell',
    price: 149990,
    discountPrice: 132990,
    stock: 7,
    sku: 'DELL-XPS9320-I7',
    status: 'Active',
    badges: ['Ultra Premium', 'InfinityEdge Display'],
    features: [
      '13th Gen Intel Core i7-1360P Processor (12 Cores, up to 5.0 GHz)',
      '13.4-inch FHD+ (1920x1200) InfinityEdge 500 nits Anti-glare Display',
      '16GB LPDDR5 Dual Channel RAM + 512GB PCIe NVMe SSD',
      'Zero-lattice Keyboard with Capacitive Touch Function Row',
      'Seamless Glass Haptic Touchpad',
      'CNC Machined Aluminum chassis'
    ],
    description: 'Our thinnest and lightest 13-inch XPS laptop is designed for a lifestyle on the move. Crafted from premium CNC aluminum and glass.',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Dell XPS 13', '60W AC Adapter Type-C', 'USB-C to USB-A Adapter', 'Documentation'],
    specifications: {
      general: { modelNumber: 'XPS 9320', countryOfOrigin: 'China', color: 'Platinum' },
      electrical: { batteryCapacity: '55 Wh', chargingSpeed: '60W Type-C', voltage: '20V' },
      physical: { weight: '1.24 kg', dimensions: '29.5 x 19.9 x 1.52 cm', displaySize: '13.4 Inches' },
      warranty: { duration: '1 Year Premium Support Onsite Warranty', coverage: 'Dell 24/7 technical support included' },
      technical: { processor: 'Intel Core i7-1360P', ram: '16 GB LPDDR5', storage: '512 GB SSD', operatingSystem: 'Windows 11 Home', gpu: 'Intel Iris Xe' }
    },
    ratings: { average: 4.8, count: 40 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-LENOVOLEGIONS5-RTX4060',
    name: 'Lenovo Legion Slim 5 (AMD Ryzen 7 7840HS, 16GB, 1TB SSD, RTX 4060)',
    category: 'Laptops',
    brand: 'Lenovo',
    price: 145990,
    discountPrice: 126990,
    stock: 10,
    sku: 'LNV-LEG-SLIM5-R7',
    status: 'Active',
    badges: ['AMD Ryzen 7', 'Legion Coldfront 5.0'],
    features: [
      'AMD Ryzen 7 7840HS Processor (8 Cores / 16 Threads, up to 5.1 GHz)',
      'NVIDIA GeForce RTX 4060 8GB GDDR6 (140W TGP)',
      '16-inch WQXGA (2560x1600) IPS 165Hz 100% sRGB Display with G-SYNC',
      '16GB DDR5 5600MHz RAM + 1TB SSD PCIe 4.0',
      'Legion Coldfront 5.0 Cooling System with AI Tuning (LA1 AI Chip)',
      'TrueStrike 4-Zone RGB Backlit Gaming Keyboard'
    ],
    description: 'Lenovo Legion Slim 5 is built for gamers who demand agility and power. Slim form factor meets heavy gaming performance.',
    images: [
      'https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Lenovo Legion Slim 5', '230W Power Adapter', 'User Guide'],
    specifications: {
      general: { modelNumber: '16APH8', countryOfOrigin: 'China', color: 'Storm Grey' },
      electrical: { batteryCapacity: '80 Wh', chargingSpeed: '230W Adapter', voltage: '20V' },
      physical: { weight: '2.40 kg', dimensions: '35.9 x 26.0 x 1.99 cm', displaySize: '16.0 Inches' },
      warranty: { duration: '1 Year Legion Ultimate Support', coverage: 'Onsite 24x7 gaming expert support' },
      technical: { processor: 'AMD Ryzen 7 7840HS', ram: '16 GB DDR5', storage: '1 TB SSD', operatingSystem: 'Windows 11 Home', gpu: 'NVIDIA RTX 4060 8GB' }
    },
    ratings: { average: 4.7, count: 71 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ACERSWIFTGO14-ULTRA5',
    name: 'Acer Swift Go 14 OLED (Intel Core Ultra 5, 16GB, 512GB SSD)',
    category: 'Laptops',
    brand: 'Acer',
    price: 89999,
    discountPrice: 79990,
    stock: 14,
    sku: 'ACER-SFG14-72-U5',
    status: 'Active',
    badges: ['AI PC', '2.8K OLED', 'Intel Arc Graphics'],
    features: [
      'Intel Core Ultra 5 125H Processor with Neural Processing Unit (NPU) for AI',
      '14-inch 2.8K (2880x1800) OLED 90Hz 400 nits 100% DCI-P3 Display',
      '16GB LPDDR5X RAM + 512GB PCIe Gen 4 SSD',
      'Intel Arc Graphics for high-efficiency media creation',
      '1440p QHD Webcam with Acer PurifiedVoice AI Noise Reduction',
      'Ultralight 1.32 kg Aluminum Body'
    ],
    description: 'Unlock next-gen AI experiences with Acer Swift Go 14. Featuring a stunning 2.8K OLED screen and new Intel Core Ultra processor with dedicated NPU.',
    images: [
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Acer Swift Go 14', '65W Type-C AC Adapter', 'User Documentation'],
    specifications: {
      general: { modelNumber: 'SFG14-72-52K2', countryOfOrigin: 'China', color: 'Pure Silver' },
      electrical: { batteryCapacity: '65 Wh', chargingSpeed: '65W Type-C Fast Charge', voltage: '20V' },
      physical: { weight: '1.32 kg', dimensions: '31.2 x 21.7 x 1.49 cm', displaySize: '14.0 Inches' },
      warranty: { duration: '1 Year International Travelers Warranty', coverage: 'Acer hardware warranty' },
      technical: { processor: 'Intel Core Ultra 5 125H', ram: '16 GB LPDDR5X', storage: '512 GB SSD', operatingSystem: 'Windows 11 Home', gpu: 'Intel Arc Graphics' }
    },
    ratings: { average: 4.6, count: 48 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-MSITHIN15-I7-3050',
    name: 'MSI Thin 15 Gaming Laptop (Intel Core i7 12th Gen, 16GB, 512GB SSD, RTX 3050)',
    category: 'Laptops',
    brand: 'MSI',
    price: 78990,
    discountPrice: 62990,
    stock: 18,
    sku: 'MSI-THIN15-B12UCX',
    status: 'Active',
    badges: ['Budget Gaming', '144Hz Display'],
    features: [
      '12th Gen Intel Core i7-12650H Processor (10 Cores, up to 4.7 GHz)',
      'NVIDIA GeForce RTX 3050 4GB GDDR6 Laptop GPU',
      '15.6-inch FHD (1920x1080) 144Hz IPS-level Gaming Panel',
      '16GB DDR4 3200MHz RAM + 512GB NVMe PCIe Gen4 SSD',
      'Single Zone Blue Backlit Gaming Keyboard',
      'Thin & Light Hairline Brushed Aluminum Aesthetic'
    ],
    description: 'MSI Thin 15 offers potent portable gaming performance equipped with 12th Gen Intel Core i7 CPU and NVIDIA RTX graphics in a lightweight sub-2kg chassis.',
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop'
    ],
    packageContents: ['MSI Thin 15', '120W Power Adapter', 'Quick Start Guide'],
    specifications: {
      general: { modelNumber: 'Thin 15 B12UCX-650IN', countryOfOrigin: 'China', color: 'Cosmo Gray' },
      electrical: { batteryCapacity: '52.4 Wh', chargingSpeed: '120W Power Adapter', voltage: '19.5V' },
      physical: { weight: '1.86 kg', dimensions: '35.9 x 25.4 x 2.17 cm', displaySize: '15.6 Inches' },
      warranty: { duration: '2 Years Carry-in Warranty', coverage: '2 Year warranty by MSI authorized service centers' },
      technical: { processor: 'Intel Core i7-12650H', ram: '16 GB DDR4', storage: '512 GB SSD', operatingSystem: 'Windows 11 Home', gpu: 'NVIDIA RTX 3050 4GB' }
    },
    ratings: { average: 4.4, count: 102 },
    deliveryAvailable: true
  },

  // ── 3. TABLETS (4) ────────────────────────────────────────────────────────
  {
    productId: 'PRD-IPADAIRM2-128',
    name: 'Apple iPad Air 11-inch M2 (128GB, Wi-Fi) - Space Grey',
    category: 'Tablets',
    brand: 'Apple',
    price: 59900,
    discountPrice: 56900,
    stock: 15,
    sku: 'AAPL-IPADAIR-M2-128',
    status: 'Active',
    badges: ['Apple M2', 'Liquid Retina'],
    features: [
      '11-inch Liquid Retina Display with P3 Wide Color, True Tone, and Anti-reflective Coating',
      'Apple M2 Chip with 8-core CPU and 10-core GPU',
      'Landscape 12MP Ultra Wide Front Camera with Center Stage',
      'Supports Apple Pencil Pro and Magic Keyboard',
      'Wi-Fi 6E + Touch ID integrated into top button'
    ],
    description: 'iPad Air is supercharged by the incredibly fast Apple M2 chip. It features a stunning Liquid Retina display and a landscape front camera.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop'
    ],
    packageContents: ['iPad Air 11-inch', 'USB-C Charge Cable (1m)', '20W USB-C Power Adapter'],
    specifications: {
      general: { modelNumber: 'MUWC3HN/A', countryOfOrigin: 'China', color: 'Space Grey' },
      electrical: { batteryCapacity: '28.93 Wh', chargingSpeed: '20W USB-C', voltage: '5V' },
      physical: { weight: '462g', dimensions: '24.76 x 17.85 x 0.61 cm', displaySize: '11.0 Inches' },
      warranty: { duration: '1 Year Apple Limited Warranty', coverage: 'Apple hardware warranty' },
      technical: { processor: 'Apple M2 Chip', ram: '8 GB', storage: '128 GB', operatingSystem: 'iPadOS 17', camera: '12MP Rear + 12MP Landscape Front' }
    },
    ratings: { average: 4.8, count: 65 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-IPAD10TH-64',
    name: 'Apple iPad 10th Gen 10.9-inch (64GB, Wi-Fi) - Blue',
    category: 'Tablets',
    brand: 'Apple',
    price: 39900,
    discountPrice: 34900,
    stock: 25,
    sku: 'AAPL-IPAD10-64-BLU',
    status: 'Active',
    badges: ['Bestseller Tablet', 'A14 Bionic'],
    features: [
      '10.9-inch Liquid Retina Display with True Tone',
      'A14 Bionic Chip with 6-core CPU and 4-core GPU',
      '12MP Ultra Wide Landscape Front Camera with Center Stage',
      '12MP Wide Back Camera with 4K Video support',
      'USB-C connector for charging and accessories'
    ],
    description: 'Colorfully reimagined and more versatile than ever, iPad features an all-screen 10.9-inch Liquid Retina display and four gorgeous colors.',
    images: [
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop'
    ],
    packageContents: ['iPad 10th Gen', 'USB-C Charge Cable (1m)', '20W USB-C Power Adapter'],
    specifications: {
      general: { modelNumber: 'MPQ83HN/A', countryOfOrigin: 'China', color: 'Blue' },
      electrical: { batteryCapacity: '28.6 Wh', chargingSpeed: '20W USB-C', voltage: '5V' },
      physical: { weight: '477g', dimensions: '24.86 x 17.95 x 0.70 cm', displaySize: '10.9 Inches' },
      warranty: { duration: '1 Year Apple Limited Warranty', coverage: 'Apple hardware warranty' },
      technical: { processor: 'Apple A14 Bionic', ram: '4 GB', storage: '64 GB', operatingSystem: 'iPadOS 17', camera: '12MP Rear + 12MP Front' }
    },
    ratings: { average: 4.7, count: 180 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SAMSUNG-TABS9ULTRA-256',
    name: 'Samsung Galaxy Tab S9 Ultra 5G (256GB) - Graphite',
    category: 'Tablets',
    brand: 'Samsung',
    price: 122999,
    discountPrice: 108999,
    stock: 7,
    sku: 'SAM-TABS9U-256-5G',
    status: 'Active',
    badges: ['14.6-inch Dynamic AMOLED', 'S-Pen Included', 'IP68 Water Resistant'],
    features: [
      'Massive 14.6-inch Dynamic AMOLED 2X 120Hz HDR10+ Display',
      'Snapdragon 8 Gen 2 for Galaxy Flagship Processor',
      'IP68 Water and Dust Resistance rating for tablet and S-Pen',
      'Quad Speakers tuned by AKG with Dolby Atmos',
      '11200 mAh Battery with 45W Super Fast Charging'
    ],
    description: 'Galaxy Tab S9 Ultra sets a new standard for premium Android tablets with an expansive 14.6-inch AMOLED display, IP68 durability, and inbox S-Pen.',
    images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Galaxy Tab S9 Ultra', 'S-Pen', 'Type-C Cable', 'Eject Pin'],
    specifications: {
      general: { modelNumber: 'SM-X916BZAAPOB', countryOfOrigin: 'Vietnam', color: 'Graphite' },
      electrical: { batteryCapacity: '11200 mAh', chargingSpeed: '45W Super Fast Charging', voltage: '5V' },
      physical: { weight: '732g', dimensions: '32.64 x 20.86 x 0.55 cm', displaySize: '14.6 Inches' },
      warranty: { duration: '1 Year Manufacturer Warranty', coverage: '1 year tablet & 6 months accessories' },
      technical: { processor: 'Snapdragon 8 Gen 2', ram: '12 GB', storage: '256 GB', operatingSystem: 'Android 13 (One UI 5.1)', camera: '13MP + 8MP Dual Rear, 12MP + 12MP Dual Front' }
    },
    ratings: { average: 4.8, count: 39 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-XIAOMIPAD6-256',
    name: 'Xiaomi Pad 6 11-inch (256GB, Wi-Fi) - Graphite Grey',
    category: 'Tablets',
    brand: 'Xiaomi',
    price: 31999,
    discountPrice: 24999,
    stock: 24,
    sku: 'XMI-PAD6-256-GRY',
    status: 'Active',
    badges: ['144Hz 2.8K Display', 'Snapdragon 870'],
    features: [
      '11-inch 2.8K (2880x1800) 144Hz 1 billion color Display',
      'Qualcomm Snapdragon 870 Flagship Octa-Core Processor',
      'Quad Speakers with Dolby Atmos audio',
      '8840 mAh Large Battery with 33W Fast Charger',
      'Unibody Metal Enclosure design'
    ],
    description: 'Xiaomi Pad 6 features a smooth 144Hz 2.8K display, powerful Snapdragon 870 performance, and quad speakers built for work and entertainment.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Xiaomi Pad 6', '33W Power Adapter', 'USB Type-C Cable', 'Warranty Card'],
    specifications: {
      general: { modelNumber: 'VHU4372IN', countryOfOrigin: 'China', color: 'Graphite Grey' },
      electrical: { batteryCapacity: '8840 mAh', chargingSpeed: '33W Fast Charge', voltage: '5V' },
      physical: { weight: '490g', dimensions: '25.39 x 16.51 x 0.65 cm', displaySize: '11.0 Inches' },
      warranty: { duration: '1 Year Manufacturer Warranty', coverage: 'Brand warranty' },
      technical: { processor: 'Snapdragon 870', ram: '8 GB', storage: '256 GB', operatingSystem: 'MIUI Pad 14 (Android 13)', camera: '13MP Rear + 8MP Front' }
    },
    ratings: { average: 4.6, count: 210 },
    deliveryAvailable: true
  },

  // ── 4. TELEVISIONS & HOME AUDIO (8) ──────────────────────────────────────
  {
    productId: 'PRD-SONY-55X74L-4K',
    name: 'Sony Bravia 55 inch 4K Ultra HD Smart LED TV (KD-55X74L)',
    category: 'TVs',
    brand: 'Sony',
    price: 99900,
    discountPrice: 57990,
    stock: 9,
    sku: 'SONY-KD55X74L',
    status: 'Active',
    badges: ['Google TV', '4K Processor X1', 'Dolby Audio'],
    features: [
      '4K Ultra HD (3840 x 2160) Resolution with Live Color & Motionflow XR 100',
      '4K Processor X1 delivers lifelike picture depth & texture',
      'Google TV OS with Watchlist, Voice Search, and Chromecast Built-in',
      '20W Open Baffle Speaker with Dolby Audio & Clear Phase technology',
      '3 HDMI ports, 2 USB ports, Dual-band Wi-Fi, Bluetooth 5.0'
    ],
    description: 'Experience thrilling movies and games in 4K HDR detail with Sony Bravia 55X74L. Powered by the X1 4K Processor and Google TV smart features.',
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Sony 55 inch TV', 'Smart Remote Control', 'Table Top Stand', 'Power Cord', 'User Manual'],
    specifications: {
      general: { modelNumber: 'KD-55X74L', countryOfOrigin: 'India', color: 'Black' },
      electrical: { voltage: '220-240V', wattage: '142W' },
      physical: { weight: '12.7 kg', dimensions: '124.3 x 72.9 x 8.4 cm', displaySize: '55 Inches' },
      warranty: { duration: '1 Year Comprehensive Warranty by Sony', coverage: 'Panel and full TV coverage' },
      technical: { processor: '4K Processor X1', operatingSystem: 'Google TV', resolution: '4K Ultra HD (3840x2160)' }
    },
    ratings: { average: 4.8, count: 140 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-LG-43UR7500-4K',
    name: 'LG 43 inch 4K Ultra HD Smart LED TV (43UR7500PSC)',
    category: 'TVs',
    brand: 'LG',
    price: 49990,
    discountPrice: 31990,
    stock: 14,
    sku: 'LG-43UR7500',
    status: 'Active',
    badges: ['webOS 23', 'α5 AI Processor Gen6'],
    features: [
      '4K Ultra HD (3840x2160) Real 4K Display',
      'α5 AI Processor 4K Gen6 for enhanced viewing experience',
      'webOS 23 with User Profiles, Quick Cards, and Magic Remote compatibility',
      '20W 2.0 Ch Speaker with AI Sound (Virtual 5.1 Up-mix)',
      'Game Optimizer, ALLM, and HGIG Mode for gaming'
    ],
    description: 'Enjoy vibrant picture quality and smart streaming on LG 43UR7500 4K Smart TV with webOS 23 and AI Sound enhancement.',
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop'
    ],
    packageContents: ['LG 43 inch TV', 'Remote Control', 'Batteries', 'Stand Assembly', 'User Manual'],
    specifications: {
      general: { modelNumber: '43UR7500PSC', countryOfOrigin: 'India', color: 'Ashed Blue / Black' },
      electrical: { voltage: '100-240V', wattage: '110W' },
      physical: { weight: '8.8 kg', dimensions: '96.7 x 56.4 x 5.7 cm', displaySize: '43 Inches' },
      warranty: { duration: '1 Year LG Warranty', coverage: 'Comprehensive LG brand warranty' },
      technical: { processor: 'α5 AI Processor 4K Gen6', operatingSystem: 'webOS 23', resolution: '3840 x 2160 Pixels' }
    },
    ratings: { average: 4.6, count: 112 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SAMSUNG-65CRYSTAL-4K',
    name: 'Samsung 65 inch Crystal 4K Vivid Pro Ultra HD Smart TV',
    category: 'TVs',
    brand: 'Samsung',
    price: 84900,
    discountPrice: 62990,
    stock: 8,
    sku: 'SAM-65C-VIVID-4K',
    status: 'Active',
    badges: ['Crystal Processor 4K', 'PurColor'],
    features: [
      '65 inch 4K Ultra HD (3840x2160) Resolution with PurColor',
      'Crystal Processor 4K for precise color & contrast upscaling',
      'Tizen OS Smart TV with Knox Security and Samsung TV Plus free channels',
      'Q-Symphony Audio technology syncs TV speakers with soundbar',
      'Motion Xcelerator for clear picture and fast action'
    ],
    description: 'Samsung Crystal 4K Vivid Pro delivers fine-tuned color for a vibrant, lifelike picture. PurColor expresses huge range of colors for optimal picture performance.',
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Samsung 65 TV', 'Smart Remote', 'Power Cable', 'User Manual'],
    specifications: {
      general: { modelNumber: 'UA65DUE77AKXXL', countryOfOrigin: 'India', color: 'Black' },
      electrical: { voltage: '220-240V', wattage: '200W' },
      physical: { weight: '20.6 kg', dimensions: '145.2 x 83.1 x 6.1 cm', displaySize: '65 Inches' },
      warranty: { duration: '1 Year Comprehensive + 1 Year Additional Panel Warranty', coverage: 'Samsung 1+1 year warranty' },
      technical: { processor: 'Crystal Processor 4K', operatingSystem: 'Tizen OS', resolution: '3840 x 2160' }
    },
    ratings: { average: 4.7, count: 95 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-JBL-CINEMASB190-380W',
    name: 'JBL Cinema SB190 2.1 Channel Soundbar with Wireless Subwoofer (380W)',
    category: 'Bluetooth Speakers',
    brand: 'JBL',
    price: 29999,
    discountPrice: 19999,
    stock: 12,
    sku: 'JBL-SB190-380W',
    status: 'Active',
    badges: ['Dolby Atmos', '380W Output', 'Wireless Subwoofer'],
    features: [
      '380W Powerful JBL Sound output for immersive home cinema',
      'Virtual Dolby Atmos for 3D surround sound experience',
      'Wireless 6.5-inch Subwoofer for deep, thumping bass',
      'Dedicated Voice Mode button on remote for enhanced dialogue clarity',
      'HDMI eARC, Optical, and Bluetooth 5.1 wireless streaming'
    ],
    description: 'Bring the movie theater experience home with 380W JBL Cinema SB190. Incredible Dolby Atmos sound paired with an extra deep wireless bass subwoofer.',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Soundbar', 'Wireless Subwoofer', 'Remote Control with Batteries', 'HDMI Cable', 'Wall-mount Bracket Kit', 'Power Cords'],
    specifications: {
      general: { modelNumber: 'JBLSB190BLKJN', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '100-240V', wattage: '380W Max' },
      physical: { weight: '7.5 kg (Total)', dimensions: '90.0 x 6.2 x 6.7 cm (Bar)', displaySize: 'N/A' },
      warranty: { duration: '1 Year JBL Manufacturer Warranty', coverage: 'Soundbar and subwoofer electrical warranty' },
      technical: { bluetoothVersion: '5.1', audioOutput: 'Dolby Atmos, 2.1 Channel' }
    },
    ratings: { average: 4.6, count: 85 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SONY-HTS20R-51CH',
    name: 'Sony HT-S20R 5.1 Channel Home Theatre System (400W)',
    category: 'Bluetooth Speakers',
    brand: 'Sony',
    price: 23990,
    discountPrice: 17990,
    stock: 16,
    sku: 'SONY-HTS20R-400W',
    status: 'Active',
    badges: ['Real 5.1ch Surround', '400W Power'],
    features: [
      '400W Total Power Output brings every movie scene to life',
      'Real 5.1 Channel Surround Sound with rear speakers and subwoofer',
      'Dolby Digital Audio format support',
      'Bluetooth connectivity for easy wireless music playback',
      'HDMI ARC, Optical input, and USB media playback port'
    ],
    description: 'Experience real 5.1 channels of surround sound with Sony HT-S20R. Rear speakers and a external subwoofer work with a 3-channel soundbar to deliver dynamic cinema sound.',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Soundbar', 'Subwoofer', '2x Rear Speakers', 'Remote Control', 'Optical Cable', 'AC Cord'],
    specifications: {
      general: { modelNumber: 'HT-S20R', countryOfOrigin: 'Vietnam', color: 'Black' },
      electrical: { voltage: '220-240V', wattage: '400W' },
      physical: { weight: '13.0 kg', dimensions: '76.0 x 5.2 x 8.6 cm (Bar)', displaySize: 'N/A' },
      warranty: { duration: '1 Year Sony Warranty', coverage: 'Brand warranty' },
      technical: { bluetoothVersion: '5.0', audioOutput: '5.1 Channel Dolby Digital' }
    },
    ratings: { average: 4.7, count: 240 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-BOAT-AAVANTE1500',
    name: 'boAt Aavante Bar 1500 120W 2.1 Channel Soundbar',
    category: 'Bluetooth Speakers',
    brand: 'boAt',
    price: 14990,
    discountPrice: 6999,
    stock: 25,
    sku: 'BOAT-AVT-1500-120W',
    status: 'Active',
    badges: ['Top Seller', '120W RMS', 'Subwoofer'],
    features: [
      '120W RMS boAt Signature Sound with 2.1 Channel setup',
      'Wired External Subwoofer for ground-shaking bass',
      'Multiple EQ Modes: Movies, Music, News, 3D',
      'Bluetooth v5.0, AUX, USB, Optical, and HDMI (ARC) input modes',
      'Sleek Premium Finish with Easy Remote Controls'
    ],
    description: 'Discover 120W RMS of cinematic sound with boAt Aavante Bar 1500. Features deep bass and versatile connectivity for your TV and phone.',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Soundbar', 'Wired Subwoofer', 'Remote Control', 'AUX Cable', 'Wall Mount Screws', 'Manual'],
    specifications: {
      general: { modelNumber: 'Aavante Bar 1500', countryOfOrigin: 'China', color: 'Premium Black' },
      electrical: { voltage: '110-240V', wattage: '120W RMS' },
      physical: { weight: '5.2 kg', dimensions: '80.0 x 6.0 x 6.0 cm', displaySize: 'N/A' },
      warranty: { duration: '1 Year boAt Warranty', coverage: 'Brand warranty' },
      technical: { bluetoothVersion: '5.0', audioOutput: '2.1 Channel' }
    },
    ratings: { average: 4.4, count: 310 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ZEBRONICS-JUKE9500-525W',
    name: 'Zebronics Zeb-Juke Bar 9500 Pro Dolby 5.1 Soundbar (525W)',
    category: 'Bluetooth Speakers',
    brand: 'Zebronics',
    price: 48999,
    discountPrice: 15999,
    stock: 11,
    sku: 'ZEB-JUKE-9500-525W',
    status: 'Active',
    badges: ['Dolby Audio', 'Dual Wireless Rear Speakers', '525W Peak'],
    features: [
      '525W Output Power with Dolby Audio decoding',
      'Dual Wireless Rear Satellite Speakers for effortless 5.1 surround sound',
      '16.5cm (6.5 inch) Subwoofer driver',
      'HDMI (ARC), Optical Input, AUX, USB, and Bluetooth 5.0',
      'LED Display and Remote Control'
    ],
    description: 'Transform your living room into a movie theater with Zebronics Zeb-Juke Bar 9500 Pro 5.1 featuring wireless satellite speakers and 525W monster output.',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Soundbar', 'Subwoofer', '2x Wireless Satellite Speakers', 'Remote Control', 'HDMI Cable', 'Wall Mounts'],
    specifications: {
      general: { modelNumber: 'Zeb-Juke Bar 9500 Pro', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '230V', wattage: '525W' },
      physical: { weight: '8.2 kg', dimensions: '90.0 x 7.0 x 7.0 cm', displaySize: 'N/A' },
      warranty: { duration: '1 Year Zebronics Warranty', coverage: '1 year brand warranty' },
      technical: { bluetoothVersion: '5.0', audioOutput: 'Dolby 5.1 Channel' }
    },
    ratings: { average: 4.5, count: 145 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-XIAOMI-55XSERIES-4K',
    name: 'Xiaomi 55 inch X Series 4K Ultra HD Smart Google TV',
    category: 'TVs',
    brand: 'Xiaomi',
    price: 54999,
    discountPrice: 37999,
    stock: 18,
    sku: 'XMI-55X-4K-GTV',
    status: 'Active',
    badges: ['4K Dolby Vision', 'Google TV', '30W Dolby Audio'],
    features: [
      '4K Ultra HD (3840x2160) 60Hz Screen with Dolby Vision & HDR10',
      '30W Speakers with Dolby Audio and DTS-Virtual:X technology',
      'Google TV OS with PatchWall 4 interface and Free Live Channels',
      'Quad-core A55 CPU with 2GB RAM and 8GB Storage',
      'Metal Bezel-less Premium Frame design'
    ],
    description: 'Xiaomi TV X Series 55 inch brings incredible clarity and immersive Dolby Vision visuals powered by Google TV and 30W stereo audio.',
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Xiaomi 55 inch TV', 'Bluetooth Remote Control', 'Stand Base', 'Power Cord', 'Manual'],
    specifications: {
      general: { modelNumber: 'L55M8-A2IN', countryOfOrigin: 'India', color: 'Black' },
      electrical: { voltage: '100-240V', wattage: '130W' },
      physical: { weight: '11.2 kg', dimensions: '122.6 x 71.5 x 8.1 cm', displaySize: '55 Inches' },
      warranty: { duration: '1 Year Comprehensive Warranty', coverage: 'Brand warranty on TV and panel' },
      technical: { processor: 'Quad Core A55', operatingSystem: 'Google TV', resolution: '3840 x 2160' }
    },
    ratings: { average: 4.6, count: 165 },
    deliveryAvailable: true
  },

  // ── 5. HEADPHONES & EARBUDS (10) ──────────────────────────────────────────
  {
    productId: 'PRD-AIRPODSPRO2-USBC',
    name: 'Apple AirPods Pro (2nd Gen) with MagSafe Case (USB-C)',
    category: 'Earbuds',
    brand: 'Apple',
    price: 24900,
    discountPrice: 22900,
    stock: 20,
    sku: 'AAPL-APP2-USBC',
    status: 'Active',
    badges: ['H2 Chip', 'Active Noise Cancellation', 'MagSafe USB-C'],
    features: [
      'Apple H2 Headphone Chip for up to 2x more Active Noise Cancellation',
      'Adaptive Audio automatically tailors noise control in dynamic environments',
      'Transparency mode lets outside sound back in comfortably',
      'Personalized Spatial Audio with dynamic head tracking',
      'IP54 dust, sweat, and water resistant earbuds and MagSafe Charging Case (USB-C)',
      'Up to 6 hours listening time with ANC on (up to 30 hours with case)'
    ],
    description: 'AirPods Pro (2nd generation) with USB-C deliver up to 2x more Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio.',
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop'
    ],
    packageContents: ['AirPods Pro', 'MagSafe Charging Case (USB-C)', 'Silicone Ear Tips (XS, S, M, L)', 'USB-C Charge Cable'],
    specifications: {
      general: { modelNumber: 'MTJV3HN/A', countryOfOrigin: 'China', color: 'White' },
      electrical: { batteryCapacity: 'Up to 30h with Case', chargingSpeed: 'MagSafe, Apple Watch Charger, USB-C', voltage: '5V' },
      physical: { weight: '5.3g per earbud, 50.8g case', dimensions: '30.9 x 21.8 x 24.0 mm', displaySize: 'N/A' },
      warranty: { duration: '1 Year Apple Limited Warranty', coverage: 'Apple hardware warranty' },
      technical: { bluetoothVersion: '5.3', processor: 'Apple H2' }
    },
    ratings: { average: 4.9, count: 280 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SONY-WH1000XM5-BLK',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Black',
    category: 'Headphones',
    brand: 'Sony',
    price: 34990,
    discountPrice: 28990,
    stock: 14,
    sku: 'SONY-WHXM5-BLK',
    status: 'Active',
    badges: ['Industry Leading ANC', '30H Battery', 'LDAC Audio'],
    features: [
      'Industry-leading noise canceling with 8 microphones & Auto NC Optimizer',
      'Magnificent sound engineered with new 30mm precision driver unit',
      'Crystal-clear hands-free calling with 4 beamforming microphones & AI noise reduction',
      'Up to 30 hours battery life with quick charging (3 min charge = 3 hours playback)',
      'Ultra-comfortable lightweight design with soft fit leather',
      'Multipoint connection allows switching between two Bluetooth devices'
    ],
    description: 'The WH-1000XM5 headphones rewrite the rules for distraction-free listening and call clarity with two processors controlling 8 microphones for unmatched ANC.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop'
    ],
    packageContents: ['WH-1000XM5 Headphones', 'Carrying Case', 'Headphone Cable (1.2m)', 'USB Charging Cable'],
    specifications: {
      general: { modelNumber: 'WH-1000XM5', countryOfOrigin: 'Malaysia', color: 'Black' },
      electrical: { batteryCapacity: '30h Playtime', chargingSpeed: 'USB-C Fast Charging', voltage: '5V' },
      physical: { weight: '250g', dimensions: '22.5 x 17.5 x 6.5 cm', displaySize: 'N/A' },
      warranty: { duration: '1 Year Sony India Warranty', coverage: 'Brand warranty' },
      technical: { bluetoothVersion: '5.2', codec: 'LDAC, AAC, SBC' }
    },
    ratings: { average: 4.8, count: 195 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SONY-WF1000XM5-BLK',
    name: 'Sony WF-1000XM5 TWS Noise Cancelling Earbuds - Black',
    category: 'Earbuds',
    brand: 'Sony',
    price: 24990,
    discountPrice: 21990,
    stock: 16,
    sku: 'SONY-WFXM5-BLK',
    status: 'Active',
    badges: ['Hi-Res Audio Wireless', 'Dynamic Driver X'],
    features: [
      'The Best Noise Canceling TWS with HD Noise Canceling Processor QN2e and Integrated Processor V2',
      'Astonishing sound quality with Dynamic Driver X',
      'AI-based noise reduction algorithm & bone conduction sensors for ultra-clear calls',
      'Small, light, and beautifully designed ergonomic earbuds',
      'Up to 8 hours battery (24 hours total with case) & IPX4 splash resistance'
    ],
    description: 'WF-1000XM5 features cutting-edge technology to deliver premium sound quality and the best noise-cancelling performance on the market.',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop'
    ],
    packageContents: ['WF-1000XM5 Earbuds', 'Noise Isolation Earbud Tips (S, M, L, SS)', 'Charging Case', 'USB-C Cable'],
    specifications: {
      general: { modelNumber: 'WF-1000XM5', countryOfOrigin: 'Malaysia', color: 'Black' },
      electrical: { batteryCapacity: '24h Total Playtime', chargingSpeed: 'Wireless Qi & USB-C', voltage: '5V' },
      physical: { weight: '5.9g per earbud', dimensions: '6.4 x 4.0 x 2.6 cm (Case)', displaySize: 'N/A' },
      warranty: { duration: '1 Year Sony Warranty', coverage: 'Brand warranty' },
      technical: { bluetoothVersion: '5.3', codec: 'LDAC, LC3, AAC, SBC' }
    },
    ratings: { average: 4.7, count: 110 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ONEPLUSBUDSPRO2-BLK',
    name: 'OnePlus Buds Pro 2 TWS Earbuds - Obsidian Black',
    category: 'Earbuds',
    brand: 'OnePlus',
    price: 13999,
    discountPrice: 9999,
    stock: 22,
    sku: 'OP-BP2-BLK',
    status: 'Active',
    badges: ['Dynaudio Co-created', '48dB ANC'],
    features: [
      'MelodyBoost Dual Drivers (11mm woofer + 6mm tweeter) co-created with Dynaudio',
      'Smart Adaptive Noise Cancellation up to 48dB',
      'Spatial Audio developed with Google & Dolby Atmos support',
      'Up to 39 hours of battery life with case (LHDC 5.0 High-Def Audio)',
      'Dual Connection & 54ms Ultra-Low Latency Mode'
    ],
    description: 'OnePlus Buds Pro 2 unlocks audiophile-grade sound quality tuned by Dynaudio paired with deep 48dB adaptive active noise cancellation.',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop'
    ],
    packageContents: ['OnePlus Buds Pro 2', 'Charging Case', 'Silicone Ear Tips (S, M, L)', 'USB-C Cable'],
    specifications: {
      general: { modelNumber: 'E507A', countryOfOrigin: 'China', color: 'Obsidian Black' },
      electrical: { batteryCapacity: '39h Total Battery', chargingSpeed: 'Qi Wireless & Warp Charge', voltage: '5V' },
      physical: { weight: '4.9g per earbud', dimensions: '6.1 x 5.0 x 2.4 cm', displaySize: 'N/A' },
      warranty: { duration: '1 Year OnePlus Warranty', coverage: 'Brand warranty' },
      technical: { bluetoothVersion: '5.3', codec: 'LHDC, AAC, SBC' }
    },
    ratings: { average: 4.6, count: 140 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-JBLTUNE770NC-BLK',
    name: 'JBL Tune 770NC Wireless Over-Ear NC Headphones',
    category: 'Headphones',
    brand: 'JBL',
    price: 9999,
    discountPrice: 6499,
    stock: 25,
    sku: 'JBL-TUNE770NC-BLK',
    status: 'Active',
    badges: ['70H Battery', 'JBL Pure Bass'],
    features: [
      'Adaptive Noise Cancelling with Smart Ambient',
      'JBL Pure Bass Sound for powerful low-end impact',
      'Up to 70 hours battery life (44h with ANC ON)',
      'Speed Charge: 5 minutes charge gives 3 hours playback',
      'Bluetooth 5.3 with Multi-Point Connection',
      'Lightweight, comfortable, and foldable design'
    ],
    description: 'The JBL Tune 770NC wireless headphones feature famous JBL Pure Bass sound and 70-hour battery life with Adaptive Noise Cancelling.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop'
    ],
    packageContents: ['JBL Tune 770NC', 'USB-C Charging Cable', 'Detachable Audio Cable', 'Warning / QSG'],
    specifications: {
      general: { modelNumber: 'JBLT770NCBLK', countryOfOrigin: 'China', color: 'Black' },
      electrical: { batteryCapacity: '70h Playtime', chargingSpeed: 'USB-C Speed Charge', voltage: '5V' },
      physical: { weight: '232g', dimensions: '22.0 x 20.0 x 5.0 cm', displaySize: 'N/A' },
      warranty: { duration: '1 Year JBL Warranty', coverage: 'Brand warranty' },
      technical: { bluetoothVersion: '5.3', driverSize: '40mm' }
    },
    ratings: { average: 4.5, count: 160 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-BOATNIRVANAION-BLK',
    name: 'boAt Nirvana Ion TWS Earbuds with 120H Playtime - Charcoal Black',
    category: 'Earbuds',
    brand: 'boAt',
    price: 7990,
    discountPrice: 2299,
    stock: 45,
    sku: 'BOAT-NIRVANA-ION-BLK',
    status: 'Active',
    badges: ['120H Massive Battery', 'Dual EQ Modes', 'Quad Mics'],
    features: [
      'Mind-blowing 120 Hours Total Playtime (24 Hours per earbud charge)',
      'Crystal Unclear Quad Mics with ENx Technology for noise-free calls',
      'Dual EQ Modes: HiFi Mode & Balanced Mode',
      '60ms Low Latency BEAST Mode for Mobile Gaming',
      'IPX4 Sweat and Splash Resistance'
    ],
    description: 'Step into infinity with boAt Nirvana Ion TWS. Experience a colossal 120-hour playback capacity and crystal clear quad mic calling quality.',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Nirvana Ion TWS', 'Charging Case', 'Extra Ear Tips', 'Type-C Charging Cable', 'User Manual'],
    specifications: {
      general: { modelNumber: 'Nirvana Ion', countryOfOrigin: 'China', color: 'Charcoal Black' },
      electrical: { batteryCapacity: '120h Playtime', chargingSpeed: 'ASAP Charge (10 min = 120 min)', voltage: '5V' },
      physical: { weight: '4.5g per earbud', dimensions: '6.0 x 4.5 x 2.8 cm', displaySize: 'N/A' },
      warranty: { duration: '1 Year boAt Warranty', coverage: 'Brand warranty' },
      technical: { bluetoothVersion: '5.2', driverSize: '10mm' }
    },
    ratings: { average: 4.4, count: 520 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SENNHEISER-HD450BT',
    name: 'Sennheiser HD 450BT Wireless Noise Cancelling Headphones',
    category: 'Headphones',
    brand: 'Sennheiser',
    price: 14990,
    discountPrice: 9990,
    stock: 11,
    sku: 'SENN-HD450BT-BLK',
    status: 'Active',
    badges: ['Audiophile Sound', 'AAC/aptX Low Latency'],
    features: [
      'Active Noise Cancellation for uninterrupted listening pleasure',
      'Superior wireless sound with deep dynamic bass and high-quality codec support (AAC, aptX Low Latency)',
      '30-hour battery life with USB-C fast charging',
      'Intuitive controls including dedicated Voice Assistant button for Alexa & Siri',
      'Crafted from high-quality materials for ergonomic durability & compact folding'
    ],
    description: 'Step up to great wireless sound with the new HD 450BT from Sennheiser. Delivering active noise cancellation and high-quality wireless audio.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop'
    ],
    packageContents: ['HD 450BT Headphones', 'Audio Cable', 'USB-C Charging Cable', 'Carry Case', 'Safety Guide'],
    specifications: {
      general: { modelNumber: 'HD 450BT', countryOfOrigin: 'China', color: 'Black' },
      electrical: { batteryCapacity: '30h Playtime', chargingSpeed: 'USB-C Charging', voltage: '5V' },
      physical: { weight: '238g', dimensions: '19.5 x 15.5 x 6.0 cm', displaySize: 'N/A' },
      warranty: { duration: '2 Years Sennheiser International Warranty', coverage: '2 year manufacturer warranty' },
      technical: { bluetoothVersion: '5.0', codec: 'aptX, aptX Low Latency, AAC, SBC' }
    },
    ratings: { average: 4.6, count: 78 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-REALMEBUDSAIR5PRO',
    name: 'Realme Buds Air 5 Pro ANC TWS Earbuds - Sunrise Beige',
    category: 'Earbuds',
    brand: 'Realme',
    price: 7999,
    discountPrice: 4999,
    stock: 28,
    sku: 'RLM-BA5P-BGE',
    status: 'Active',
    badges: ['50dB ANC', 'Hi-Res LDAC', 'Dual Coaxial Drivers'],
    features: [
      'Real 50dB Active Noise Cancellation with 4000Hz Ultra-Wideband Noise Reduction',
      'RealBoost Dual Drivers (11mm bass driver + 6mm micro-planar tweeter)',
      'Hi-Res Audio Certified with LDAC codec support',
      '360 Spatial Audio Effect',
      'Up to 40 Hours Total Playback (40ms Super Low Latency)'
    ],
    description: 'Realme Buds Air 5 Pro features flagship-level 50dB active noise cancellation, dual coaxial acoustic drivers, and Hi-Res LDAC playback.',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Realme Buds Air 5 Pro', 'Charging Case', '3 Pairs Ear Tips', 'Type-C Cable', 'User Manual'],
    specifications: {
      general: { modelNumber: 'RMA2120', countryOfOrigin: 'China', color: 'Sunrise Beige' },
      electrical: { batteryCapacity: '40h Total Playtime', chargingSpeed: 'Dart Charge (10 min = 7h)', voltage: '5V' },
      physical: { weight: '5.0g per earbud', dimensions: '6.0 x 5.1 x 2.4 cm', displaySize: 'N/A' },
      warranty: { duration: '1 Year Realme Warranty', coverage: 'Brand warranty' },
      technical: { bluetoothVersion: '5.3', codec: 'LDAC, AAC, SBC' }
    },
    ratings: { average: 4.6, count: 135 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ANKER-LIBERTY4NC',
    name: 'Anker Soundcore Liberty 4 NC Noise Cancelling Earbuds',
    category: 'Earbuds',
    brand: 'Anker',
    price: 12999,
    discountPrice: 7999,
    stock: 17,
    sku: 'ANK-L4NC-BLK',
    status: 'Active',
    badges: ['98.5% Noise Reduction', 'LDAC Hi-Res'],
    features: [
      'Adaptive ANC 2.0 reduces noise by up to 98.5%',
      '11mm custom tuned drivers with Hi-Res Wireless & LDAC technology',
      'Fully Adjustable EQ with HearID 2.0 sound profile',
      '10 Hours Playtime on a single charge (50 Hours with Charging Case)',
      '6 Microphones with AI Noise Reduction algorithm for clear calls'
    ],
    description: 'Anker Soundcore Liberty 4 NC delivers next-level noise cancellation capability engineered to isolate up to 98.5% of external ambiance.',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Soundcore Liberty 4 NC', 'Charging Case', 'Ear Tips (XS/S/M/L)', 'USB-C Cable'],
    specifications: {
      general: { modelNumber: 'A3947', countryOfOrigin: 'China', color: 'Black' },
      electrical: { batteryCapacity: '50h Playtime', chargingSpeed: 'Wireless & USB-C Fast Charge', voltage: '5V' },
      physical: { weight: '4.9g per earbud', dimensions: '6.2 x 4.8 x 2.7 cm', displaySize: 'N/A' },
      warranty: { duration: '18 Months Anker Warranty', coverage: 'Official Anker 18-month hassle-free warranty' },
      technical: { bluetoothVersion: '5.3', codec: 'LDAC, AAC, SBC' }
    },
    ratings: { average: 4.7, count: 90 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-NOTHINGEARA-YEL',
    name: 'Nothing Ear (a) TWS Earbuds - Yellow',
    category: 'Earbuds',
    brand: 'Nothing',
    price: 9999,
    discountPrice: 7999,
    stock: 19,
    sku: 'NTH-EARA-YEL',
    status: 'Active',
    badges: ['ChatGPT Integrated', '45dB ANC', 'Iconic Transparent Design'],
    features: [
      '45dB Smart Active Noise Cancellation with Adaptive ANC algorithm',
      '11mm PMI + TPU Dynamic Driver with Bass Enhance Algorithm',
      'Iconic Transparent Yellow Design with Compact Bubble Case',
      'Integrated ChatGPT voice control with Nothing smartphones',
      'Up to 42.5 hours of total listening time'
    ],
    description: 'Nothing Ear (a) is built for every part of every day. Bold transparent design meets powerful 45dB noise cancellation and ChatGPT integration.',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Nothing Ear (a)', 'Ear Tips (S, M, L)', 'Charging Case', 'Type-C Cable', 'Safety Info'],
    specifications: {
      general: { modelNumber: 'B162', countryOfOrigin: 'China', color: 'Yellow' },
      electrical: { batteryCapacity: '42.5h Total Battery', chargingSpeed: 'Fast Charging (10 min = 10h)', voltage: '5V' },
      physical: { weight: '4.8g per earbud', dimensions: '6.3 x 4.7 x 2.2 cm', displaySize: 'N/A' },
      warranty: { duration: '1 Year Nothing Warranty', coverage: 'Brand warranty' },
      technical: { bluetoothVersion: '5.3', codec: 'LDAC, AAC, SBC' }
    },
    ratings: { average: 4.6, count: 108 },
    deliveryAvailable: true
  },

  // ── 6. SMARTWATCHES & WEARABLES (6) ──────────────────────────────────────
  {
    productId: 'PRD-APPLEWATCHS9-45',
    name: 'Apple Watch Series 9 GPS 45mm - Midnight Aluminum',
    category: 'Smartwatches',
    brand: 'Apple',
    price: 44900,
    discountPrice: 41900,
    stock: 14,
    sku: 'AAPL-AWS9-45-MID',
    status: 'Active',
    badges: ['S9 SiP', 'Double Tap Gesture', '2000 nits Display'],
    features: [
      'S9 SiP Chip enables Double Tap gesture control without touching the screen',
      'Always-On Retina display up to 2000 nits (2x brighter than Series 8)',
      'Advanced Health Sensors: ECG, Blood Oxygen, Temperature sensing, Cycle Tracking',
      'Crash Detection and Fall Detection emergency safety features',
      'Carbon Neutral combinations available'
    ],
    description: 'Apple Watch Series 9 helps you stay connected, active, healthy, and safe. Featuring Double Tap, a magic way to interact with Apple Watch.',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Apple Watch Series 9 Case', 'Sport Band', 'Apple Watch Magnetic Fast Charger to USB-C Cable (1m)'],
    specifications: {
      general: { modelNumber: 'MR993HN/A', countryOfOrigin: 'China', color: 'Midnight' },
      electrical: { batteryCapacity: '18 hours normal use, 36h Low Power Mode', chargingSpeed: 'Fast Magnetic Charging', voltage: '5V' },
      physical: { weight: '38.7g', dimensions: '45 x 38 x 10.7 mm', displaySize: '45mm Case' },
      warranty: { duration: '1 Year Apple Limited Warranty', coverage: 'Apple hardware warranty' },
      technical: { processor: 'S9 SiP', operatingSystem: 'watchOS 10', sensors: 'ECG, SpO2, Temperature, Heart Rate' }
    },
    ratings: { average: 4.8, count: 92 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SAMGALAXYWATCH6-LTE',
    name: 'Samsung Galaxy Watch6 LTE 44mm - Graphite',
    category: 'Smartwatches',
    brand: 'Samsung',
    price: 36999,
    discountPrice: 28999,
    stock: 16,
    sku: 'SAM-GW6-LTE-44',
    status: 'Active',
    badges: ['Standalone LTE', 'BioActive Sensor', 'Sapphire Crystal'],
    features: [
      '20% Larger Display with thinner bezel and Sapphire Crystal glass',
      'Standalone 4G LTE Connectivity (make calls & text without phone)',
      'Advanced Sleep Coaching, BIA Body Composition analysis, HR Zone training',
      'Samsung BioActive Sensor (Optical Heart Rate + Electrical Heart Signal + BIA)',
      '5ATM + IP68 Water and Dust Resistance'
    ],
    description: 'Galaxy Watch6 LTE delivers personalized health guidance, advanced sleep tracking, and standalone cellular independence right from your wrist.',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Galaxy Watch6', 'Extreme Sport Band', 'Fast Wireless Charger', 'Quick Start Guide'],
    specifications: {
      general: { modelNumber: 'SM-R945FZSAINU', countryOfOrigin: 'Vietnam', color: 'Graphite' },
      electrical: { batteryCapacity: '425 mAh', chargingSpeed: 'Fast Wireless Charging', voltage: '5V' },
      physical: { weight: '33.3g', dimensions: '44.4 x 42.8 x 9.0 mm', displaySize: '1.5 Inches AMOLED' },
      warranty: { duration: '1 Year Manufacturer Warranty', coverage: 'Samsung brand warranty' },
      technical: { processor: 'Exynos W930 Dual Core', operatingSystem: 'Wear OS Powered by Samsung (One UI Watch 5)' }
    },
    ratings: { average: 4.6, count: 80 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ONEPLUSWATCH2-GRN',
    name: 'OnePlus Watch 2 (46mm Stainless Steel) - Radiant Green',
    category: 'Smartwatches',
    brand: 'OnePlus',
    price: 27999,
    discountPrice: 21999,
    stock: 12,
    sku: 'OP-WATCH2-GRN',
    status: 'Active',
    badges: ['100 Hours Battery', 'Dual Engine Architecture', 'Wear OS 4'],
    features: [
      'Dual-Engine Architecture: Snapdragon W5 + BES2700 Chipsets',
      'Up to 100 Hours battery life in Smart Mode (12 days in Power Saver Mode)',
      'Wear OS 4 by Google with Google Maps, Assistant, and Wallet support',
      'High-precision Dual Frequency L1+L5 GPS tracking',
      'Stainless Steel Chassis with 2.5D Sapphire Crystal Cover'
    ],
    description: 'OnePlus Watch 2 features industry-defining 100-hour battery life powered by an innovative Dual-Engine Architecture running Wear OS 4.',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'
    ],
    packageContents: ['OnePlus Watch 2', 'Charging Base', 'Strap', 'USB-C Cable', 'User Guide'],
    specifications: {
      general: { modelNumber: 'OPW221', countryOfOrigin: 'China', color: 'Radiant Green' },
      electrical: { batteryCapacity: '500 mAh', chargingSpeed: '7.5W VOOC Fast Charge (100% in 60 min)', voltage: '5V' },
      physical: { weight: '49g (without strap)', dimensions: '47.0 x 46.6 x 12.1 mm', displaySize: '1.43 Inches AMOLED' },
      warranty: { duration: '1 Year OnePlus Warranty', coverage: 'Brand warranty' },
      technical: { processor: 'Snapdragon W5 Gen 1 + BES2700', operatingSystem: 'Wear OS 4 + RTOS' }
    },
    ratings: { average: 4.7, count: 68 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-AMAZFITGTR4-BLK',
    name: 'Amazfit GTR 4 Smart Watch with Dual-Band GPS - Superspeed Black',
    category: 'Smartwatches',
    brand: 'Amazfit',
    price: 23999,
    discountPrice: 16999,
    stock: 20,
    sku: 'AMZ-GTR4-BLK',
    status: 'Active',
    badges: ['14 Day Battery', 'Dual-Band Circularly-Polarized GPS'],
    features: [
      'Dual-Band Circularly-Polarized GPS antenna for 99% position accuracy',
      'Ultra-long 14-day Battery Life under typical usage',
      '1.43-inch HD AMOLED Display with 200+ watch faces & Always-on Display',
      'BioTracker 4.0 PPG Biometric sensor for 24H Heart Rate, SpO2 & Stress',
      'Bluetooth Phone Calls & Local Music Storage'
    ],
    description: 'Amazfit GTR 4 is a premium fitness smartwatch packed with dual-band GPS, 150+ sports modes, 14-day battery life, and Bluetooth calls.',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Amazfit GTR 4', 'Magnetic Charging Cable', 'Instruction Manual'],
    specifications: {
      general: { modelNumber: 'A2175', countryOfOrigin: 'China', color: 'Superspeed Black' },
      electrical: { batteryCapacity: '475 mAh', chargingSpeed: 'Magnetic 2h Full Charge', voltage: '5V' },
      physical: { weight: '34g', dimensions: '46 x 46 x 10.6 mm', displaySize: '1.43 Inches HD AMOLED' },
      warranty: { duration: '1 Year Amazfit Warranty', coverage: 'Brand warranty' },
      technical: { operatingSystem: 'Zepp OS 2.0', sensors: 'BioTracker 4.0, Dual-band GPS, Altitude' }
    },
    ratings: { average: 4.5, count: 112 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-BOATWAVECALL2-BLK',
    name: 'boAt Wave Call 2 Smartwatch with Bluetooth Calling - Active Black',
    category: 'Smartwatches',
    brand: 'boAt',
    price: 6990,
    discountPrice: 1499,
    stock: 50,
    sku: 'BOAT-WAVECALL2-BLK',
    status: 'Active',
    badges: ['BT Calling', '1.83 HD Display', '700+ Active Modes'],
    features: [
      '1.83-inch HD Display with 550 nits brightness',
      'Advanced Bluetooth Calling with dial pad & save up to 10 contacts',
      '700+ Active Modes for sports, workouts & daily tracking',
      'Crest App Health Ecosystem with HR, SpO2 & Sleep monitoring',
      'Custom Watch Face Studio via boAt Crest App'
    ],
    description: 'Stay connected effortlessly with boAt Wave Call 2 featuring a big 1.83-inch HD screen, seamless BT calling, and 700+ active sports modes.',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Wave Call 2', 'USB Magnetic Charging Cable', 'User Manual', 'Warranty Card'],
    specifications: {
      general: { modelNumber: 'Wave Call 2', countryOfOrigin: 'China', color: 'Active Black' },
      electrical: { batteryCapacity: '230 mAh', chargingSpeed: 'Magnetic Charger 2h', voltage: '5V' },
      physical: { weight: '45g', dimensions: '45 x 38 x 11 mm', displaySize: '1.83 Inches HD' },
      warranty: { duration: '1 Year boAt Warranty', coverage: 'Brand warranty' },
      technical: { operatingSystem: 'boAt Crest OS', sensors: 'Heart Rate, SpO2, Pedometer' }
    },
    ratings: { average: 4.3, count: 640 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-NOISECOLORFITPRO5-BLK',
    name: 'Noise ColorFit Pro 5 Smart Watch with 1.85 inch AMOLED Display',
    category: 'Smartwatches',
    brand: 'Noise',
    price: 8999,
    discountPrice: 3999,
    stock: 35,
    sku: 'NOISE-CFP5-BLK',
    status: 'Active',
    badges: ['1.85 AMOLED', 'SOS Feature', 'Dynamic Watch Faces'],
    features: [
      '1.85-inch AMOLED Display with 600 nits brightness and 60Hz refresh rate',
      'Functional Crown for seamless UI navigation',
      'BT Calling with Tru Sync technology for fast pairing & low power consumption',
      'Rapid Health Monitoring: Heart Rate, SpO2, Stress, Female Cycle Tracker',
      'Emergency SOS Feature & Emoji Support'
    ],
    description: 'Elevate your wristwear with Noise ColorFit Pro 5 featuring a vivid 1.85-inch AMOLED screen, functional crown, and Tru Sync Bluetooth calling.',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop'
    ],
    packageContents: ['ColorFit Pro 5', 'Magnetic Charging Cable', 'User Manual'],
    specifications: {
      general: { modelNumber: 'ColorFit Pro 5', countryOfOrigin: 'India', color: 'Jet Black' },
      electrical: { batteryCapacity: '300 mAh', chargingSpeed: 'Magnetic Charger (up to 7 days battery)', voltage: '5V' },
      physical: { weight: '42g', dimensions: '46.5 x 38.6 x 11.7 mm', displaySize: '1.85 Inches AMOLED' },
      warranty: { duration: '1 Year Noise Warranty', coverage: 'Brand warranty' },
      technical: { operatingSystem: 'Noise OS', sensors: 'Heart Rate, SpO2, Accelerometer' }
    },
    ratings: { average: 4.5, count: 215 },
    deliveryAvailable: true
  },

  // ── 7. MONITORS & DISPLAYS (6) ───────────────────────────────────────────
  {
    productId: 'PRD-LG27GN800-QHD',
    name: 'LG Ultragear 27 inch QHD IPS Gaming Monitor (27GN800, 144Hz, 1ms)',
    category: 'Monitors',
    brand: 'LG',
    price: 33500,
    discountPrice: 22499,
    stock: 11,
    sku: 'LG-27GN800-B',
    status: 'Active',
    badges: ['QHD 144Hz', 'NVIDIA G-SYNC Compatible', '1ms IPS'],
    features: [
      '27-inch QHD (2560 x 1440) IPS Display with sRGB 99% Color Gamut',
      '144Hz Refresh Rate & 1ms (GtG) Response Time for fluid gameplay',
      'NVIDIA G-SYNC Compatible & AMD FreeSync Premium support',
      'HDR10 support for dynamic contrast and realistic visuals',
      '3-Side Virtually Borderless Design'
    ],
    description: 'LG UltraGear 27GN800 is a powerful gaming monitor equipped with QHD IPS display, 144Hz refresh rate, and 1ms response time for competitive gamers.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop'
    ],
    packageContents: ['LG 27GN800 Monitor', 'DisplayPort Cable', 'Power Adapter', 'Stand Assembly'],
    specifications: {
      general: { modelNumber: '27GN800-B', countryOfOrigin: 'China', color: 'Black / Red' },
      electrical: { voltage: '100-240V', wattage: '45W' },
      physical: { weight: '6.0 kg', dimensions: '61.4 x 45.4 x 22.5 cm', displaySize: '27.0 Inches' },
      warranty: { duration: '3 Years LG Onsite Warranty', coverage: '3 Years parts & labor warranty' },
      technical: { resolution: '2560 x 1440 QHD', refreshRate: '144Hz', responseTime: '1ms GtG' }
    },
    ratings: { average: 4.8, count: 130 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SAMSUNG-27G5-CURVED',
    name: 'Samsung 27 inch Odyssey G5 Curved Gaming Monitor (165Hz, 1ms, WQHD)',
    category: 'Monitors',
    brand: 'Samsung',
    price: 31000,
    discountPrice: 20999,
    stock: 14,
    sku: 'SAM-LC27G55TQWXXL',
    status: 'Active',
    badges: ['1000R Curve', '165Hz WQHD', 'FreeSync Premium'],
    features: [
      '27-inch WQHD (2560x1440) 1000R Curved Gaming Screen',
      '165Hz Refresh Rate eliminates lag for ultra-smooth gaming action',
      '1ms Response Time (MPRT) for crisp pixels with minimal blur',
      'AMD FreeSync Premium reduces screen tearing & stuttering',
      'HDR10 reveals stunning details in bright & dark scenes'
    ],
    description: 'Wrap yourself in realistic scenes with Samsung Odyssey G5 1000R curved gaming monitor featuring WQHD resolution and 165Hz speed.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Samsung G5 Monitor', 'HDMI Cable', 'Power Cable', 'Stand'],
    specifications: {
      general: { modelNumber: 'LS27AG550NWXXL', countryOfOrigin: 'Vietnam', color: 'Black' },
      electrical: { voltage: '100-240V', wattage: '48W' },
      physical: { weight: '4.5 kg', dimensions: '61.6 x 47.7 x 27.2 cm', displaySize: '27.0 Inches Curved' },
      warranty: { duration: '3 Years Samsung Warranty', coverage: '3 Year brand warranty' },
      technical: { resolution: '2560 x 1440 WQHD', refreshRate: '165Hz', responseTime: '1ms' }
    },
    ratings: { average: 4.6, count: 98 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ASUSTUF-245-165HZ',
    name: 'ASUS TUF Gaming 24.5 inch FHD Gaming Monitor (VG259QR, 165Hz)',
    category: 'Monitors',
    brand: 'ASUS',
    price: 21990,
    discountPrice: 15499,
    stock: 16,
    sku: 'ASUS-VG259QR',
    status: 'Active',
    badges: ['TUF Gaming', 'Extreme Low Motion Blur'],
    features: [
      '24.5-inch Full HD (1920x1080) IPS Gaming Monitor with 165Hz Refresh Rate',
      'ASUS Extreme Low Motion Blur (ELMB) technology for 1ms response time',
      'Shadow Boost enhances image details in dark areas without overexposing bright spots',
      'Ergonomically designed stand with tilt, swivel, pivot and height adjustment',
      'G-SYNC Compatible ready for seamless tearing-free gaming'
    ],
    description: 'ASUS TUF Gaming VG259QR is a 24.5-inch Full HD IPS gaming display with ultra-fast 165Hz refresh rate designed for professional gamers.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop'
    ],
    packageContents: ['ASUS VG259QR', 'DisplayPort Cable', 'Power Cord', 'Quick Start Guide'],
    specifications: {
      general: { modelNumber: 'VG259QR', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '100-240V', wattage: '40W' },
      physical: { weight: '5.1 kg', dimensions: '56.3 x 48.7 x 21.1 cm', displaySize: '24.5 Inches' },
      warranty: { duration: '3 Years ASUS Onsite Warranty', coverage: '3 years warranty' },
      technical: { resolution: '1920 x 1080 FHD', refreshRate: '165Hz', responseTime: '1ms' }
    },
    ratings: { average: 4.7, count: 82 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-DELL24-SE2422H',
    name: 'Dell 24 inch FHD Monitor (SE2422H, IPS, 75Hz)',
    category: 'Monitors',
    brand: 'Dell',
    price: 13990,
    discountPrice: 9499,
    stock: 22,
    sku: 'DELL-SE2422H',
    status: 'Active',
    badges: ['ComfortView', 'Compact Stand'],
    features: [
      '23.8-inch Full HD (1920 x 1080) VA Anti-glare Display',
      '75Hz Refresh Rate with AMD FreeSync technology',
      'TÜV-certified ComfortView reduces harmful blue light emissions',
      'Compact footprint with built-in power supply unit and cable holder',
      'HDMI and VGA connectivity ports'
    ],
    description: 'Dell 24 SE2422H Monitor offers clean desktop style with an anti-glare FHD screen, 75Hz refresh rate, and ComfortView technology for long work sessions.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Dell SE2422H Monitor', 'HDMI Cable', 'Power Cable', 'Stand Base'],
    specifications: {
      general: { modelNumber: 'SE2422H', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '100-240V', wattage: '20W' },
      physical: { weight: '3.8 kg', dimensions: '55.3 x 42.0 x 17.8 cm', displaySize: '23.8 Inches' },
      warranty: { duration: '3 Years Dell Advanced Exchange Warranty', coverage: '3 Year replacement warranty' },
      technical: { resolution: '1920 x 1080 FHD', refreshRate: '75Hz', responseTime: '5ms' }
    },
    ratings: { average: 4.5, count: 140 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-BENQ-EW2880U-4K',
    name: 'BenQ EW2880U 28 inch 4K UHD Entertainment Monitor with HDRi',
    category: 'Monitors',
    brand: 'Dell',
    price: 36990,
    discountPrice: 28990,
    stock: 8,
    sku: 'BENQ-EW2880U-4K',
    status: 'Active',
    badges: ['4K UHD', 'HDRi Tech', 'treVolo Speakers'],
    features: [
      '28-inch 4K UHD (3840x2160) IPS Display with 90% DCI-P3 Color Space',
      'Proprietary HDRi Technology enhances color detail and clarity automatically',
      'Built-in 3Wx2 treVolo Stereo Speakers with customized audio modes',
      'USB Type-C port with 60W Power Delivery for single-cable laptop connection',
      'Eye-Care Technology: Brightness Intelligence Plus, Low Blue Light & Flicker-Free'
    ],
    description: 'Immerse yourself in cinematic 4K entertainment with BenQ EW2880U featuring HDRi intelligent sensor tech, USB-C connectivity, and treVolo speakers.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop'
    ],
    packageContents: ['BenQ EW2880U', 'HDMI 2.0 Cable', 'USB-C Cable', 'Power Cord', 'Remote Control'],
    specifications: {
      general: { modelNumber: 'EW2880U', countryOfOrigin: 'Taiwan', color: 'Metallic Grey' },
      electrical: { voltage: '100-240V', wattage: '130W (Max)' },
      physical: { weight: '7.9 kg', dimensions: '63.7 x 52.1 x 27.6 cm', displaySize: '28.0 Inches' },
      warranty: { duration: '3 Years BenQ Onsite Warranty', coverage: '3 Year brand warranty' },
      technical: { resolution: '3840 x 2160 4K', refreshRate: '60Hz', responseTime: '5ms' }
    },
    ratings: { average: 4.7, count: 52 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ACERNITRO-27-180HZ',
    name: 'Acer Nitro 27 inch FHD IPS Gaming Monitor (VG270, 180Hz)',
    category: 'Monitors',
    brand: 'Acer',
    price: 18999,
    discountPrice: 12999,
    stock: 18,
    sku: 'ACER-VG270-180HZ',
    status: 'Active',
    badges: ['180Hz OC', '0.5ms Response', 'HDR10'],
    features: [
      '27-inch Full HD (1920 x 1080) IPS ZeroFrame Gaming Display',
      '180Hz Refresh Rate (Overclocked) & 0.5ms Response Time',
      'AMD FreeSync Premium technology for tear-free gaming',
      '2x HDMI 2.0, 1x DisplayPort 1.2, Audio Out with Inbuilt 2W Stereo Speakers',
      'HDR10 support & sRGB 99% color gamut'
    ],
    description: 'Supercharge your gaming setup with Acer Nitro VG270. Featuring 180Hz refresh rate and ultra-low 0.5ms VRB response time on a 27-inch IPS panel.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Acer Nitro VG270', 'HDMI Cable', 'DisplayPort Cable', 'Power Cord'],
    specifications: {
      general: { modelNumber: 'VG270 M3', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '100-240V', wattage: '35W' },
      physical: { weight: '4.5 kg', dimensions: '61.4 x 45.7 x 24.0 cm', displaySize: '27.0 Inches' },
      warranty: { duration: '3 Years Acer Onsite Warranty', coverage: '3 Year warranty' },
      technical: { resolution: '1920 x 1080 FHD', refreshRate: '180Hz', responseTime: '0.5ms VRB' }
    },
    ratings: { average: 4.6, count: 115 },
    deliveryAvailable: true
  },

  // ── 8. COMPUTER PERIPHERALS & ACCESSORIES (10) ──────────────────────────
  {
    productId: 'PRD-LOGITECH-MXMASTER3S',
    name: 'Logitech MX Master 3S Wireless Performance Mouse - Graphite',
    category: 'Computer Accessories',
    brand: 'Logitech',
    price: 10995,
    discountPrice: 8995,
    stock: 25,
    sku: 'LOGI-MXM3S-GRPH',
    status: 'Active',
    badges: ['8K DPI Track-Anywhere', 'Quiet Clicks', 'MagSpeed Scroll'],
    features: [
      '8000 DPI Optical Sensor tracks on any surface including glass',
      'Quiet Clicks deliver 90% less click noise with satisfying tactile feedback',
      'MagSpeed Electromagnetic Scrolling scrolls 1000 lines per second in silence',
      'Ergonomic silhouette crafted to support palm and wrist position',
      'Logi Options+ App customization for app-specific profiles',
      'Connect up to 3 devices via Bluetooth or Logi Bolt Receiver'
    ],
    description: 'Logitech MX Master 3S is an iconic master remastered. Feel every moment of your workflow with even more precision, tactility, and performance.',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop'
    ],
    packageContents: ['MX Master 3S Mouse', 'Logi Bolt USB Receiver', 'USB-C Charging Cable (USB-A to USB-C)', 'User Documentation'],
    specifications: {
      general: { modelNumber: '910-006561', countryOfOrigin: 'China', color: 'Graphite' },
      electrical: { batteryCapacity: '500 mAh (Up to 70 days)', chargingSpeed: 'USB-C Quick Charge (1 min = 3h)', voltage: '5V' },
      physical: { weight: '141g', dimensions: '124.9 x 84.3 x 51.0 mm', displaySize: 'N/A' },
      warranty: { duration: '1 Year Limited Hardware Warranty', coverage: 'Logitech brand warranty' },
      technical: { bluetoothVersion: '5.1 + Logi Bolt', sensorDpi: '8000 DPI' }
    },
    ratings: { average: 4.9, count: 230 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-LOGITECH-K380-ROSE',
    name: 'Logitech K380 Multi-Device Bluetooth Keyboard - Rose',
    category: 'Computer Accessories',
    brand: 'Logitech',
    price: 3195,
    discountPrice: 2495,
    stock: 30,
    sku: 'LOGI-K380-ROSE',
    status: 'Active',
    badges: ['Multi-Device', 'Slim & Portable'],
    features: [
      'Type on any Bluetooth device (Windows, Mac, Chrome OS, Android, iOS)',
      'Easy-Switch keys allow connecting up to 3 devices simultaneously',
      'Minimalist, compact layout with comfortable scoop keys',
      '2-Year AAA battery life with auto-sleep power saving mode'
    ],
    description: 'Make any space minimalist, modern, and versatile with the K380 Multi-Device Bluetooth keyboard — ultra-thin, design-forward keyboard for computer and phone.',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop'
    ],
    packageContents: ['K380 Keyboard', '2 AAA Batteries (Pre-installed)', 'User Documentation'],
    specifications: {
      general: { modelNumber: '920-009581', countryOfOrigin: 'China', color: 'Rose' },
      electrical: { batteryCapacity: '2x AAA (24 Months)', chargingSpeed: 'N/A', voltage: '3V' },
      physical: { weight: '423g', dimensions: '279 x 124 x 16 mm', displaySize: 'N/A' },
      warranty: { duration: '1 Year Limited Hardware Warranty', coverage: 'Logitech warranty' },
      technical: { bluetoothVersion: '3.0', layout: 'Compact QWERTY' }
    },
    ratings: { average: 4.7, count: 310 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-LOGITECH-G213-RGB',
    name: 'Logitech G213 Prodigy RGB Gaming Keyboard',
    category: 'Keyboards',
    brand: 'Logitech',
    price: 4995,
    discountPrice: 3795,
    stock: 20,
    sku: 'LOGI-G213-RGB',
    status: 'Active',
    badges: ['LIGHTSYNC RGB', 'Spill Resistant'],
    features: [
      'Mech-Dome keys tuned for gaming with tactile feel comparable to mechanical keys',
      'LIGHTSYNC RGB Lighting with 16.8M colors across 5 zones',
      'Durable spill-resistant body tested with 60ml liquid rating',
      'Integrated Palm Rest and two-level adjustable feet',
      'Dedicated Media Controls to play, pause, mute, and adjust volume instantly'
    ],
    description: 'Logitech G213 Prodigy features Mech-Dome keys, customizable LIGHTSYNC RGB lighting, and durable spill resistance for high performance gaming.',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop'
    ],
    packageContents: ['G213 Gaming Keyboard', 'User Documentation'],
    specifications: {
      general: { modelNumber: '920-008096', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '5V USB', wattage: 'N/A' },
      physical: { weight: '1000g', dimensions: '452 x 218 x 33 mm', displaySize: 'N/A' },
      warranty: { duration: '2 Years Limited Hardware Warranty', coverage: 'Logitech G warranty' },
      technical: { keyboardType: 'Mech-Dome Membrane', rgb: '5-Zone RGB' }
    },
    ratings: { average: 4.6, count: 185 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-RAZER-DEATHADDER-ESS',
    name: 'Razer DeathAdder Essential Gaming Mouse - Black',
    category: 'Mice',
    brand: 'Logitech',
    price: 4499,
    discountPrice: 1299,
    stock: 35,
    sku: 'RZR-DA-ESS-BLK',
    status: 'Active',
    badges: ['6400 DPI', 'Ergonomic Icon', '10M Clicks'],
    features: [
      '6,400 DPI Optical Sensor for fast and precise mouse swipes',
      'Ergonomic Right-Handed Form Factor proven by esports pros',
      '5 Hyperesponse Buttons programmable via Razer Synapse 3',
      'Razer Mechanical Switches rated for up to 10 million clicks',
      'Single-color Green LED Logo lighting'
    ],
    description: 'The Razer DeathAdder Essential retains the classic ergonomic form that has been a staple of previous Razer DeathAdder generations.',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Razer DeathAdder Essential', 'Product Information Guide'],
    specifications: {
      general: { modelNumber: 'RZ01-03850100-R3M1', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '5V USB', wattage: 'N/A' },
      physical: { weight: '96g', dimensions: '127.0 x 73.0 x 43.0 mm', displaySize: 'N/A' },
      warranty: { duration: '2 Years Razer Warranty', coverage: 'Razer official brand warranty' },
      technical: { sensorDpi: '6400 DPI', pollingRate: '1000Hz' }
    },
    ratings: { average: 4.5, count: 420 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-CORSAIR-K55-RGBPRO',
    name: 'Corsair K55 RGB PRO Gaming Keyboard',
    category: 'Keyboards',
    brand: 'Corsair',
    price: 4599,
    discountPrice: 3299,
    stock: 15,
    sku: 'CRS-K55-RGB-PRO',
    status: 'Active',
    badges: ['IP42 Dust/Spill', '6 Macro Keys', 'iCUE Compatible'],
    features: [
      'Dynamic 5-Zone RGB Backlighting with onboard lighting effects',
      '6 Dedicated Macro Keys programmable via Elgato Stream Deck software',
      'IP42 Dust and Spill Resistance protects against accidents',
      'Detachable Soft Rubber Palm Rest reduces strain during marathon sessions',
      'Quiet and responsive keys with anti-ghosting technology'
    ],
    description: 'Illuminate your desktop with Corsair K55 RGB PRO Gaming Keyboard featuring 5-zone RGB backlighting, 6 dedicated macro keys, and IP42 spill resistance.',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop'
    ],
    packageContents: ['K55 RGB PRO Keyboard', 'Detachable Palm Rest', 'Safety Leaflet'],
    specifications: {
      general: { modelNumber: 'CH-9226765-IN', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '5V USB', wattage: 'N/A' },
      physical: { weight: '810g', dimensions: '481 x 167 x 36 mm', displaySize: 'N/A' },
      warranty: { duration: '2 Years Corsair Warranty', coverage: 'Corsair brand warranty' },
      technical: { keyboardType: 'Membrane Rubber Dome', rgb: '5-Zone RGB' }
    },
    ratings: { average: 4.6, count: 95 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-HP-CS10-COMBO',
    name: 'HP Wireless Keyboard and Mouse Combo CS10',
    category: 'Computer Accessories',
    brand: 'HP',
    price: 1999,
    discountPrice: 1299,
    stock: 40,
    sku: 'HP-CS10-COMBO',
    status: 'Active',
    badges: ['2.4GHz Wireless', 'Ergonomic Combo'],
    features: [
      '2.4GHz Wireless Connectivity with a single USB Nano Receiver',
      'Full-size keyboard layout with numpad and shortcut keys',
      '1000 DPI Ambidextrous Optical Mouse',
      'Energy efficient design with auto-sleep battery saving',
      'Plug-and-Play setup — no driver installation needed'
    ],
    description: 'Tidy up your workspace with the HP CS10 Wireless Keyboard and Mouse Combo. Reliable 2.4GHz wireless connection using one tiny USB dongle.',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Wireless Keyboard', 'Wireless Mouse', 'USB Nano Receiver', 'AAA Batteries', 'User Guide'],
    specifications: {
      general: { modelNumber: 'CS10', countryOfOrigin: 'China', color: 'Black' },
      electrical: { batteryCapacity: 'AAA/AA Batteries', chargingSpeed: 'N/A', voltage: '3V' },
      physical: { weight: '550g (Combo)', dimensions: '43.5 x 12.5 x 2.2 cm', displaySize: 'N/A' },
      warranty: { duration: '1 Year HP Limited Warranty', coverage: 'HP brand warranty' },
      technical: { connectivity: '2.4GHz USB Dongle', sensorDpi: '1000 DPI' }
    },
    ratings: { average: 4.3, count: 280 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ZEBRONICS-TRANSFORMER-COMBO',
    name: 'Zebronics Zeb-Transformer Gaming Keyboard and Mouse Combo',
    category: 'Gaming Accessories',
    brand: 'Zebronics',
    price: 2299,
    discountPrice: 1299,
    stock: 50,
    sku: 'ZEB-TRANSFORMER-CMB',
    status: 'Active',
    badges: ['Bestseller Combo', 'Multi-color LED', 'Braided Cable'],
    features: [
      'Full Aluminum Body Panel Gaming Keyboard with Multi-color LED Light Modes',
      'Laser-Keycaps for durable non-fading lettering',
      'Gaming Mouse with 4-Step DPI Switch (800 / 1200 / 1600 / 3200 DPI)',
      'High Precision Optical Gaming Sensor with 6 Buttons',
      'Heavy Duty Braided Cable with Gold-plated USB Connector'
    ],
    description: 'Transform your gaming experience with Zebronics Zeb-Transformer combo. Features a solid aluminum keyboard body and 3200 DPI LED gaming mouse.',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Zeb-Transformer Keyboard', 'Zeb-Transformer Mouse', 'User Manual'],
    specifications: {
      general: { modelNumber: 'Zeb-Transformer', countryOfOrigin: 'China', color: 'Silver-Black' },
      electrical: { voltage: '5V USB', wattage: 'N/A' },
      physical: { weight: '950g (Keyboard), 130g (Mouse)', dimensions: '47.4 x 17.2 x 4.0 cm', displaySize: 'N/A' },
      warranty: { duration: '1 Year Zebronics Warranty', coverage: 'Brand warranty' },
      technical: { sensorDpi: '3200 DPI', cableLength: '1.8m Braided' }
    },
    ratings: { average: 4.4, count: 480 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-LOGITECH-C920-WEBCAM',
    name: 'Logitech C920 HD Pro Webcam (1080p)',
    category: 'Webcams',
    brand: 'Logitech',
    price: 8995,
    discountPrice: 6495,
    stock: 16,
    sku: 'LOGI-C920-1080P',
    status: 'Active',
    badges: ['Full HD 1080p', 'Dual Stereo Mics', 'Glass Lens'],
    features: [
      'Full HD 1080p Video Calling & Recording at 30 fps',
      'Full HD Glass Lens with 78-degree diagonal field of view',
      'RightLight 2 Automatic HD Light Correction for clear video in dim lighting',
      'Dual Omnidirectional Microphones for clear stereo audio recording',
      'Tripod-ready universal mounting clip fits laptops and LCD monitors'
    ],
    description: 'Make a strong impression on video calls with Logitech C920 HD Pro Webcam. Crisp Full HD 1080p resolution and dual stereo microphones.',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop'
    ],
    packageContents: ['C920 Webcam with attached 1.5m cable', 'User Documentation'],
    specifications: {
      general: { modelNumber: '960-000764', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '5V USB', wattage: 'N/A' },
      physical: { weight: '162g', dimensions: '94 x 71 x 43 mm', displaySize: 'N/A' },
      warranty: { duration: '2 Years Limited Hardware Warranty', coverage: 'Logitech warranty' },
      technical: { resolution: '1080p / 30fps', autofocus: 'Yes' }
    },
    ratings: { average: 4.7, count: 140 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-TPLINK-TAPOC200',
    name: 'TP-Link Tapo C200 1080p Full HD Smart Security Camera',
    category: 'Smart Home',
    brand: 'TP-Link',
    price: 3299,
    discountPrice: 1899,
    stock: 40,
    sku: 'TPLINK-TAPO-C200',
    status: 'Active',
    badges: ['360 Pan/Tilt', 'Night Vision', 'Two-Way Audio'],
    features: [
      'High-Definition 1080p Video capturing every detail',
      '360° Horizontal and 114° Vertical Range Pan and Tilt',
      'Advanced Night Vision up to 30 feet in dark conditions',
      'Motion Detection and Instant Smartphone Notifications',
      'Two-Way Audio with built-in microphone and speaker',
      'Supports microSD card up to 512 GB for local video storage'
    ],
    description: 'Secure your home smart and easy with TP-Link Tapo C200. Features 360-degree pan/tilt view, night vision, and motion detection alerts.',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Tapo C200 Camera', 'Power Adapter (3m)', 'Mounting Screws & Template', 'Camera Base', 'Quick Start Guide'],
    specifications: {
      general: { modelNumber: 'Tapo C200', countryOfOrigin: 'China', color: 'White' },
      electrical: { voltage: '9.0V / 0.6A', wattage: '5.4W' },
      physical: { weight: '190g', dimensions: '8.6 x 8.5 x 11.7 cm', displaySize: 'N/A' },
      warranty: { duration: '2 Years TP-Link Warranty', coverage: '2 Year brand warranty' },
      technical: { resolution: '1080p Full HD', wireless: 'Wi-Fi 802.11 b/g/n' }
    },
    ratings: { average: 4.6, count: 540 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ANKER-POWERC200-2K',
    name: 'Anker PowerConf C200 2K USB Webcam',
    category: 'Webcams',
    brand: 'Anker',
    price: 7999,
    discountPrice: 4999,
    stock: 12,
    sku: 'ANK-C200-2K',
    status: 'Active',
    badges: ['2K QHD', 'Privacy Cover', 'Dual AI Mics'],
    features: [
      'Ultra-clear 2K (2560x1440) resolution at 30 fps',
      'Adjustable Field of View (65°, 78°, or 95°) via AnkerWork App',
      'Built-in Physical Privacy Cover for peace of mind',
      'Dual Stereo Microphones with AI Noise Reduction',
      'Large F2.0 Aperture lens for superior low-light performance'
    ],
    description: 'Look like a pro on video calls with Anker PowerConf C200. Delivers crisp 2K QHD picture, adjustable field of view, and a built-in privacy shutter.',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Anker PowerConf C200', 'USB 2.0 to Type-C Cable', 'Quick Start Guide'],
    specifications: {
      general: { modelNumber: 'A3369', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '5V USB', wattage: 'N/A' },
      physical: { weight: '83g', dimensions: '5.0 x 5.0 x 4.0 cm', displaySize: 'N/A' },
      warranty: { duration: '18 Months Anker Warranty', coverage: '18 month official warranty' },
      technical: { resolution: '2K QHD (2560x1440)', autofocus: 'Yes' }
    },
    ratings: { average: 4.7, count: 65 },
    deliveryAvailable: true
  },

  // ── 9. STORAGE & PC COMPONENTS (10) ──────────────────────────────────────
  {
    productId: 'PRD-SAMSUNG-980PRO-1TB',
    name: 'Samsung 980 PRO 1TB PCIe 4.0 NVMe M.2 Internal SSD',
    category: 'Storage',
    brand: 'Samsung',
    price: 14999,
    discountPrice: 9999,
    stock: 25,
    sku: 'SAM-980PRO-1TB',
    status: 'Active',
    badges: ['PCIe 4.0', '7000 MB/s Speed', 'PS5 Compatible'],
    features: [
      'Next-level PCIe 4.0 NVMe M.2 2280 internal SSD performance',
      'Sequential Read speeds up to 7000 MB/s & Write speeds up to 5000 MB/s',
      'In-house Samsung Elpis Controller & V-NAND 3-bit MLC flash',
      'Nickel coating & Dynamic Thermal Guard to manage heat',
      'Compatible with PlayStation 5 and high-end gaming PCs'
    ],
    description: 'Unleash the power of the Samsung 980 PRO PCIe 4.0 NVMe SSD for next-level computing and gaming load speeds.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Samsung 980 PRO 1TB SSD', 'Installation Guide'],
    specifications: {
      general: { modelNumber: 'MZ-V8P1T0BW', countryOfOrigin: 'Korea', color: 'Black' },
      electrical: { voltage: '3.3V', wattage: '6.2W (Avg)' },
      physical: { weight: '9.0g', dimensions: '80.15 x 22.15 x 2.38 mm', displaySize: 'M.2 2280' },
      warranty: { duration: '5 Years Limited Warranty or 600 TBW', coverage: 'Samsung 5 year SSD warranty' },
      technical: { interface: 'PCIe Gen 4.0 x4', readSpeed: '7000 MB/s', writeSpeed: '5000 MB/s' }
    },
    ratings: { average: 4.9, count: 210 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-CRUCIAL-P3-1TB',
    name: 'Crucial P3 1TB PCIe 3.0 3D NAND NVMe M.2 SSD',
    category: 'Storage',
    brand: 'Kingston',
    price: 8500,
    discountPrice: 5499,
    stock: 30,
    sku: 'CRL-P3-1TB',
    status: 'Active',
    badges: ['Best Value SSD', '3500 MB/s'],
    features: [
      'NVMe PCIe 3.0 M.2 2280 interface',
      'Sequential Read speeds up to 3500 MB/s & Write up to 3000 MB/s',
      'Advanced 3D NAND technology from Micron',
      'Up to 33% faster performance than previous generation NVMe SSDs',
      'Includes Crucial Storage Executive software for SSD optimization'
    ],
    description: 'Basic NVMe speed can’t hold a candle to the Crucial P3 SSD. Experience fast load times and rapid data transfers for your desktop or laptop.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Crucial P3 1TB SSD', 'M.2 Mounting Screw', 'User Guide'],
    specifications: {
      general: { modelNumber: 'CT1000P3SSD8', countryOfOrigin: 'Mexico / Malaysia', color: 'Black' },
      electrical: { voltage: '3.3V', wattage: '4.5W' },
      physical: { weight: '7.0g', dimensions: '80 x 22 x 2.15 mm', displaySize: 'M.2 2280' },
      warranty: { duration: '5 Years Limited Warranty', coverage: '5 Year Crucial manufacturer warranty' },
      technical: { interface: 'PCIe Gen 3.0 x4', readSpeed: '3500 MB/s', writeSpeed: '3000 MB/s' }
    },
    ratings: { average: 4.7, count: 180 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SANDISK-EXTREME-1TB',
    name: 'SanDisk Extreme Portable 1TB External SSD (USB 3.2 Gen 2)',
    category: 'Storage',
    brand: 'SanDisk',
    price: 17000,
    discountPrice: 9499,
    stock: 20,
    sku: 'SNDK-EXT-1TB-PORT',
    status: 'Active',
    badges: ['1050 MB/s Read', 'IP65 Rugged', '2m Drop Protection'],
    features: [
      'Fast NVMe solid state performance with 1050MB/s Read and 1000MB/s Write speeds',
      'IP65 Water and Dust Resistance rating',
      'Up to 3-meter drop protection and durable silicone shell',
      'Handy carabiner loop to secure to belt loop or backpack',
      '256-bit AES Hardware Encryption with password protection'
    ],
    description: 'SanDisk Extreme Portable SSD delivers high-speed transfers with read speeds up to 1050MB/s in a rugged outdoor-ready drive.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop'
    ],
    packageContents: ['SanDisk Extreme Portable SSD 1TB', 'USB-C to USB-C Cable', 'USB-C to USB-A Adapter', 'Safety Guide'],
    specifications: {
      general: { modelNumber: 'SDSSDE61-1T00-G25', countryOfOrigin: 'China', color: 'Black / Orange Accent' },
      electrical: { voltage: '5V USB', wattage: 'N/A' },
      physical: { weight: '52g', dimensions: '100.5 x 52.4 x 8.9 mm', displaySize: 'N/A' },
      warranty: { duration: '5 Years SanDisk Limited Warranty', coverage: '5 Year official brand warranty' },
      technical: { interface: 'USB 3.2 Gen 2', readSpeed: '1050 MB/s', writeSpeed: '1000 MB/s' }
    },
    ratings: { average: 4.8, count: 260 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-WD-MYPASSPORT-2TB',
    name: 'WD My Passport 2TB External Hard Drive - Black',
    category: 'Storage',
    brand: 'WD',
    price: 7900,
    discountPrice: 5899,
    stock: 28,
    sku: 'WD-MYPASSPORT-2TB',
    status: 'Active',
    badges: ['Bestseller HDD', 'Password Protection'],
    features: [
      'Slim & Durable Portable External Hard Drive design',
      '2TB Storage Capacity for photos, videos, and documents',
      'USB 3.2 Gen 1 (USB 3.0) interface for quick backup',
      'Built-in 256-bit AES Hardware Encryption with WD Security',
      'Includes WD Backup software with ransomware protection'
    ],
    description: 'WD My Passport drive is trusted, portable storage that gives you the confidence and freedom to drive forward in life.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop'
    ],
    packageContents: ['WD My Passport Drive 2TB', 'SuperSpeed USB Cable', 'WD Discovery Software', 'Quick Install Guide'],
    specifications: {
      general: { modelNumber: 'WDBYVG0020BBK-WESN', countryOfOrigin: 'Thailand / Malaysia', color: 'Black' },
      electrical: { voltage: '5V USB Bus Powered', wattage: 'N/A' },
      physical: { weight: '120g', dimensions: '107.2 x 75.0 x 11.15 mm', displaySize: 'N/A' },
      warranty: { duration: '3 Years WD Limited Warranty', coverage: '3 Year brand warranty' },
      technical: { interface: 'USB 3.0 / USB 2.0', rpm: '5400 RPM' }
    },
    ratings: { average: 4.6, count: 410 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SEAGATE-EXPANSION-1TB',
    name: 'Seagate Expansion 1TB External HDD',
    category: 'Storage',
    brand: 'Seagate',
    price: 5200,
    discountPrice: 4299,
    stock: 35,
    sku: 'SEAGATE-EXP-1TB',
    status: 'Active',
    badges: ['Rescue Data Recovery', 'Plug & Play'],
    features: [
      'Simple drag-and-drop file saving right out of the box',
      'Fast USB 3.0 data transfer connection',
      'Automatic recognition by Windows and Mac computers',
      'Includes 3 Years Rescue Data Recovery Services for data loss protection'
    ],
    description: 'Seagate Expansion portable drive offers an easy-to-use solution when you need to instantly add storage to your computer and take files on the go.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Seagate Expansion Drive 1TB', '18-inch (45.72cm) USB 3.0 Cable', 'Quick Start Guide'],
    specifications: {
      general: { modelNumber: 'STKM1000400', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '5V USB', wattage: 'N/A' },
      physical: { weight: '159g', dimensions: '115.3 x 80.0 x 12.6 mm', displaySize: 'N/A' },
      warranty: { duration: '3 Years Seagate Warranty', coverage: '3 Year warranty + 3 Year Rescue Data Recovery Services' },
      technical: { interface: 'USB 3.0', rpm: '5400 RPM' }
    },
    ratings: { average: 4.5, count: 320 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-CORSAIR-VENGEANCE-16GB-DDR4',
    name: 'Corsair Vengeance LPX 16GB (1x16GB) DDR4 3200MHz RAM',
    category: 'RAM',
    brand: 'Corsair',
    price: 4999,
    discountPrice: 3499,
    stock: 22,
    sku: 'CRS-VEN-16G-3200',
    status: 'Active',
    badges: ['Low Profile Heatspreader', 'XMP 2.0'],
    features: [
      'Designed for high-performance overclocking on Intel & AMD motherboards',
      'Pure Aluminum Heatspreader for faster heat dissipation',
      'Low-profile height design fits into small form-factor cases',
      'XMP 2.0 Support for automatic over-clocking'
    ],
    description: 'Vengeance LPX memory is designed for high-performance overclocking. The heatspreader is made of pure aluminum for faster heat dissipation.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop'
    ],
    packageContents: ['1x 16GB Corsair Vengeance LPX DDR4 RAM Module'],
    specifications: {
      general: { modelNumber: 'CMK16GX4M1E3200C16', countryOfOrigin: 'Taiwan', color: 'Black' },
      electrical: { voltage: '1.35V', wattage: 'N/A' },
      physical: { weight: '38g', dimensions: '135 x 335 x 7 mm', displaySize: 'N/A' },
      warranty: { duration: '10 Years Limited Warranty', coverage: 'Corsair lifetime limited warranty' },
      technical: { memorySpeed: '3200 MHz', memoryType: 'DDR4 SDRAM (288-pin DIMM)' }
    },
    ratings: { average: 4.8, count: 175 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-KINGSTON-FURY-16GB-DDR5',
    name: 'Kingston FURY Beast 16GB DDR5 5200MHz Desktop RAM',
    category: 'RAM',
    brand: 'Kingston',
    price: 6800,
    discountPrice: 4899,
    stock: 18,
    sku: 'KNG-FURY-16G-D5',
    status: 'Active',
    badges: ['Next-Gen DDR5', 'Intel XMP 3.0'],
    features: [
      'Greater speed starting at 5200MHz for gaming and heavy rendering',
      'Improved stability for overclocking with On-Die ECC (ODECC)',
      'Increased efficiency with doubled bank architecture',
      'Intel XMP 3.0 & AMD EXPO Certified'
    ],
    description: 'Kingston FURY Beast DDR5 memory brings the latest cutting-edge technology for next-gen gaming platforms.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop'
    ],
    packageContents: ['1x 16GB Kingston FURY Beast DDR5 RAM Module'],
    specifications: {
      general: { modelNumber: 'KF552C40BB-16', countryOfOrigin: 'Taiwan', color: 'Black' },
      electrical: { voltage: '1.25V', wattage: 'N/A' },
      physical: { weight: '38g', dimensions: '133.3 x 34.9 x 6.6 mm', displaySize: 'N/A' },
      warranty: { duration: '10 Years Limited Warranty', coverage: 'Kingston lifetime limited warranty' },
      technical: { memorySpeed: '5200 MHz', memoryType: 'DDR5 SDRAM (288-pin DIMM)' }
    },
    ratings: { average: 4.8, count: 85 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ASUS-RTX4060-8GB',
    name: 'ASUS Dual GeForce RTX 4060 OC Edition 8GB GDDR6 Graphics Card',
    category: 'Graphics Cards',
    brand: 'ASUS',
    price: 36999,
    discountPrice: 30999,
    stock: 8,
    sku: 'ASUS-DUAL-RTX4060-O8G',
    status: 'Active',
    badges: ['NVIDIA DLSS 3', 'Axial-tech Fans', 'Dual Ball Bearings'],
    features: [
      'Powered by NVIDIA DLSS 3, ultra-efficient Ada Lovelace architecture, and full ray tracing',
      'Axial-tech Fan Design features a smaller fan hub for longer blades and a barrier ring to increase downward air pressure',
      '2.5-slot Design maximizes compatibility and cooling efficiency',
      '0dB Technology lets you enjoy light gaming in relative silence',
      'Protective Backplate secures components during transportation and installation'
    ],
    description: 'ASUS Dual GeForce RTX 4060 merges dynamic thermal performance with broad compatibility for compact desktop gaming builds.',
    images: [
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop'
    ],
    packageContents: ['ASUS Dual RTX 4060 GPU', 'Speedsetup Manual', 'Collection Card'],
    specifications: {
      general: { modelNumber: 'DUAL-RTX4060-O8G-V2', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '1x 8-pin Power Connector', wattage: '550W Recommended PSU' },
      physical: { weight: '640g', dimensions: '22.72 x 12.32 x 4.96 cm', displaySize: '2.5 Slot' },
      warranty: { duration: '3 Years ASUS Warranty', coverage: '3 Year brand hardware warranty' },
      technical: { gpu: 'NVIDIA GeForce RTX 4060', memory: '8GB GDDR6', interface: 'PCI Express 4.0' }
    },
    ratings: { average: 4.8, count: 64 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-MSI-RTX3060-12GB',
    name: 'MSI GeForce RTX 3060 Ventus 2X 12G OC Graphics Card',
    category: 'Graphics Cards',
    brand: 'MSI',
    price: 32000,
    discountPrice: 26499,
    stock: 10,
    sku: 'MSI-RTX3060-VENTUS2X-12G',
    status: 'Active',
    badges: ['12GB VRAM', 'TORX Fan 3.0'],
    features: [
      'NVIDIA Ampere Streaming Multiprocessors & 12GB GDDR6 VRAM',
      'TORX Fan 3.0 creates high static pressure and pushes thermal limits',
      'Zero Frozr automatically stops fans in low-load situations',
      'Custom PCB design provided with hardened traces and integrated fuse protection',
      'DisplayPort x 3 (v1.4a) / HDMI 2.1 x 1'
    ],
    description: 'Ventus brings a performance-focused design that maintains the essentials to accomplish any task at hand.',
    images: [
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop'
    ],
    packageContents: ['MSI RTX 3060 Ventus 2X GPU', 'Quick User Guide'],
    specifications: {
      general: { modelNumber: 'RTX 3060 Ventus 2X 12G OC', countryOfOrigin: 'China', color: 'Black / Silver' },
      electrical: { voltage: '1x 8-pin Power', wattage: '550W PSU Recommended' },
      physical: { weight: '646g', dimensions: '23.5 x 12.4 x 4.2 cm', displaySize: 'Dual Slot' },
      warranty: { duration: '3 Years MSI Warranty', coverage: '3 Year brand hardware warranty' },
      technical: { gpu: 'NVIDIA GeForce RTX 3060', memory: '12GB GDDR6', interface: 'PCI Express Gen 4' }
    },
    ratings: { average: 4.7, count: 110 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-KINGSTON-EXODIA-64GB',
    name: 'Kingston DataTraveler Exodia 64GB USB 3.2 Flash Drive',
    category: 'Storage',
    brand: 'Kingston',
    price: 900,
    discountPrice: 499,
    stock: 60,
    sku: 'KNG-EXODIA-64GB',
    status: 'Active',
    badges: ['USB 3.2 Gen 1', 'Key Ring Loop'],
    features: [
      'USB 3.2 Gen 1 performance for easy access to laptops, desktop PCs, monitors and other digital devices',
      'Quick transfers and convenient storage of documents, music, videos and more',
      'Practical cap protects the USB plug',
      'Large colorful loop attaches easily to key rings'
    ],
    description: 'Kingston DataTraveler Exodia features USB 3.2 Gen 1 performance for quick and convenient storage for documents, music, and videos.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Kingston 64GB USB Flash Drive'],
    specifications: {
      general: { modelNumber: 'DTX/64GB', countryOfOrigin: 'Taiwan', color: 'Black / White Ring' },
      electrical: { voltage: '5V USB', wattage: 'N/A' },
      physical: { weight: '11g', dimensions: '67.3 x 21.0 x 10.1 mm', displaySize: 'N/A' },
      warranty: { duration: '5 Years Kingston Warranty', coverage: '5 Year brand warranty' },
      technical: { interface: 'USB 3.2 Gen 1', capacity: '64 GB' }
    },
    ratings: { average: 4.5, count: 680 },
    deliveryAvailable: true
  },

  // ── 10. NETWORKING & SMART HOME (8) ──────────────────────────────────────
  {
    productId: 'PRD-TPLINK-AX72-AX5400',
    name: 'TP-Link Archer AX72 AX5400 Dual-Band Gigabit Wi-Fi 6 Router',
    category: 'Routers',
    brand: 'TP-Link',
    price: 13999,
    discountPrice: 8999,
    stock: 15,
    sku: 'TPLINK-AX72-AX5400',
    status: 'Active',
    badges: ['Wi-Fi 6', '5400 Mbps Speed', '6 External Antennas'],
    features: [
      'Gigabit Wi-Fi 6 Speed: 4804 Mbps on 5GHz + 574 Mbps on 2.4GHz',
      '6 High-Gain Antennas with Beamforming for extensive home coverage',
      'OFDMA and MU-MIMO Technology to connect 100+ devices simultaneously',
      'TP-Link HomeShield Security protects network against cyber threats',
      'USB 3.0 Port for easy media sharing & private cloud creation'
    ],
    description: 'Upgrade your home network with TP-Link Archer AX72. Delivers blazing-fast Wi-Fi 6 speeds up to 5.4 Gbps for 8K streaming and lag-free gaming.',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Wi-Fi Router Archer AX72', 'Power Adapter', 'RJ45 Ethernet Cable', 'Quick Installation Guide'],
    specifications: {
      general: { modelNumber: 'Archer AX72', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '12V / 2.5A', wattage: '30W' },
      physical: { weight: '660g', dimensions: '27.2 x 14.7 x 4.9 cm', displaySize: 'N/A' },
      warranty: { duration: '3 Years TP-Link Warranty', coverage: '3 Year brand warranty' },
      technical: { wirelessStandard: 'Wi-Fi 6 (802.11ax)', ports: '1x Gigabit WAN, 4x Gigabit LAN, 1x USB 3.0' }
    },
    ratings: { average: 4.7, count: 105 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-NETGEAR-RAX40-AX3000',
    name: 'Netgear Nighthawk RAX40 Wi-Fi 6 AX3000 Router',
    category: 'Routers',
    brand: 'TP-Link',
    price: 17499,
    discountPrice: 11999,
    stock: 9,
    sku: 'NET-RAX40-AX3000',
    status: 'Active',
    badges: ['Nighthawk Speed', 'Dual-Core CPU'],
    features: [
      '4-Stream Wi-Fi 6 with up to 3Gbps Speed (600Mbps + 2400Mbps)',
      'Dual-Core Processor engineered to handle 4K UHD streaming & gaming',
      'OFDMA Technology enables efficient data transmission to up to 16 devices at once',
      'High-Power Antennas for extended range coverage',
      'Nighthawk App for easy 5-minute setup and parental controls'
    ],
    description: 'Netgear Nighthawk RAX40 Wi-Fi 6 Router delivers smooth 4K UHD streaming and gaming performance with up to 3Gbps wireless speeds.',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Nighthawk RAX40 Router', 'Ethernet Cable', 'Power Adapter', 'Quick Start Guide'],
    specifications: {
      general: { modelNumber: 'RAX40-100EUS', countryOfOrigin: 'Vietnam', color: 'Black' },
      electrical: { voltage: '12V / 2.5A', wattage: '30W' },
      physical: { weight: '600g', dimensions: '34.0 x 20.6 x 5.7 cm', displaySize: 'N/A' },
      warranty: { duration: '2 Years Netgear Warranty', coverage: 'Netgear brand warranty' },
      technical: { wirelessStandard: 'Wi-Fi 6 (802.11ax)', ports: '4x Gigabit LAN, 1x Gigabit WAN, 1x USB 3.0' }
    },
    ratings: { average: 4.5, count: 62 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-TPLINK-DECOM4-3PACK',
    name: 'TP-Link Deco M4 AC1200 Whole Home Mesh Wi-Fi System (3-Pack)',
    category: 'Routers',
    brand: 'TP-Link',
    price: 13999,
    discountPrice: 9499,
    stock: 14,
    sku: 'TPLINK-DECO-M4-3P',
    status: 'Active',
    badges: ['Whole Home Mesh', 'Covers up to 5500 Sq Ft'],
    features: [
      'Deco M4 3-Pack delivers seamless Mesh Wi-Fi coverage up to 5,500 sq ft',
      'Eliminates Wi-Fi dead zones completely with seamless roaming',
      'Connects up to 100 devices without lag',
      'AC1200 Dual-Band Speeds (300Mbps on 2.4GHz + 867Mbps on 5GHz)',
      'Deco App guides step-by-step setup in minutes'
    ],
    description: 'Deco M4 uses a system of units to achieve seamless whole-home Wi-Fi coverage — eliminate weak signal areas once and for all.',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop'
    ],
    packageContents: ['3x Deco M4 Units', '3x Power Adapters', '1x RJ45 Ethernet Cable'],
    specifications: {
      general: { modelNumber: 'Deco M4 (3-pack)', countryOfOrigin: 'China', color: 'White' },
      electrical: { voltage: '12V / 1.2A', wattage: '14.4W per unit' },
      physical: { weight: '880g (Total)', dimensions: '9.0 x 9.0 x 19.0 cm per tower', displaySize: 'N/A' },
      warranty: { duration: '3 Years TP-Link Warranty', coverage: '3 Year brand warranty' },
      technical: { wirelessStandard: 'AC1200 Dual Band', ports: '2x Gigabit Ports per unit' }
    },
    ratings: { average: 4.7, count: 310 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-WIPRO-16A-SMARTPLUG',
    name: 'Wipro 16A Smart Plug with Energy Monitoring',
    category: 'Smart Home',
    brand: 'Wipro',
    price: 2290,
    discountPrice: 999,
    stock: 45,
    sku: 'WIPRO-16A-PLUG',
    status: 'Active',
    badges: ['16A Heavy Duty', 'Energy Meter', 'Alexa & Google Assistant'],
    features: [
      'Suitable for Heavy Appliances: Geysers, ACs, Microwaves, Pumps (up to 16A / 3680W)',
      'Energy Consumption Monitoring via Wipro Next Smart App',
      'Voice Control with Amazon Alexa and Google Assistant',
      'Timer & Schedule automation for automatic turn off',
      'No hub required — connects directly to home 2.4GHz Wi-Fi'
    ],
    description: 'Control heavy appliances remotely and track electricity consumption with Wipro 16A Smart Plug.',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Wipro 16A Smart Plug', 'User Manual'],
    specifications: {
      general: { modelNumber: 'DS16000', countryOfOrigin: 'India', color: 'White' },
      electrical: { voltage: '220-240V', wattage: '3680W (16A)' },
      physical: { weight: '110g', dimensions: '6.0 x 6.0 x 5.0 cm', displaySize: 'N/A' },
      warranty: { duration: '1 Year Wipro Warranty', coverage: 'Brand warranty' },
      technical: { wireless: 'Wi-Fi 2.4GHz', app: 'Wipro Next Smart Home App' }
    },
    ratings: { average: 4.5, count: 480 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-AMAZON-ECHODOT5-BLK',
    name: 'Amazon Echo Dot (5th Gen) Smart Speaker with Alexa - Black',
    category: 'Smart Home',
    brand: 'Apple',
    price: 5499,
    discountPrice: 4499,
    stock: 30,
    sku: 'AMZN-ECHODOT5-BLK',
    status: 'Active',
    badges: ['5th Gen', 'Deeper Bass', 'Inbuilt Temperature Sensor'],
    features: [
      'Best sounding Echo Dot yet with clearer vocals & deeper bass',
      'Ask Alexa to play music, check news, set alarms, and answer questions in Hindi & English',
      'Control smart appliances with voice or automated routines',
      'Built-in motion detection & room temperature sensor',
      'Privacy controls including Microphone Off button'
    ],
    description: 'Echo Dot (5th Gen) delivers vibrant sound in a compact design. Pair with Alexa to streamline your day with smart voice assistance.',
    images: [
      'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Echo Dot 5th Gen', '15W Power Adapter', 'Quick Start Guide'],
    specifications: {
      general: { modelNumber: 'C2N6L4', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '15V DC', wattage: '15W' },
      physical: { weight: '304g', dimensions: '10.0 x 10.0 x 8.9 cm', displaySize: 'N/A' },
      warranty: { duration: '1 Year Amazon Warranty', coverage: '1 Year limited warranty' },
      technical: { bluetoothVersion: '5.0', audio: '1.73 inch front-firing speaker' }
    },
    ratings: { average: 4.6, count: 720 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-XIAOMI-AIRPURIFIER4',
    name: 'Xiaomi Smart Air Purifier 4 with True HEPA Filter',
    category: 'Smart Home',
    brand: 'Xiaomi',
    price: 19999,
    discountPrice: 14999,
    stock: 11,
    sku: 'XMI-AIRPUR-4',
    status: 'Active',
    badges: ['CADR 400m³/h', 'OLED Touch Screen', 'Alexa / Google Assistant'],
    features: [
      'Clean Air Delivery Rate (CADR) of up to 400m³/h — purifies a 20m² room in 10 mins',
      '3-in-1 Filter capturing 99.97% of 0.3μm particles including dust, pollen & dander',
      'Negative Air Ionization for fresh forest-clean air quality',
      'OLED Touch Display showing real-time PM2.5, temperature, and humidity',
      'Quiet 32.1dB Low Noise Night Mode & Smart App Control'
    ],
    description: 'Breath clean, healthy air every day with Xiaomi Smart Air Purifier 4 featuring high-precision laser sensors and true HEPA filtration.',
    images: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Xiaomi Air Purifier 4', 'Pre-installed Filter', 'Power Cable', 'User Manual'],
    specifications: {
      general: { modelNumber: 'AC-M16-SC', countryOfOrigin: 'China', color: 'White' },
      electrical: { voltage: '100-240V', wattage: '30W' },
      physical: { weight: '5.6 kg', dimensions: '25.0 x 25.0 x 55.5 cm', displaySize: 'N/A' },
      warranty: { duration: '1 Year Xiaomi Warranty', coverage: 'Brand warranty' },
      technical: { filterType: 'True HEPA (Filter 4)', coverageArea: 'Up to 516 sq ft' }
    },
    ratings: { average: 4.7, count: 95 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-PHILIPS-WIZ-12W-DOWNLIGHT',
    name: 'Philips Wiz Smart Wi-Fi LED Downlight 12W',
    category: 'Smart Home',
    brand: 'Wipro',
    price: 1499,
    discountPrice: 799,
    stock: 40,
    sku: 'PHIL-WIZ-12W-DL',
    status: 'Active',
    badges: ['16M Colors', 'Wiz App Connected'],
    features: [
      '16 Million Colors + Warm to Cool White Light tuning (2700K - 6500K)',
      'Connects directly to home Wi-Fi via Wiz Connected App',
      'Voice control compatible with Alexa, Google Assistant & Siri Shortcuts',
      'SpaceSense motion sensing technology turns light on/off automatically',
      'Energy efficient 12W output producing 900 Lumens brightness'
    ],
    description: 'Transform your home lighting ambiance with Philips Wiz 12W Smart Downlight. Enjoy 16 million colors and automated circadian rhythm routines.',
    images: [
      'https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Philips Wiz 12W Downlight', 'User Leaflet'],
    specifications: {
      general: { modelNumber: 'Wiz DL 12W', countryOfOrigin: 'India', color: 'White Rim / RGB' },
      electrical: { voltage: '220-240V', wattage: '12W' },
      physical: { weight: '180g', dimensions: '14.0 x 14.0 x 4.5 cm (Cutout 120mm)', displaySize: 'N/A' },
      warranty: { duration: '2 Years Philips Warranty', coverage: '2 Year brand replacement warranty' },
      technical: { wireless: 'Wi-Fi 2.4GHz + Bluetooth', brightness: '900 Lumens' }
    },
    ratings: { average: 4.5, count: 210 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-TPLINK-TAPOP115-16A',
    name: 'TP-Link Tapo P115 Mini Smart Wi-Fi Plug 16A',
    category: 'Smart Home',
    brand: 'TP-Link',
    price: 2499,
    discountPrice: 1299,
    stock: 25,
    sku: 'TPLINK-P115-16A',
    status: 'Active',
    badges: ['Compact Design', 'Energy Monitoring', 'Flame-Retardant'],
    features: [
      'Compact mini size design to avoid blocking adjacent sockets',
      'Energy Monitoring tracks real-time power consumption in Tapo App',
      'Supports appliances up to 16A / 3680W',
      'Schedule & Timer presets for auto-managing devices',
      'Away Mode turns devices on and off at different times to simulate presence'
    ],
    description: 'TP-Link Tapo P115 is a compact 16A smart plug with real-time energy monitoring and voice control integration.',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Tapo P115 Smart Plug', 'Quick Start Guide'],
    specifications: {
      general: { modelNumber: 'Tapo P115', countryOfOrigin: 'China', color: 'White' },
      electrical: { voltage: '220-240V', wattage: '3680W' },
      physical: { weight: '95g', dimensions: '7.2 x 5.1 x 4.0 cm', displaySize: 'N/A' },
      warranty: { duration: '2 Years TP-Link Warranty', coverage: '2 Year warranty' },
      technical: { wireless: 'Wi-Fi 2.4GHz', app: 'TP-Link Tapo App' }
    },
    ratings: { average: 4.6, count: 140 },
    deliveryAvailable: true
  },

  // ── 11. POWER & CHARGING (8) ─────────────────────────────────────────────
  {
    productId: 'PRD-ANKER-737-140W',
    name: 'Anker 737 Power Bank (PowerCore 24K) 140W Output',
    category: 'Power Banks',
    brand: 'Anker',
    price: 18999,
    discountPrice: 13999,
    stock: 12,
    sku: 'ANK-737-24K-140W',
    status: 'Active',
    badges: ['140W Two-Way Fast Charge', 'Smart Digital Display'],
    features: [
      'Ultra-Powerful 140W Two-Way Fast Charging output (Power Delivery 3.1)',
      '24,000 mAh High Capacity charges an iPhone 13 nearly 5 times or MacBook Pro 16" to 50% in 40 mins',
      'Smart Digital Display shows output & input power, battery percentage, and remaining charge time',
      '2x USB-C ports + 1x USB-A port for 3-device simultaneous fast charging',
      'ActiveShield 2.0 Real-Time Temperature Monitoring'
    ],
    description: 'Equipped with the latest Power Delivery 3.1 technology, Anker 737 Power Bank delivers an immense 140W output to fast charge laptops and phones.',
    images: [
      'https://images.unsplash.com/photo-1609592424009-5996dd9edbad?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Anker 737 Power Bank', '140W USB-C to USB-C Cable (0.6m)', 'Welcome Guide'],
    specifications: {
      general: { modelNumber: 'A1289', countryOfOrigin: 'China', color: 'Black' },
      electrical: { batteryCapacity: '24000 mAh', chargingSpeed: '140W PD 3.1 Input/Output', voltage: '20V' },
      physical: { weight: '630g', dimensions: '15.58 x 5.46 x 4.95 cm', displaySize: 'OLED Display' },
      warranty: { duration: '18 Months Anker Warranty', coverage: 'Anker official 18-month warranty' },
      technical: { outputPorts: '2x USB-C, 1x USB-A' }
    },
    ratings: { average: 4.9, count: 185 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-MI-20000MAH-3I',
    name: 'Mi 20000mAh 18W Fast Charging Power Bank 3i - Black',
    category: 'Power Banks',
    brand: 'Xiaomi',
    price: 3199,
    discountPrice: 2149,
    stock: 35,
    sku: 'XMI-PB-20K-3I',
    status: 'Active',
    badges: ['Triple Output', 'Dual Input', '18W Fast Charge'],
    features: [
      '20000 mAh High Capacity Lithium Polymer battery density',
      '18W Fast Charging output for quick power boost',
      'Triple Output Ports (2x USB-A + 1x Type-C)',
      'Dual Input options (Type-C + Micro USB)',
      'Smart 12-Layer Circuit Protection against short circuit & overvoltage'
    ],
    description: 'Keep all your gadgets powered with Mi 20000mAh Power Bank 3i featuring 18W fast charging and triple output ports.',
    images: [
      'https://images.unsplash.com/photo-1609592424009-5996dd9edbad?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Mi Power Bank 3i 20000mAh', 'Micro-USB Cable', 'User Manual'],
    specifications: {
      general: { modelNumber: 'VXN4318IN', countryOfOrigin: 'India', color: 'Black' },
      electrical: { batteryCapacity: '20000 mAh', chargingSpeed: '18W Fast Charge', voltage: '5V / 9V / 12V' },
      physical: { weight: '435g', dimensions: '15.06 x 7.22 x 2.63 cm', displaySize: 'N/A' },
      warranty: { duration: '6 Months Xiaomi Warranty', coverage: '6 Month brand warranty' },
      technical: { outputPorts: '2x USB-A, 1x Type-C' }
    },
    ratings: { average: 4.6, count: 850 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-AMBRANE-10000MAH-22W',
    name: 'Ambrane 10000mAh Power Bank with 22.5W Fast Charging',
    category: 'Power Banks',
    brand: 'Anker',
    price: 2499,
    discountPrice: 999,
    stock: 40,
    sku: 'AMB-PB-10K-22W',
    status: 'Active',
    badges: ['Made in India', 'Compact Metal Body'],
    features: [
      '22.5W Ultra-Fast Charging output supporting Power Delivery & Quick Charge 3.0',
      'Ultra Compact Metallic Finish Pocket-sized design',
      'Dual Output: 1x Type-C (PD) + 1x USB-A',
      'Multi-layer chipset protection for safe charging'
    ],
    description: 'Ambrane 10000mAh Stylo-10k Power Bank provides 22.5W fast charging output in an ultra-sleek metallic body.',
    images: [
      'https://images.unsplash.com/photo-1609592424009-5996dd9edbad?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Ambrane Power Bank 10000mAh', 'Charging Cable', 'User Manual'],
    specifications: {
      general: { modelNumber: 'Stylo 10k', countryOfOrigin: 'India', color: 'Metallic Black' },
      electrical: { batteryCapacity: '10000 mAh', chargingSpeed: '22.5W Fast Charge', voltage: '5V/9V/12V' },
      physical: { weight: '210g', dimensions: '13.5 x 6.8 x 1.6 cm', displaySize: 'N/A' },
      warranty: { duration: '180 Days Ambrane Warranty', coverage: 'Brand warranty' },
      technical: { outputPorts: '1x Type-C, 1x USB-A' }
    },
    ratings: { average: 4.4, count: 420 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-APPLE-20W-ADAPTER',
    name: 'Apple 20W USB-C Power Adapter',
    category: 'Chargers',
    brand: 'Apple',
    price: 1900,
    discountPrice: 1690,
    stock: 50,
    sku: 'AAPL-20W-ADAPTER',
    status: 'Active',
    badges: ['Official Apple Accessory', 'Fast Charging'],
    features: [
      'Fast and efficient charging at home, in the office, or on the go',
      'Compatible with any USB-C enabled device',
      'Pairs with iPhone 8 or later for fast charging (50% charge in ~30 minutes)',
      'Compact lightweight travel plug design'
    ],
    description: 'The Apple 20W USB-C Power Adapter offers fast, efficient charging. While compatible with any USB-C device, Apple recommends pairing it with iPhone and iPad Pro.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Apple 20W USB-C Power Adapter', 'User Manual'],
    specifications: {
      general: { modelNumber: 'MHJE3HN/A', countryOfOrigin: 'India / China', color: 'White' },
      electrical: { voltage: '100-240V', wattage: '20W Power Delivery' },
      physical: { weight: '80g', dimensions: '6.7 x 6.7 x 3.3 cm', displaySize: 'N/A' },
      warranty: { duration: '1 Year Apple Warranty', coverage: 'Official Apple brand warranty' },
      technical: { outputPort: 'USB-C (Power Delivery)' }
    },
    ratings: { average: 4.8, count: 650 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SAMSUNG-25W-ADAPTER',
    name: 'Samsung 25W USB-C Fast Charging Adapter',
    category: 'Chargers',
    brand: 'Samsung',
    price: 1699,
    discountPrice: 1299,
    stock: 45,
    sku: 'SAM-25W-ADAPTER',
    status: 'Active',
    badges: ['Super Fast Charging', 'USB PD 3.0 PPS'],
    features: [
      'Super Fast Charging 25W with Power Delivery (PD) 3.0 PPS',
      'Optimized charging speed for Galaxy S, A, and M series smartphones',
      'Energy-efficient zero standby power consumption under 5mW',
      'Compact & lightweight travel design'
    ],
    description: 'Give your devices the powerful charging support they deserve with Samsung 25W Super Fast Wall Charger using Power Delivery 3.0.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Samsung 25W Adapter', 'Quick Start Guide'],
    specifications: {
      general: { modelNumber: 'EP-T2510NBEGGB', countryOfOrigin: 'India', color: 'Black' },
      electrical: { voltage: '100-240V', wattage: '25W Max' },
      physical: { weight: '50g', dimensions: '38.0 x 22.0 x 66.9 mm', displaySize: 'N/A' },
      warranty: { duration: '6 Months Samsung Warranty', coverage: 'Official brand warranty' },
      technical: { outputPort: 'USB Type-C (PD 3.0 PPS)' }
    },
    ratings: { average: 4.7, count: 510 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ANKER-65W-GAN-CHARGER',
    name: 'Anker 65W GaN Fast Charger (3-Port)',
    category: 'Chargers',
    brand: 'Anker',
    price: 4999,
    discountPrice: 3699,
    stock: 20,
    sku: 'ANK-65W-GAN-3P',
    status: 'Active',
    badges: ['GaN II Tech', 'Fast Charge 3 Devices'],
    features: [
      '65W High-Speed Output charges a MacBook Pro 13" at full speed',
      'GaN II Technology provides 58% smaller footprint with improved heat dissipation',
      '3-in-1 Charging: 2x USB-C ports + 1x USB-A port',
      'PowerIQ 3.0 dynamic power allocation between connected devices'
    ],
    description: 'Powered by GaN II technology, Anker 735 Charger (Nano II 65W) lets you fast charge your phone, tablet, and USB-C notebook all at once.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Anker 735 65W Charger', 'Welcome Guide'],
    specifications: {
      general: { modelNumber: 'A2667', countryOfOrigin: 'China', color: 'Black' },
      electrical: { voltage: '100-240V', wattage: '65W Max' },
      physical: { weight: '130g', dimensions: '38.2 x 29.1 x 66.1 mm', displaySize: 'N/A' },
      warranty: { duration: '18 Months Anker Warranty', coverage: 'Anker 18-month warranty' },
      technical: { outputPorts: '2x USB-C, 1x USB-A' }
    },
    ratings: { average: 4.8, count: 140 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-BOAT-DEUCE300-CABLE',
    name: 'boAt Deuce USB 300 2-in-1 Type-C and Micro USB Cable (1.5m)',
    category: 'USB Cables',
    brand: 'boAt',
    price: 999,
    discountPrice: 349,
    stock: 60,
    sku: 'BOAT-DEUCE-300-1.5M',
    status: 'Active',
    badges: ['2-in-1 Cable', 'Nylon Braided', '3A Fast Charge'],
    features: [
      '2-in-1 Dual Connector: Type-C + Micro USB adapter cap',
      '3A Fast Charging and 480Mbps Data Transfer speed',
      'Tough Nylon Braided Jacket with 10,000+ Bend Lifespan',
      '1.5-Meter Length for convenient bed or desk charging'
    ],
    description: 'boAt Deuce USB 300 2-in-1 cable seamlessly connects both Type-C and Micro-USB devices using a single durable braided cable.',
    images: [
      'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=800&auto=format&fit=crop'
    ],
    packageContents: ['boAt Deuce USB 300 1.5m Cable'],
    specifications: {
      general: { modelNumber: 'Deuce 300', countryOfOrigin: 'China', color: 'Black Metal' },
      electrical: { current: '3A Max', voltage: '5V-12V' },
      physical: { weight: '45g', dimensions: '1.5 Meters Length', displaySize: 'N/A' },
      warranty: { duration: '2 Years boAt Warranty', coverage: '2 Year brand replacement warranty' },
      technical: { cableType: 'Nylon Braided 2-in-1', speed: '480 Mbps' }
    },
    ratings: { average: 4.5, count: 480 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-BELKIN-BOOSTCHARGE-C2C-2M',
    name: 'Belkin BoostCharge Braided USB-C to USB-C Cable (2m)',
    category: 'USB Cables',
    brand: 'Anker',
    price: 1999,
    discountPrice: 1199,
    stock: 35,
    sku: 'BLK-BC-C2C-2M',
    status: 'Active',
    badges: ['100W PD Compatible', 'Double Braided'],
    features: [
      'Supports Fast Charging up to 100W Power Delivery (20V/5A)',
      'Double-braided exterior tested to survive 25,000+ bends',
      'USB-IF Certified to ensure safe and reliable charging',
      '2-Meter (6.6ft) extra long cable length'
    ],
    description: 'Charge your USB-C smartphones, tablets, and laptops up to 100W with Belkin BoostCharge ultra-durable double-braided USB-C cable.',
    images: [
      'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Belkin BoostCharge USB-C to USB-C Cable 2m'],
    specifications: {
      general: { modelNumber: 'CAB003bt2MBK', countryOfOrigin: 'Vietnam', color: 'Black' },
      electrical: { current: '5A / 100W', voltage: '20V' },
      physical: { weight: '60g', dimensions: '2.0 Meters Length', displaySize: 'N/A' },
      warranty: { duration: '2 Years Belkin Warranty', coverage: '2 Year manufacturer warranty' },
      technical: { cableType: 'Double-braided Nylon', speed: '480 Mbps' }
    },
    ratings: { average: 4.7, count: 125 },
    deliveryAvailable: true
  },
  // ── 16. ADDITIONAL REAL ELECTRONICS (12) ──────────────────────────────────
  {
    productId: 'PRD-PIXEL8PRO-128',
    name: 'Google Pixel 8 Pro (128GB) - Obsidian',
    category: 'Smartphones',
    brand: 'Google',
    price: 106999,
    discountPrice: 93999,
    stock: 15,
    sku: 'GOOG-PX8P-128-OBS',
    status: 'Active',
    badges: ['Google Tensor G3', 'Best AI Camera'],
    features: [
      '6.7-inch Super Actua LTPO OLED Display, 1-120Hz',
      'Google Tensor G3 Chip with Titan M2 Security Coprocessor',
      '50MP Main + 48MP Ultra Wide + 48MP 5x Telephoto Camera',
      'Best Take, Magic Eraser, Audio Magic Eraser AI Editing',
      '7 Years of OS and Security Updates'
    ],
    description: 'Pixel 8 Pro is engineered by Google with Tensor G3 and advanced AI for stunning photos, videos, and all-day battery efficiency.',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Google Pixel 8 Pro', '1m USB-C to USB-C Cable', 'Quick Switch Adapter', 'SIM Tool'],
    specifications: {
      general: { modelNumber: 'GC3VE', countryOfOrigin: 'Vietnam', color: 'Obsidian' },
      electrical: { batteryCapacity: '5050 mAh', chargingSpeed: '30W Fast Charge, 23W Wireless', voltage: '5V' },
      physical: { weight: '213g', dimensions: '162.6 x 76.5 x 8.8 mm', displaySize: '6.7 Inches' },
      warranty: { duration: '1 Year Brand Warranty', coverage: 'Google 1 year limited warranty' },
      technical: { processor: 'Google Tensor G3', ram: '12 GB', storage: '128 GB', operatingSystem: 'Android 14', camera: '50MP + 48MP + 48MP' }
    },
    ratings: { average: 4.6, count: 85 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-IQOO12-256',
    name: 'iQOO 12 5G (256GB) - Alpha Black',
    category: 'Smartphones',
    brand: 'iQOO',
    price: 59999,
    discountPrice: 52999,
    stock: 18,
    sku: 'IQOO-12-256-BLK',
    status: 'Active',
    badges: ['Snapdragon 8 Gen 3', '120W FlashCharge'],
    features: [
      '6.78-inch 144Hz LTPO AMOLED Display',
      'Snapdragon 8 Gen 3 Processor with Supercomputing Chip Q1',
      '50MP Main + 50MP Ultrawide + 64MP 3x Periscope Telephoto Camera',
      '120W FlashCharge charges up to 100% in 27 minutes',
      '6K Vapor Chamber Cooling System'
    ],
    description: 'iQOO 12 5G brings unmatched gaming performance, high frame rates, and flagship telephoto camera capabilities.',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop'
    ],
    packageContents: ['iQOO 12', '120W FlashCharge Adapter', 'Type-C Cable', 'Protective Case', 'SIM Eject Tool'],
    specifications: {
      general: { modelNumber: 'I2220', countryOfOrigin: 'India', color: 'Alpha Black' },
      electrical: { batteryCapacity: '5000 mAh', chargingSpeed: '120W FlashCharge', voltage: '5V' },
      physical: { weight: '203g', dimensions: '163.2 x 75.9 x 8.1 mm', displaySize: '6.78 Inches' },
      warranty: { duration: '1 Year Brand Warranty', coverage: 'Brand warranty for phone and charger' },
      technical: { processor: 'Snapdragon 8 Gen 3', ram: '12 GB', storage: '256 GB', operatingSystem: 'Funtouch OS 14 (Android 14)', camera: '50MP + 50MP + 64MP' }
    },
    ratings: { average: 4.7, count: 72 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ACER-PRED-HEL16',
    name: 'Acer Predator Helios 16 Gaming Laptop (Intel i7 14th Gen / RTX 4060 / 16GB / 1TB SSD)',
    category: 'Laptops',
    brand: 'Acer',
    price: 149999,
    discountPrice: 134999,
    stock: 8,
    sku: 'ACER-HEL16-I7-4060',
    status: 'Active',
    badges: ['RTX 4060', '165Hz WQXGA', '5th Gen Aeroblade'],
    features: [
      'Intel Core i7-14700HX 20-Core Processor',
      'NVIDIA GeForce RTX 4060 8GB GDDR6 VRAM (140W MGP)',
      '16-inch WQXGA (2560x1600) 165Hz IPS Display, 100% sRGB',
      '16GB DDR5 RAM (Expandable to 32GB) + 1TB Gen4 NVMe SSD',
      'Per-key RGB Backlit Keyboard with PredatorSense software'
    ],
    description: 'Dominate games and heavy workloads with the Acer Predator Helios 16 gaming laptop powered by 14th Gen Intel i7 and RTX 4060 graphics.',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Acer Predator Helios 16', '330W Power Adapter', 'User Manual', 'Warranty Card'],
    specifications: {
      general: { modelNumber: 'PH16-72', countryOfOrigin: 'China', color: 'Abyssal Black' },
      electrical: { voltage: '100-240V', batteryCapacity: '90 Whr' },
      physical: { weight: '2.6 kg', dimensions: '357.8 x 278.6 x 26.9 mm', displaySize: '16 Inches' },
      warranty: { duration: '1 Year Onsite Warranty', coverage: '1 year Acer international travelers warranty' },
      technical: { processor: 'Intel Core i7-14700HX', ram: '16 GB DDR5', storage: '1 TB PCIe Gen4 SSD', operatingSystem: 'Windows 11 Home', graphics: 'NVIDIA RTX 4060 8GB' }
    },
    ratings: { average: 4.7, count: 48 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-ASUS-ZENBOOK-14',
    name: 'ASUS Zenbook 14 OLED (Intel Core Ultra 7 / 16GB / 1TB SSD) - Ponder Blue',
    category: 'Laptops',
    brand: 'ASUS',
    price: 114999,
    discountPrice: 99999,
    stock: 12,
    sku: 'ASUS-UX3405-CU7-1TB',
    status: 'Active',
    badges: ['3K 120Hz OLED', 'Intel AI Boost', 'Ultra Slim'],
    features: [
      'Intel Core Ultra 7 155H Processor with Neural Processing Unit (NPU)',
      '14-inch 3K (2880x1800) 120Hz Lumina OLED Touchscreen Display',
      '16GB LPDDR5X RAM + 1TB PCIe 4.0 NVMe M.2 SSD',
      'Intel Arc Graphics for smooth creative performance',
      '1.2 kg Ultra lightweight with 75Wh battery life up to 15 hours'
    ],
    description: 'ASUS Zenbook 14 OLED elevates your mobility with AI-driven Intel Core Ultra performance, breathtaking 3K OLED visuals, and all-day battery endurance.',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop'
    ],
    packageContents: ['ASUS Zenbook 14 OLED', '65W USB-C Power Adapter', 'Sleeve', 'User Manual'],
    specifications: {
      general: { modelNumber: 'UX3405MA-QD741WS', countryOfOrigin: 'China', color: 'Ponder Blue' },
      electrical: { voltage: '100-240V', batteryCapacity: '75 Whr' },
      physical: { weight: '1.2 kg', dimensions: '312.4 x 220.1 x 14.9 mm', displaySize: '14 Inches' },
      warranty: { duration: '1 Year International Warranty', coverage: '1 year ASUS global warranty' },
      technical: { processor: 'Intel Core Ultra 7 155H', ram: '16 GB LPDDR5X', storage: '1 TB SSD', operatingSystem: 'Windows 11 Home', graphics: 'Intel Arc Graphics' }
    },
    ratings: { average: 4.8, count: 35 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SAMSUNG-TAB-A9',
    name: 'Samsung Galaxy Tab A9+ 11" (64GB WiFi) - Graphite',
    category: 'Tablets',
    brand: 'Samsung',
    price: 20999,
    discountPrice: 16999,
    stock: 24,
    sku: 'SAM-TABA9P-64-GR',
    status: 'Active',
    badges: ['90Hz 11" Screen', 'Quad Speakers', 'DeX Support'],
    features: [
      '11.0-inch LCD Display with 90Hz Refresh Rate',
      'Qualcomm Snapdragon 695 Octa-Core Processor',
      '4GB RAM + 64GB Internal Storage (Expandable up to 1TB via microSD)',
      'Quad Speakers with Dolby Atmos Sound',
      'Samsung DeX windowed multitasking mode'
    ],
    description: 'Galaxy Tab A9+ gives you immersive 90Hz visuals, quad-speaker audio, and powerful multitasking designed for everyday entertainment and study.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Galaxy Tab A9+', 'USB-C Cable', 'Ejection Pin', 'Quick Start Guide'],
    specifications: {
      general: { modelNumber: 'SM-X210NZAAINS', countryOfOrigin: 'India', color: 'Graphite' },
      electrical: { batteryCapacity: '7040 mAh', chargingSpeed: '15W Fast Charge' },
      physical: { weight: '480g', dimensions: '257.1 x 168.7 x 6.9 mm', displaySize: '11 Inches' },
      warranty: { duration: '1 Year Brand Warranty', coverage: '1 year Samsung warranty' },
      technical: { processor: 'Snapdragon 695', ram: '4 GB', storage: '64 GB', operatingSystem: 'Android 13 (One UI 5.1.1)' }
    },
    ratings: { average: 4.5, count: 90 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-LG-OLEDEVO-65',
    name: 'LG OLED evo C4 Series 65" 4K Smart TV',
    category: 'TVs',
    brand: 'LG',
    price: 219990,
    discountPrice: 189990,
    stock: 5,
    sku: 'LG-OLED65C4-4K',
    status: 'Active',
    badges: ['OLED evo', '144Hz Gaming', 'alpha 9 AI Gen7'],
    features: [
      '65-inch Self-lit OLED evo 4K Panel with Brightness Booster',
      'alpha 9 AI Processor 4K Gen7 with AI Super Upscaling',
      'NVIDIA G-Sync, AMD FreeSync Premium & 144Hz Refresh Rate for Gaming',
      'Dolby Vision & Dolby Atmos with 40W 2.2 Channel Speakers',
      'webOS 24 with Magic Remote and 5 Years webOS Upgrades'
    ],
    description: 'LG OLED evo C4 TV combines vibrant brightness, deep blacks, 144Hz high refresh rate gaming, and next-gen AI processing in a slim minimalist bezel.',
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop'
    ],
    packageContents: ['65" LG OLED C4 TV', 'Magic Remote Control', 'TV Stand Legs', 'Power Cord', 'User Manual'],
    specifications: {
      general: { modelNumber: 'OLED65C4PSA', countryOfOrigin: 'India', color: 'Dark Steel Silver' },
      electrical: { voltage: '100-240V', powerConsumption: '130W' },
      physical: { weight: '16.6 kg', dimensions: '1441 x 826 x 45.1 mm', displaySize: '65 Inches' },
      warranty: { duration: '3 Years LG Panel Warranty', coverage: '3 years panel & 1 year comprehensive warranty' },
      technical: { resolution: '3840 x 2160 (4K)', refreshRate: '144Hz', operatingSystem: 'webOS 24', audioOutput: '40 Watts' }
    },
    ratings: { average: 4.9, count: 32 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-AUDIO-TECHNICA-M50X',
    name: 'Audio-Technica ATH-M50x Professional Studio Monitor Headphones',
    category: 'Headphones',
    brand: 'Audio-Technica',
    price: 17500,
    discountPrice: 13490,
    stock: 14,
    sku: 'AT-M50X-BLK',
    status: 'Active',
    badges: ['Studio Standard', '45mm Drivers', 'Detachable Cables'],
    features: [
      'Critically acclaimed sonic performance praised by top audio engineers',
      'Proprietary 45mm large-aperture drivers with rare earth magnets',
      'Exceptional clarity throughout an extended frequency range (15Hz - 28kHz)',
      '90-degree swiveling earcups for easy one-ear monitoring',
      'Includes 3 detachable cables (coiled 1.2m-3m, straight 3m, straight 1.2m)'
    ],
    description: 'The ATH-M50x professional studio monitor headphones feature unmatched sound quality, isolation, and collapsible design trusted by musicians worldwide.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop'
    ],
    packageContents: ['ATH-M50x Headphones', '1.2m-3m Coiled Cable', '3m Straight Cable', '1.2m Straight Cable', '6.3mm Screw-on Adapter', 'Carrying Pouch'],
    specifications: {
      general: { modelNumber: 'ATH-M50x', countryOfOrigin: 'Taiwan', color: 'Black' },
      electrical: { sensitivity: '99 dB', impedance: '38 ohms' },
      physical: { weight: '285g', dimensions: 'Studio Over-Ear', displaySize: 'N/A' },
      warranty: { duration: '1 Year Warranty', coverage: '1 year manufacturer defect warranty' },
      technical: { driverSize: '45 mm', frequencyResponse: '15 Hz - 28 kHz' }
    },
    ratings: { average: 4.8, count: 185 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-GARMIN-FORERUNNER265',
    name: 'Garmin Forerunner 265 GPS Running Smartwatch - Black',
    category: 'Smartwatches',
    brand: 'Garmin',
    price: 50490,
    discountPrice: 46990,
    stock: 7,
    sku: 'GAR-FR265-BLK',
    status: 'Active',
    badges: ['AMOLED Touchscreen', 'Multi-Band GPS', 'Training Readiness'],
    features: [
      '1.3-inch Colorful AMOLED Touchscreen Display with Button Controls',
      'Up to 13 Days of Battery Life in Smartwatch mode, 20 hours in GPS mode',
      'Training Readiness Score based on sleep quality, recovery, and training load',
      'Multi-Band SatIQ GPS technology for accurate tracking in dense forests and cities',
      'Built-in Music Storage for phone-free listening via Spotify/Amazon Music'
    ],
    description: 'Light up your training with Garmin Forerunner 265 featuring a bright AMOLED display, training readiness insights, and multi-band GPS precision.',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Forerunner 265 Smartwatch', 'Charging Cable', 'Documentation'],
    specifications: {
      general: { modelNumber: '010-02810-00', countryOfOrigin: 'Taiwan', color: 'Black / Powder Gray' },
      electrical: { batteryLife: '13 Days Smartwatch / 20 Hours GPS' },
      physical: { weight: '47g', dimensions: '46.1 x 46.1 x 12.9 mm', displaySize: '1.3 Inches' },
      warranty: { duration: '1 Year Garmin Warranty', coverage: '1 year limited hardware warranty' },
      technical: { waterResistance: '5 ATM', sensors: 'Heart Rate, Pulse Ox, Multi-Band GPS' }
    },
    ratings: { average: 4.9, count: 42 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-SAMSUNG-990PRO-2TB',
    name: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 Internal SSD',
    category: 'Storage',
    brand: 'Samsung',
    price: 21999,
    discountPrice: 17999,
    stock: 20,
    sku: 'SAM-990PRO-2TB',
    status: 'Active',
    badges: ['7450 MB/s Read', 'PS5 Compatible', 'Pascal Controller'],
    features: [
      'Blazing fast sequential read speeds up to 7,450 MB/s and write up to 6,900 MB/s',
      'Up to 55% improvement in random read/write performance over 980 PRO',
      'Smart thermal control with nickel-coated controller to maintain performance',
      'Fully compatible with PlayStation 5 and high-performance PC builds',
      'Samsung Magician software for health monitoring and firmware updates'
    ],
    description: 'Reach maximum performance for gaming, 3D editing, and data analysis with the Samsung 990 PRO PCIe 4.0 NVMe SSD.',
    images: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Samsung 990 PRO 2TB SSD', 'Installation Guide'],
    specifications: {
      general: { modelNumber: 'MZ-V9P2T0BW', countryOfOrigin: 'South Korea', color: 'Black' },
      electrical: { powerConsumption: '5.5W Avg' },
      physical: { weight: '9g', dimensions: '80 x 22 x 2.3 mm', displaySize: 'N/A' },
      warranty: { duration: '5 Years Manufacturer Warranty', coverage: '5 year limited warranty or 1200 TBW' },
      technical: { interface: 'PCIe Gen 4.0 x4', formFactor: 'M.2 (2280)', maxReadSpeed: '7450 MB/s', maxWriteSpeed: '6900 MB/s' }
    },
    ratings: { average: 4.9, count: 110 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-LOGITECH-MX-ERGO',
    name: 'Logitech MX Ergo Wireless Trackball Mouse',
    category: 'Mice',
    brand: 'Logitech',
    price: 10995,
    discountPrice: 8995,
    stock: 11,
    sku: 'LOGI-MX-ERGO-BLK',
    status: 'Active',
    badges: ['Ergonomic Trackball', 'Adjustable Hinge 0-20°', 'Flow Tech'],
    features: [
      'Unique adjustable hinge allows you to customize trackball angle from 0° to 20°',
      'Reduces muscle strain by 20% compared to a standard mouse',
      'Precision tracking mode button with dedicated LED indicator',
      'Logitech Options and Flow technology to control up to 2 computers seamlessly',
      'Rechargeable battery holds power for up to 4 months on a full charge'
    ],
    description: 'Logitech MX Ergo is an advanced trackball mouse featuring an adjustable hinge for personalized comfort and reduced muscular fatigue during long work sessions.',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop'
    ],
    packageContents: ['MX Ergo Trackball Mouse', 'Unifying Receiver', 'Micro-USB Cable for Charging', 'User Documentation'],
    specifications: {
      general: { modelNumber: '910-005177', countryOfOrigin: 'China', color: 'Graphite' },
      electrical: { batteryCapacity: '500 mAh Li-Po' },
      physical: { weight: '259g', dimensions: '132.5 x 99.8 x 51.4 mm', displaySize: 'N/A' },
      warranty: { duration: '1 Year Limited Hardware Warranty', coverage: '1 year Logitech warranty' },
      technical: { connection: '2.4GHz Unifying Receiver & Bluetooth', dpi: '512 - 2048 DPI' }
    },
    ratings: { average: 4.6, count: 54 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-TPLINK-DECO-X20-3PK',
    name: 'TP-Link Deco X20 AX1800 Whole Home Mesh Wi-Fi 6 System (3-Pack)',
    category: 'Routers',
    brand: 'TP-Link',
    price: 18999,
    discountPrice: 14999,
    stock: 9,
    sku: 'TPLINK-DECO-X20-3P',
    status: 'Active',
    badges: ['Wi-Fi 6 Mesh', 'Cover Up to 5800 Sq Ft', 'Connect 150+ Devices'],
    features: [
      'Wi-Fi 6 Speeds up to 1800 Mbps (1201 Mbps on 5GHz + 574 Mbps on 2.4GHz)',
      'Seamless coverage up to 5,800 sq ft across multiple floors with 3 units',
      'Connect up to 150+ devices with OFDMA and MU-MIMO technology',
      'TP-Link HomeShield built-in antivirus and robust parental controls',
      'Easy app-guided setup with TP-Link Deco App'
    ],
    description: 'Eliminate dead zones forever with TP-Link Deco X20 AX1800 Wi-Fi 6 Mesh system delivering fast, unbroken Wi-Fi throughout your entire home.',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop'
    ],
    packageContents: ['3x Deco X20 Units', '1x RJ45 Ethernet Cable', '3x Power Adapters', 'Quick Installation Guide'],
    specifications: {
      general: { modelNumber: 'Deco X20(3-pack)', countryOfOrigin: 'Vietnam', color: 'White' },
      electrical: { voltage: '100-240V' },
      physical: { weight: '1.2 kg total', dimensions: '110 x 110 x 114 mm per unit', displaySize: 'N/A' },
      warranty: { duration: '3 Years Warranty', coverage: '3 year TP-Link replacement warranty' },
      technical: { wifiStandard: 'Wi-Fi 6 (802.11ax)', ports: '2x Gigabit Ports per unit' }
    },
    ratings: { average: 4.8, count: 68 },
    deliveryAvailable: true
  },
  {
    productId: 'PRD-APPLE-MAGSAFE-CHARGER',
    name: 'Apple MagSafe Wireless Charger (15W)',
    category: 'Chargers',
    brand: 'Apple',
    price: 4500,
    discountPrice: 3899,
    stock: 40,
    sku: 'AAPL-MAGSAFE-15W',
    status: 'Active',
    badges: ['Official MagSafe', '15W Fast Wireless', 'USB-C Cable'],
    features: [
      'Perfectly aligned magnets attach to iPhone 12, 13, 14, 15 and 16 models',
      'Delivers faster wireless charging up to 15W',
      'Maintains Qi charging compatibility for iPhone 8 or later and AirPods cases',
      'Integrated 1-meter USB-C woven charging cable'
    ],
    description: 'The MagSafe Charger makes wireless charging a snap. The perfectly aligned magnets attach effortlessly to your iPhone for fast wireless charging up to 15W.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop'
    ],
    packageContents: ['Apple MagSafe Charger with 1m USB-C Cable', 'Documentation'],
    specifications: {
      general: { modelNumber: 'MHXH3HN/A', countryOfOrigin: 'China', color: 'Silver / White' },
      electrical: { wattage: '15W Max', output: 'Wireless Qi/MagSafe' },
      physical: { weight: '55g', dimensions: '55.8 x 55.8 x 5.2 mm', displaySize: 'N/A' },
      warranty: { duration: '1 Year Apple Warranty', coverage: '1 year Apple limited warranty' },
      technical: { connector: 'USB-C', wirelessPower: 'Up to 15W' }
    },
    ratings: { average: 4.7, count: 210 },
    deliveryAvailable: true
  }
];

async function seed100Products() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kumawat_pe');
    console.log("Connected to MongoDB for 100 Products Seed...");

    const allOrders = await Order.find({}).lean();
    const referencedNames = new Set();
    allOrders.forEach(o => {
      (o.items || []).forEach(item => {
        if (item.name) referencedNames.add(item.name);
      });
    });

    console.log(`Preserving products referenced in orders:`, Array.from(referencedNames));

    let upsertCount = 0;
    for (const prodData of productsData) {
      await Product.updateOne(
        { productId: prodData.productId },
        { $set: prodData },
        { upsert: true }
      );
      upsertCount++;
    }

    const totalCount = await Product.countDocuments({ status: { $ne: 'Deleted' } });
    console.log(`\n✅ SUCCESSFULLY UPSERTED ${upsertCount} PRODUCTS!`);
    console.log(`Total Active Products in Database: ${totalCount}`);

    mongoose.connection.close();
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
}

seed100Products();
