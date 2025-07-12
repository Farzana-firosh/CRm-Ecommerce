const express = require('express');
const router = express.Router();
const controller = require('../controllers/quotationController');
const pool = require('../config/db');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Quotation API is working!', timestamp: new Date() });
});

// Database connection test
router.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      message: 'Database connection successful!', 
      current_time: result.rows[0].current_time 
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: error.message 
    });
  }
});

router.post('/', controller.createQuotation);
router.get('/', controller.getQuotations);
router.put('/:id/status', controller.updateQuotationStatus);
router.delete('/:id', controller.deleteQuotation);

module.exports = router;