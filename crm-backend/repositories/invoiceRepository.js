// repositories/invoiceRepository.js
const db = require('../config/db');
const invoiceQueries = require('../queries/invoiceQueries');

exports.createInvoice = async (invoiceData) => {
  const { customer_id, invoice_date, due_date, sales_order_id, currency, status, total_amount, created_by, items } = invoiceData;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(client);

    const result = await client.query(invoiceQueries.insertInvoice, [
      invoiceNumber, customer_id, invoice_date, due_date, sales_order_id, currency, status, created_by
    ]);
    const invoiceId = result.rows[0].id;

    // Calculate totals for the invoice
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    for (const item of items) {
      // Calculate line amounts
      const lineSubtotal = item.quantity * item.unit_price;
      
      // Calculate discount
      const discountAmount = item.discount_type === 'percent' 
        ? (lineSubtotal * (item.discount_value || 0)) / 100 
        : (item.discount_value || 0);
      
      // Calculate taxable amount (after discount)
      const taxableAmount = lineSubtotal - discountAmount;
      
      // Calculate tax amount
      const taxAmount = taxableAmount * ((item.tax_rate || 0) / 100);
      
      // Calculate total amount for this line
      const lineTotal = taxableAmount + taxAmount;

      // Insert invoice item with calculated values
      await client.query(invoiceQueries.insertInvoiceItem, [
        invoiceId,
        item.item_id,
        item.quantity,
        item.unit_price,
        item.discount_type || null,
        item.discount_value || 0,
        item.tax_rate || 0,
        taxableAmount,
        taxAmount,
        lineTotal
      ]);

      // Add to invoice totals
      subtotal += lineSubtotal;
      totalDiscount += discountAmount;
      totalTax += taxAmount;
    }

    // Update invoice with calculated totals
    const finalTotal = subtotal - totalDiscount + totalTax;
    await client.query(
      `UPDATE invoices SET 
        subtotal = $1, 
        total_discount = $2, 
        total_tax = $3, 
        total_amount = $4, 
        balance_due = $4 
       WHERE id = $5`,
      [subtotal, totalDiscount, totalTax, finalTotal, invoiceId]
    );

    await client.query('COMMIT');
    return invoiceId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Helper function to generate invoice number
async function generateInvoiceNumber(client) {
  const currentYear = new Date().getFullYear();
  const result = await client.query(
    'SELECT COUNT(*) as count FROM invoices WHERE EXTRACT(YEAR FROM invoice_date) = $1',
    [currentYear]
  );
  const count = parseInt(result.rows[0].count) + 1;
  return `INV-${currentYear}-${String(count).padStart(4, '0')}`;
}

exports.getAllInvoices = async () => {
  const result = await db.query(invoiceQueries.getAllInvoices);
  return result.rows;
};

exports.getInvoiceById = async (id) => {
  const invoice = await db.query(invoiceQueries.getInvoiceById, [id]);
  const items = await db.query(invoiceQueries.getInvoiceItemsByInvoiceId, [id]);
  const payments = await db.query('SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC', [id]);
  
  return { 
    ...invoice.rows[0], 
    items: items.rows,
    payments: payments.rows
  };
};

exports.updatePaymentStatus = async (id, { payment_status, paid_amount, payment_date, payment_method = 'Cash', remarks = '' }) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    // Get current invoice details
    const invoice = await client.query('SELECT total_amount, balance_due FROM invoices WHERE id = $1', [id]);
    if (invoice.rows.length === 0) {
      throw new Error('Invoice not found');
    }
    
    const totalAmount = parseFloat(invoice.rows[0].total_amount) || 0;
    const currentBalance = parseFloat(invoice.rows[0].balance_due) || 0;
    
    let newBalance = currentBalance;
    let newStatus = payment_status;
    
    // If this is a cancellation, set balance to 0
    if (payment_status === 'Cancelled') {
      newBalance = 0;
      newStatus = 'Cancelled';
    } else {
      // Add payment record if payment amount is provided
      if (paid_amount && parseFloat(paid_amount) > 0) {
        await client.query(invoiceQueries.insertPayment, [
          id, 
          parseFloat(paid_amount), 
          payment_method, 
          payment_date, 
          remarks
        ]);
        
        // Calculate new balance
        const paidAmountNum = parseFloat(paid_amount) || 0;
        newBalance = Math.max(0, currentBalance - paidAmountNum);
      }
      
      // Determine status based on balance (only if not explicitly provided)
      if (!payment_status) {
        if (newBalance === 0) {
          newStatus = 'Paid';
        } else if (newBalance < totalAmount) {
          newStatus = 'Partially Paid';
        } else {
          newStatus = 'Unpaid';
        }
      }
    }
    
    // Update invoice status and balance
    await client.query(invoiceQueries.updatePaymentStatus, [newStatus, newBalance, id]);
    
    await client.query('COMMIT');
    return { status: newStatus, balance_due: newBalance };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

exports.getPaymentsByInvoiceId = async (invoiceId) => {
  const result = await db.query('SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC', [invoiceId]);
  return result.rows;
};