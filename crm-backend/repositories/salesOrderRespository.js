const pool = require('../config/db');
const queries = require('../queries/salesOrderQueries');

exports.createSalesOrder = async (orderData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { customer_id, sales_order_date, order_date, reference_no, currency, notes, overall_discount_type, overall_discount_value, items } = orderData;
    
    const finalDate = sales_order_date || order_date || new Date();

    // Calculate totals
    let subtotal = 0;
    let total_tax = 0;
    
    for (let item of items) {
      const lineTotal = item.quantity * item.unit_price;
      const lineDiscount = item.line_discount_type === 'percent' 
        ? (lineTotal * item.line_discount_value) / 100 
        : (item.line_discount_value || 0);
      const taxableAmount = lineTotal - lineDiscount;
      const itemTax = taxableAmount * (item.tax_rate || 0);
      
      subtotal += lineTotal;
      total_tax += itemTax;
    }
    
    // Apply overall discount
    const overallDiscount = overall_discount_type === 'percent' 
      ? (subtotal * (overall_discount_value || 0)) / 100 
      : (overall_discount_value || 0);
    
    const grand_total = subtotal - overallDiscount + total_tax;

    const result = await client.query(queries.insertSalesOrder, [
      customer_id,
      finalDate,
      reference_no,
      currency || '$',
      notes,
      overall_discount_type,
      overall_discount_value || 0
    ]);

    const order = result.rows[0];

    for (let item of items) {
      const lineTotal = item.quantity * item.unit_price;
      const lineDiscount = item.line_discount_type === 'percent' 
        ? (lineTotal * item.line_discount_value) / 100 
        : (item.line_discount_value || 0);
      const taxableAmount = lineTotal - lineDiscount;
      const calculatedLineTotal = taxableAmount + (taxableAmount * (item.tax_rate || 0));
      
      await client.query(queries.insertSalesOrderItem, [
        order.id,
        item.item_id,
        item.quantity,
        item.unit_price,
        item.line_discount_type,
        item.line_discount_value,
        item.tax_rate,
        calculatedLineTotal
      ]);
    }

    // Update the order with calculated totals
    await client.query(
      'UPDATE sales_orders SET subtotal = $1, total_tax = $2, grand_total = $3 WHERE id = $4',
      [subtotal, total_tax, grand_total, order.id]
    );

    await client.query('COMMIT');
    
    // Return order with calculated totals
    return {
      ...order,
      subtotal,
      total_tax,
      grand_total
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

exports.getAllSalesOrders = async () => {
  const result = await pool.query(queries.getAllSalesOrders);
  return result.rows;
};

exports.getSalesOrderById = async (id) => {
  const result = await pool.query(queries.getSalesOrderById, [id]);
  return result.rows[0];
};

exports.updateSalesOrderStatus = async (id, status) => {
  const result = await pool.query(queries.updateSalesOrderStatus, [status, id]);
  return result.rowCount;
};