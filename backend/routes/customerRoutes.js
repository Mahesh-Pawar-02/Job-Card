const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Search customers by name
router.get('/', customerController.searchCustomers);

module.exports = router;
