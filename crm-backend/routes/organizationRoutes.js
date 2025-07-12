const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

// Get organization info
router.get('/', organizationController.getOrganizationInfo);

// Create organization (should only happen once)
router.post('/', organizationController.createOrganizationInfo);

// Update organization info by ID
router.put('/:id', organizationController.updateOrganizationInfo);

module.exports = router;