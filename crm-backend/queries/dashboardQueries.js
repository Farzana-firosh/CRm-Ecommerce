// Total Sales Orders
exports.totalSalesOrdersQuery = `
  SELECT COUNT(*) AS total_sales_orders
  FROM sales_orders
`;

// Total Paid Revenue
exports.totalPaidRevenueQuery = `
  SELECT SUM(total_amount) AS total_revenue
  FROM invoices
  WHERE status = 'Paid'
`;

//  Bar Chart: Sales Orders per Month
exports.salesOrdersMonthlyQuery = `
  SELECT
    TO_CHAR(order_date, 'YYYY-MM') AS month,
    COUNT(*) AS total_orders
  FROM sales_orders
  GROUP BY month
  ORDER BY month ASC
  LIMIT 6
`;

// Quotation Status Count
exports.quotationStatusCountQuery = `
  SELECT status, COUNT(*) AS count 
  FROM quotations 
  GROUP BY status
`;

//  Sales Order Status Count
exports.salesOrderStatusCountQuery = `
  SELECT status, COUNT(*) AS count 
  FROM sales_orders 
  GROUP BY status
`;

// Invoice Status Count
exports.invoiceStatusCountQuery = `
  SELECT status, COUNT(*) AS count 
  FROM invoices 
  GROUP BY status
`;

// Monthly Paid Revenue
exports.monthlyRevenueTrendQuery = `
  SELECT 
    TO_CHAR(invoice_date, 'YYYY-MM') AS month,
    SUM(total_amount) AS revenue
  FROM invoices
  WHERE status IN ('Paid', 'Partially Paid')
  GROUP BY month
  ORDER BY month DESC
  LIMIT 6
`;

// Alternative Monthly Revenue (includes all invoices)
exports.monthlyRevenueTrendAllQuery = `
  SELECT 
    TO_CHAR(invoice_date, 'YYYY-MM') AS month,
    SUM(total_amount) AS revenue,
    COUNT(*) AS invoice_count
  FROM invoices
  GROUP BY month
  ORDER BY month DESC
  LIMIT 6
`;

// Recent Activity Log with more details
exports.recentActivityQuery = `
  SELECT * FROM (
    SELECT 
      reference_no AS reference, 
      'Quotation' AS type, 
      created_by AS customer_id, 
      status,
      total_amount,
      created_at,
      customer_name
    FROM quotations
    UNION ALL
    SELECT 
      reference_no AS reference, 
      'Sales Order' AS type, 
      customer_id, 
      status,
      COALESCE(grand_total, subtotal, 0) AS total_amount,
      created_at,
      CAST(customer_id AS TEXT) AS customer_name
    FROM sales_orders
    UNION ALL
    SELECT 
      invoice_number AS reference, 
      'Invoice' AS type, 
      customer_id, 
      status,
      total_amount,
      created_at,
      CAST(customer_id AS TEXT) AS customer_name
    FROM invoices
  ) AS combined
  ORDER BY created_at DESC
  LIMIT 10
`;