const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyTokenHandler } = require('../middlewares/jwtTokenHandler');

// Apply JWT middleware to all dashboard routes
router.use(verifyTokenHandler);

router.get('/summary', dashboardController.getDashboardSummary);

module.exports = router;