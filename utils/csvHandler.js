const Product = require('../models/Product');

const STRICT_HEADERS = [
  'productId', 'name', 'category', 'subcategory', 'brand',
  'price', 'discountPrice', 'costPrice', 'stock', 'sku',
  'status', 'deliveryAvailable', 'description', 'images'
];

exports.STRICT_HEADERS = STRICT_HEADERS;

exports.getStrictTemplateCSV = () => {
  const sampleRow = [
    'PRD-SAMPLE01',
    'Havells 16A Heavy Duty Switch',
    'Electrical',
    'Switches',
    'Havells',
    '499',
    '399',
    '250',
    '50',
    'HAV-SW-16A-01',
    'Active',
    'true',
    'High quality heavy-duty modular switch with flame-retardant polycarbonate body.',
    '["/uploads/products/havells-16a-switch/1.jpg","/uploads/products/havells-16a-switch/2.jpg","/uploads/products/havells-16a-switch/3.jpg"]'
  ];
  return exports.serializeCSV([STRICT_HEADERS, sampleRow]);
};

/**
 * RFC 4180 Compliant CSV Parser
 * Handles multiline quoted fields, escaped quotes (""), CRLF/LF line endings, and custom delimiters.
 */
exports.parseCSV = (csvText) => {
  if (!csvText || typeof csvText !== 'string' || csvText.trim().length === 0) {
    return { headers: [], rows: [] };
  }

  const records = [];
  let currentRecord = [];
  let currentField = '';
  let insideQuotes = false;
  let i = 0;
  const len = csvText.length;

  while (i < len) {
    const char = csvText[i];
    const nextChar = i + 1 < len ? csvText[i + 1] : '';

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped double quote ("")
        currentField += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes;
        i++;
        continue;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      currentRecord.push(currentField.trim());
      currentField = '';
      i++;
      continue;
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      // End of record
      currentRecord.push(currentField.trim());
      currentField = '';
      if (currentRecord.length > 1 || (currentRecord.length === 1 && currentRecord[0] !== '')) {
        records.push(currentRecord);
      }
      currentRecord = [];
      if (char === '\r' && nextChar === '\n') {
        i += 2;
      } else {
        i++;
      }
      continue;
    } else {
      currentField += char;
      i++;
    }
  }

  // Push final field/record if any remaining
  if (currentField !== '' || currentRecord.length > 0) {
    currentRecord.push(currentField.trim());
    if (currentRecord.length > 1 || (currentRecord.length === 1 && currentRecord[0] !== '')) {
      records.push(currentRecord);
    }
  }

  if (records.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = records[0].map(h => h.trim());
  const rows = records.slice(1);
  return { headers, rows };
};

/**
 * RFC 4180 Compliant CSV Serializer
 */
exports.serializeCSV = (matrix) => {
  return matrix.map(row => {
    return row.map(val => {
      let str = val === undefined || val === null ? '' : String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(',');
  }).join('\r\n') + '\r\n';
};

/**
 * Helper to parse image input string/array safely.
 */
function parseImageField(rawImages) {
  if (!rawImages) return [];
  if (Array.isArray(rawImages)) return rawImages.map(i => String(i).trim()).filter(Boolean);
  
  const trimmed = rawImages.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(i => String(i).trim()).filter(Boolean);
      }
    } catch (e) {
      // Fallback if JSON parse fails
    }
  }

  if (trimmed.includes(';')) {
    return trimmed.split(';').map(i => i.trim()).filter(Boolean);
  }
  if (trimmed.includes('|')) {
    return trimmed.split('|').map(i => i.trim()).filter(Boolean);
  }
  return [trimmed];
}

/**
 * Validates and transforms a parsed CSV row into a clean Product document object.
 */
