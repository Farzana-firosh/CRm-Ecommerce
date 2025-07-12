// queries/invoiceQueries.js
module.exports = {
  insertInvoice: `
    INSERT INTO invoices (invoice_number, customer_id, invoice_date, due_date, sales_order_id, currency, status, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id;
  `,

  insertInvoiceItem: `
    INSERT INTO invoice_items (invoice_id, item_id, quantity, unit_price, discount_type, discount_value, tax_rate, taxable_amount, tax_amount, total_amount)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
  `,

  getAllInvoices: `
    SELECT i.id, i.invoice_number, i.invoice_date, i.due_date, i.status, i.total_amount, i.balance_due, 
           i.created_by, c.name AS customer_name, c.id AS customer_id
    FROM invoices i
    JOIN customers c ON i.customer_id = c.id
    ORDER BY i.invoice_date DESC;
  `,

  getInvoiceById: `
    SELECT * FROM invoices WHERE id = $1;
  `,

  getInvoiceItemsByInvoiceId: `
    SELECT ii.*, i.name 
    FROM invoice_items ii 
    LEFT JOIN items i ON ii.item_id = i.id 
    WHERE ii.invoice_id = $1;
  `,

  updatePaymentStatus: `
    UPDATE invoices
    SET status = $1, balance_due = $2
    WHERE id = $3;
  `,

  // Additional query for payment tracking
  insertPayment: `
    INSERT INTO payments (invoice_id, amount_paid, payment_method, payment_date, remarks)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id;
  `
};