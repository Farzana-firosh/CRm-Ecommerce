const dashboardRepo = require('../repositories/dashboardRepo');

exports.getDashboardSummary = async (req, res) => {
  try {
    console.log('Getting dashboard summary...');
    
    // Debug: Check if invoices exist
    const debugInfo = await dashboardRepo.getTotalInvoicesDebug();
    console.log('DEBUG Info:', debugInfo);
    
    console.log(' Fetching quotation status counts...');
    const quotations = await dashboardRepo.getQuotationStatusCounts();
    console.log('Quotations:', quotations);
    
    console.log('Fetching sales order status counts...');
    const salesOrders = await dashboardRepo.getSalesOrderStatusCounts();
    console.log('Sales Orders:', salesOrders);
    
    console.log('Fetching invoice status counts...');
    const invoices = await dashboardRepo.getInvoiceStatusCounts();
    console.log('Invoices:', invoices);
    
    console.log('Fetching revenue trend...');
    const revenueTrend = await dashboardRepo.getMonthlyRevenueTrend();
    console.log('Revenue Trend:', revenueTrend);
    
    console.log('Fetching recent activity...');
    const recentActivity = await dashboardRepo.getRecentActivity();
    console.log('Recent Activity:', recentActivity);

    const response = {
      quotations,
      salesOrders,
      invoices,
      revenueTrend,
      recentActivity
    };
    
    console.log(' Dashboard summary prepared successfully');
    res.json(response);
  } catch (err) {
    console.error('Dashboard error:', err);
    console.error(' Error stack:', err.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};