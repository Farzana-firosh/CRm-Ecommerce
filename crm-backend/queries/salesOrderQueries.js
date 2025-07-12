module.exports = {
  insertSalesOrder: `
    INSERT INTO sales_orders
    (customer_id, order_date, reference_no, currency, notes, overall_discount_type, overall_discount_value, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'Draft')
    RETURNING *;
  `,

  insertSalesOrderItem: `
    INSERT INTO sales_order_items
    (sales_order_id, item_id, quantity, unit_price, line_discount_type, line_discount_value, tax_rate, line_total)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8);
  `,

  getAllSalesOrders: `
    SELECT so.*, c.name AS customer_name
    FROM sales_orders so
    JOIN customers c ON c.id = so.customer_id
    ORDER BY so.id DESC;
  `,

  getSalesOrderById: `
    SELECT so.*, c.name AS customer_name
    FROM sales_orders so
    JOIN customers c ON c.id = so.customer_id
    WHERE so.id = $1;
  `,

  updateSalesOrderStatus: `
    UPDATE sales_orders
    SET status = $1
    WHERE id = $2;
  `
};