function validateAndMapRow(row, headers, rIdx, existingSkuToProductMap) {
  const rowNum = rIdx + 2; // 1-indexed including header
  const getCol = (headerName) => {
    const idx = headers.findIndex(h => h.trim().toLowerCase() === headerName.toLowerCase());
    return (idx !== -1 && row[idx] !== undefined) ? row[idx].trim() : '';
  };

  const name = getCol('name');
  const category = getCol('category');
  const subcategory = getCol('subcategory');
  const brand = getCol('brand');
  const rawPrice = getCol('price');
  const rawDiscPrice = getCol('discountPrice');
  const rawCostPrice = getCol('costPrice');
  const rawStock = getCol('stock');
  const sku = getCol('sku');
  const status = getCol('status');
  const deliveryAvailableStr = getCol('deliveryAvailable');
  const description = getCol('description');
  const rawImages = getCol('images');

  // Name check
  if (!name) {
    return { valid: false, error: { row: rowNum, error: 'Missing required field: product name' } };
  }

  // Category & Brand check
  if (!category) {
    return { valid: false, error: { row: rowNum, error: 'Missing required field: category' } };
  }
  if (!brand) {
    return { valid: false, error: { row: rowNum, error: 'Missing required field: brand' } };
  }

  // Price validation
  const price = parseFloat(rawPrice);
  if (isNaN(price) || price <= 0) {
    return { valid: false, error: { row: rowNum, error: `Invalid price "${rawPrice}". Must be a number greater than 0.` } };
  }

  // Discount Price validation
  let discountPrice = price;
  if (rawDiscPrice !== '') {
    discountPrice = parseFloat(rawDiscPrice);
    if (isNaN(discountPrice) || discountPrice < 0) {
      return { valid: false, error: { row: rowNum, error: `Invalid discount price "${rawDiscPrice}". Must be >= 0.` } };
    }
    if (discountPrice > price) {
      return { valid: false, error: { row: rowNum, error: `Discount price (${discountPrice}) cannot exceed selling price (${price}).` } };
    }
  }

  // Cost Price validation
  let costPrice = undefined;
  if (rawCostPrice !== '') {
    costPrice = parseFloat(rawCostPrice);
    if (isNaN(costPrice) || costPrice < 0) {
      return { valid: false, error: { row: rowNum, error: `Invalid cost price "${rawCostPrice}". Must be >= 0.` } };
    }
  }

  // Stock validation
  if (rawStock === '') {
    return { valid: false, error: { row: rowNum, error: 'Missing required field: stock quantity' } };
  }
  const stock = parseInt(rawStock, 10);
  if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
    return { valid: false, error: { row: rowNum, error: `Invalid stock quantity "${rawStock}". Must be a non-negative integer.` } };
  }

  // SKU validation
  if (!sku) {
    return { valid: false, error: { row: rowNum, error: 'Missing required field: SKU' } };
  }
  const productId = getCol('productId') || ('PRD-' + Date.now() + '-' + Math.floor(Math.random() * 10000));
  const existingProductForSku = existingSkuToProductMap.get(sku.toLowerCase());
  if (existingProductForSku && existingProductForSku !== productId) {
    return { valid: false, error: { row: rowNum, error: `Duplicate SKU "${sku}" already exists on product ${existingProductForSku}.` } };
  }

  // Description check
  if (!description) {
    return { valid: false, error: { row: rowNum, error: 'Missing required field: description' } };
  }

  // Images check
  const images = parseImageField(rawImages);
  if (images.length < 3) {
    return { valid: false, error: { row: rowNum, error: `Product requires a minimum of 3 valid images (found ${images.length}).` } };
  }

  const validStatus = ['Active', 'Out Of Stock', 'Disabled', 'Hidden'].includes(status) ? status : 'Active';

  existingSkuToProductMap.set(sku.toLowerCase(), productId);

  const productDoc = {
    productId,
    name,
    category,
    subcategory: subcategory || '',
    brand,
    price,
    discountPrice,
    costPrice,
    stock,
    sku,
    status: validStatus,
    deliveryAvailable: deliveryAvailableStr.toLowerCase() !== 'false',
    description,
    images,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return { valid: true, productDoc };
}

/**
 * Pre-import preview endpoint helper.
 * Parses CSV and returns structured preview with valid/invalid summary and 5-10 row preview samples.
 */
