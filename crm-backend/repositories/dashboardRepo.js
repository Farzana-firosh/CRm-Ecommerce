const pool = require('../config/db');
const queries = require('../queries/dashboardQueries');

//Total Sales Orders
exports.getTotalSalesOrders = async () => {
  const result = await pool.query(queries.totalSalesOrdersQuery);
  return result.rows[0];
};

//Total Paid Revenue
exports.getTotalPaidRevenue = async () => {
  const result = await pool.query(queries.totalPaidRevenueQuery);
  return result.rows[0];
};

//Sales Orders Trend (Bar Chart)
exports.getSalesOrdersMonthly = async () => {
  const result = await pool.query(queries.salesOrdersMonthlyQuery);
  return result.rows;
};

//Quotation Status Counts
exports.getQuotationStatusCounts = async () => {
  const result = await pool.query(queries.quotationStatusCountQuery);
  return result.rows;
};

//Sales Order Status Counts
exports.getSalesOrderStatusCounts = async () => {
  const result = await pool.query(queries.salesOrderStatusCountQuery);
  return result.rows;
};

//Invoice Payment Status Counts (Pie Chart)
exports.getInvoiceStatusCounts = async () => {
  const result = await pool.query(queries.invoiceStatusCountQuery);
  return result.rows;
};

//Monthly Paid Revenue (Line Chart)
exports.getMonthlyRevenueTrend = async () => {
  try {
    // First try to get paid revenue
    let result = await pool.query(queries.monthlyRevenueTrendQuery);
    console.log(' Paid revenue result:', result.rows);
    
    // If no paid revenue data, try getting all invoice revenue
    if (result.rows.length === 0) {
      console.log('No paid revenue found, trying all invoices...');
      result = await pool.query(queries.monthlyRevenueTrendAllQuery);
      console.log('All invoice revenue result:', result.rows);
    }
    
    return result.rows.reverse(); // Show oldest first
  } catch (error) {
    console.error(' Error fetching revenue trend:', error);
    throw error;
  }
};

//Recent Activity Log (Optional Table)
exports.getRecentActivityLog = async () => {
  const result = await pool.query(queries.recentActivityQuery);
  return result.rows;
};

// Recent Activity for Dashboard
exports.getRecentActivity = async () => {
  try {
    console.log('Fetching recent activity from database...');
    const result = await pool.query(queries.recentActivityQuery);
    console.log('Recent activity raw result:', result.rows);
    return result.rows;
  } catch (error) {
    console.error(' Error fetching recent activity:', error);
    throw error;
  }
};

//Debug: Check total invoices
exports.getTotalInvoicesDebug = async () => {
  try {
    const result = await pool.query('SELECT COUNT(*) as total, MIN(invoice_date) as oldest, MAX(invoice_date) as newest FROM invoices');
    return result.rows[0];
  } catch (error) {
    console.error('DEBUG Error:', error);
    return { total: 0, oldest: null, newest: null };
  }
};