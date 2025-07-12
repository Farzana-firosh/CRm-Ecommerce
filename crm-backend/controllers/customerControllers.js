const pool = require('../config/db');

// Create new customer
exports.createCustomer = async (req, res) => {
  const { name, email, phone, address, city, country } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO customers (name, email, phone, address, city, country)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, email, phone, address, city, country]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};