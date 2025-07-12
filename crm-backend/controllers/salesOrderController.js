const salesOrderRepo = require('../repositories/salesOrderRespository');

exports.createSalesOrder = async (req, res) => {
  try {
    // Validate required fields
    const { customer_id, items } = req.body;
    if (!customer_id) {
      return res.status(400).json({ error: 'customer_id is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required and must not be empty' });
    }
    
    const order = await salesOrderRepo.createSalesOrder(req.body);
    res.status(201).json({ message: 'Sales order created successfully', order });
  } catch (err) {
    console.error('Create Order Error:', err.message);
    res.status(500).json({ 
      error: 'Failed to create sales order',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getAllSalesOrders = async (req, res) => {
  try {
    const orders = await salesOrderRepo.getAllSalesOrders();
    res.json(orders);
  } catch (err) {
    console.error('Get Orders Error:', err.message);
    res.status(500).json({ error: 'Unable to fetch orders' });
  }
};

exports.getSalesOrderById = async (req, res) => {
  try {
    const order = await salesOrderRepo.getSalesOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Get Order Error:', err.message);
    res.status(500).json({ error: 'Error fetching order' });
  }
};

exports.confirmSalesOrder = async (req, res) => {
  try {
    const updated = await salesOrderRepo.updateSalesOrderStatus(req.params.id, 'Confirmed');
    if (updated === 0) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order confirmed' });
  } catch (err) {
    console.error('Confirm Order Error:', err.message);
    res.status(500).json({ error: 'Error confirming order' });
  }
};