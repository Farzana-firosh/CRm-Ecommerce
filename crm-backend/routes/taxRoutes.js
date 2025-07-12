// routes/taxRoutes.js

const express = require('express');
const router = express.Router();
const taxController = require('../controllers/taxControllers');

router.get('/', taxController.getAllTaxes);
router.get('/:id', taxController.getTaxById);
router.post('/', taxController.createTax);
router.put('/:id', taxController.updateTax);
router.delete('/:id', taxController.deleteTax);

module.exports = router;