exports.previewProductImport = async (csvText, isMongoConnected, mockDB) => {
  const { headers, rows } = exports.parseCSV(csvText);
  
  if (headers.length === 0 || !headers.includes('name') || !headers.includes('price')) {
    return {
      success: false,
      message: 'Invalid CSV headers. CSV must include at minimum "name" and "price" columns.',
      total: rows.length,
      validCount: 0,
      invalidCount: rows.length,
      errors: [{ row: 1, error: 'Header validation failed. Required: ' + STRICT_HEADERS.join(', ') }],
      previewSamples: []
    };
  }

  const existingSkuToProductMap = new Map();
  if (isMongoConnected) {
    const existing = await Product.find({}, 'sku productId').lean();
    existing.forEach(p => { if (p.sku) existingSkuToProductMap.set(p.sku.toLowerCase(), p.productId); });
  } else if (mockDB && mockDB.products) {
    mockDB.products.forEach(p => { if (p.sku) existingSkuToProductMap.set(p.sku.toLowerCase(), p.productId); });
  }

  const errors = [];
  const previewSamples = [];
  let validCount = 0;

  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    const result = validateAndMapRow(rows[rIdx], headers, rIdx, new Map(existingSkuToProductMap));
    if (result.valid) {
      validCount++;
      if (previewSamples.length < 10) {
        previewSamples.push({
          row: rIdx + 2,
          productId: result.productDoc.productId,
          name: result.productDoc.name,
          category: result.productDoc.category,
          brand: result.productDoc.brand,
          price: result.productDoc.price,
          discountPrice: result.productDoc.discountPrice,
          stock: result.productDoc.stock,
          sku: result.productDoc.sku,
          status: result.productDoc.status,
          imageCount: result.productDoc.images.length
        });
      }
    } else {
      errors.push(result.error);
    }
  }

  return {
    success: true,
    total: rows.length,
    validCount,
    invalidCount: errors.length,
    errors,
    previewSamples
  };
};

/**
 * Executes full product import from raw CSV text or uploaded file.
 */
exports.processProductImport = async (csvText, isMongoConnected, mockDB) => {
  const { headers, rows } = exports.parseCSV(csvText);

  if (headers.length === 0 || !headers.includes('name') || !headers.includes('price')) {
    return {
      success: false,
      message: 'Invalid CSV headers. CSV must include at minimum "name" and "price" columns.',
      total: rows.length,
      successCount: 0,
      failCount: rows.length,
      errors: [{ row: 1, error: 'Header validation failed. Expected headers: ' + STRICT_HEADERS.join(', ') }]
    };
  }

  const existingSkuToProductMap = new Map();
  if (isMongoConnected) {
    const existing = await Product.find({}, 'sku productId').lean();
    existing.forEach(p => { if (p.sku) existingSkuToProductMap.set(p.sku.toLowerCase(), p.productId); });
  } else if (mockDB && mockDB.products) {
    mockDB.products.forEach(p => { if (p.sku) existingSkuToProductMap.set(p.sku.toLowerCase(), p.productId); });
  }

  const errors = [];
  const validProducts = [];

  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    const result = validateAndMapRow(rows[rIdx], headers, rIdx, existingSkuToProductMap);
    if (result.valid) {
      validProducts.push(result.productDoc);
    } else {
      errors.push(result.error);
    }
  }

  // Batch insert/upsert into DB
  let savedCount = 0;
  if (validProducts.length > 0) {
    if (isMongoConnected) {
      for (const p of validProducts) {
        await Product.updateOne({ productId: p.productId }, { $set: p }, { upsert: true });
        savedCount++;
      }
    } else if (mockDB && mockDB.products) {
      for (const p of validProducts) {
        const idx = mockDB.products.findIndex(m => m.productId === p.productId);
        if (idx !== -1) mockDB.products[idx] = { ...mockDB.products[idx], ...p };
        else mockDB.products.push(p);
        savedCount++;
      }
    }
  }

  return {
    success: true,
    total: rows.length,
    successCount: savedCount,
    failCount: errors.length,
    errors
  };
};

/**
 * Export products array into RFC 4180 CSV string.
 */
exports.exportProductsCSV = (products) => {
  const matrix = [STRICT_HEADERS];

  products.forEach(p => {
    const imagesStr = JSON.stringify(p.images || []);
    matrix.push([
      p.productId || '',
      p.name || '',
      p.category || '',
      p.subcategory || '',
      p.brand || '',
      p.price || 0,
      p.discountPrice || p.price || 0,
      p.costPrice !== undefined ? p.costPrice : '',
      p.stock || 0,
      p.sku || '',
      p.status || 'Active',
      p.deliveryAvailable !== undefined ? String(p.deliveryAvailable) : 'true',
      p.description || '',
      imagesStr
    ]);
  });

  return exports.serializeCSV(matrix);
};
