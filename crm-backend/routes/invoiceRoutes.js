// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { verifyTokenHandler, verifyRoles } = require('../middlewares/jwtTokenHandler');

// Apply JWT authentication to all routes
router.use(verifyTokenHandler);

router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.patch('/:id', invoiceController.updatePaymentStatus);

module.exports = router;