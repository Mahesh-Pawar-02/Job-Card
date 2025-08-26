const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Search customers by name
router.get('/search/', customerController.searchCustomers);


// List all customers
router.get('/', customerController.getAllCustomers);

// Get one customer by id (optional)
router.get('/:id', customerController.getCustomerById);

// Create new customer
// router.post('/', customerController.createCustomer);

// Update customer by id
router.put('/:id', customerController.updateCustomer);

// Delete multiple customers by ids
router.delete('/', customerController.deleteMultipleCustomers);

module.exports = router;
