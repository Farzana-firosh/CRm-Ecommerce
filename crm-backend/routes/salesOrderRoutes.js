const express = require('express');
const router = express.Router();
const controller = require('../controllers/salesOrderController');

router.post('/', controller.createSalesOrder);
router.get('/', controller.getAllSalesOrders);
router.get('/:id', controller.getSalesOrderById);
router.put('/:id/confirm', controller.confirmSalesOrder);

module.exports = router;