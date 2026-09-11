const PaymentRecord = require('../models/PaymentRecord');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * Returns Date boundaries for filtering based on range string.
 */
function parseDateRange(range, customStart, customEnd) {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  if (range === 'today') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (range === '7days') {
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
  } else if (range === '30days') {
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
  } else if (range === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (range === 'lastmonth') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (range === 'custom' && customStart) {
    start = new Date(customStart);
    if (customEnd) {
      end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
    }
  } else {
    // Default to all time
    start = new Date(0);
  }

  return { start, end };
}

/**
 * Formats monetary amounts safely (INR).
 */
function formatCurrency(val) {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Calculates financial metrics from payment records and products.
 */
async function getFinanceSummary(isMongoConnected, mockDB, options = {}) {
  const { range = '30days', customStart, customEnd, status = 'all', method = 'all' } = options;
  const { start, end } = parseDateRange(range, customStart, customEnd);

  let payments = [];
  let orders = [];
  let products = [];

  if (isMongoConnected) {
    payments = await PaymentRecord.find({}).sort({ transactionTime: -1 }).lean();
    orders = await Order.find({}).lean();
    products = await Product.find({}).lean();
  } else {
    payments = mockDB.paymentRecords || [];
    orders = mockDB.orders || [];
    products = mockDB.products || [];
  }

  // Map products by productId and name for fast cost lookup
  const productMap = {};
  products.forEach(p => {
    if (p.productId) productMap[p.productId] = p;
    if (p.name) productMap[p.name.toLowerCase().trim()] = p;
  });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let todayRevenue = 0;
  let sevenDayRevenue = 0;
  let thirtyDayRevenue = 0;
  let grossSales = 0;
  let totalDiscounts = 0;
  let totalRefunds = 0;
  let successfulCount = 0;

  let pendingCount = 0;
  let pendingAmount = 0;
  let failedCount = 0;
  let failedAmount = 0;
  let refundCount = 0;

  let hasProductCostData = false;
  let totalProductCost = 0;
  let totalItemsSoldWithCost = 0;

  // Filter payments matching range, status, and method for detailed table / analytics
  const filteredPayments = payments.filter(p => {
    const t = new Date(p.transactionTime);
    if (start && t < start) return false;
    if (end && t > end) return false;
    if (status !== 'all') {
      const pStatus = (p.status || '').toLowerCase();
      if (status === 'paid' && pStatus !== 'paid' && pStatus !== 'cod completed') return false;
      if (status === 'pending' && pStatus !== 'pending' && pStatus !== 'cod pending') return false;
      if (status === 'failed' && pStatus !== 'failed' && pStatus !== 'cancelled') return false;
      if (status === 'refunded' && pStatus !== 'refunded') return false;
    }
    if (method !== 'all') {
      const pMethod = (p.method || '').toLowerCase();
      if (method === 'razorpay' && !pMethod.includes('razorpay')) return false;
      if (method === 'cod' && !pMethod.includes('cod') && !pMethod.includes('cash')) return false;
      if (method === 'upi' && !pMethod.includes('upi') && !pMethod.includes('paytm') && !pMethod.includes('phonepe') && !pMethod.includes('gpay')) return false;
    }
    return true;
  });

  // Calculate overall metrics
  payments.forEach(p => {
    const pDate = new Date(p.transactionTime);
    const amt = Number(p.amount) || 0;
    const isPaid = p.status === 'Paid' || p.status === 'COD Completed';
    const isPending = p.status === 'Pending' || p.status === 'COD Pending';
    const isFailed = p.status === 'Failed' || p.status === 'Cancelled';
    const isRefunded = p.status === 'Refunded';

    if (isPaid) {
      grossSales += amt;
      successfulCount += 1;
      if (pDate >= todayStart) todayRevenue += amt;
      if (pDate >= sevenDaysAgo) sevenDayRevenue += amt;
      if (pDate >= thirtyDaysAgo) thirtyDayRevenue += amt;

      // Find matching order items to calculate cost if costPrice exists
      const matchingOrder = orders.find(o => o.orderId === p.orderId);
      if (matchingOrder && Array.isArray(matchingOrder.items)) {
        totalDiscounts += Number(matchingOrder.discountAmount) || 0;
        matchingOrder.items.forEach(item => {
          const prod = (item.productId && productMap[item.productId]) || productMap[(item.name || '').toLowerCase().trim()];
          if (prod && typeof prod.costPrice === 'number' && !isNaN(prod.costPrice) && prod.costPrice > 0) {
            hasProductCostData = true;
            totalProductCost += prod.costPrice * (item.quantity || 1);
            totalItemsSoldWithCost += item.quantity || 1;
          }
        });
      }
    } else if (isPending) {
      pendingCount += 1;
      pendingAmount += amt;
    } else if (isFailed) {
      failedCount += 1;
      failedAmount += amt;
    }

    if (isRefunded || p.refundAmount > 0) {
      refundCount += 1;
      totalRefunds += Number(p.refundAmount) || amt;
    }
  });

  const netSales = Math.max(0, grossSales - totalDiscounts - totalRefunds);
  const averageOrderValue = successfulCount > 0 ? netSales / successfulCount : 0;

  // Strict profit rule: Only calculate Net Profit if real cost data is available
  let netProfit = null;
  let profitMargin = null;
  let profitStatusText = 'Profit unavailable — cost data not configured';

  if (hasProductCostData && totalProductCost > 0) {
    netProfit = netSales - totalProductCost;
    profitMargin = netSales > 0 ? (netProfit / netSales) * 100 : 0;
    profitStatusText = `Calculated from ${totalItemsSoldWithCost} item(s) with cost data`;
  }

  return {
    todayRevenue,
    sevenDayRevenue,
    thirtyDayRevenue,
    grossSales,
    totalDiscounts,
    totalRefunds,
    netSales,
    successfulCount,
    pendingCount,
    pendingAmount,
    failedCount,
    failedAmount,
    refundCount,
    averageOrderValue,
    hasProductCostData,
    totalProductCost,
    netProfit,
    profitMargin,
    profitStatusText,
    filteredPayments,
    isTestMode: (process.env.RAZORPAY_KEY_ID || '').includes('rzp_test') || (process.env.NODE_ENV !== 'production')
  };
}

/**
 * Prepares revenue trend data points for Chart.js.
 */
function buildRevenueTrend(payments, days = 7) {
  const labels = [];
  const dataPoints = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    labels.push(dateStr);

    const dayStart = new Date(d.setHours(0, 0, 0, 0));
    const dayEnd = new Date(d.setHours(23, 59, 59, 999));

    const dayTotal = payments
      .filter(p => (p.status === 'Paid' || p.status === 'COD Completed'))
      .filter(p => {
        const t = new Date(p.transactionTime);
        return t >= dayStart && t <= dayEnd;
      })
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    dataPoints.push(dayTotal);
  }

  return { labels, dataPoints };
}

/**
 * Generates CSV string of transactions for download.
 */
function generatePaymentsCSV(payments) {
  const headers = ['Transaction Date', 'Order ID', 'Payment ID', 'Razorpay Order ID', 'Method', 'Amount (INR)', 'Status', 'Refund Status', 'Refund Amount (INR)'];
  let csv = headers.join(',') + '\n';

  payments.forEach(p => {
    const row = [
      `"${new Date(p.transactionTime).toLocaleString('en-IN')}"`,
      `"${p.orderId || ''}"`,
      `"${p.paymentId || ''}"`,
      `"${p.razorpayOrderId || ''}"`,
      `"${p.method || ''}"`,
      p.amount || 0,
      `"${p.status || ''}"`,
      `"${p.refundStatus || 'None'}"`,
      p.refundAmount || 0
    ];
    csv += row.join(',') + '\n';
  });

  return csv;
}

module.exports = {
  parseDateRange,
  formatCurrency,
  getFinanceSummary,
  buildRevenueTrend,
  generatePaymentsCSV
};
