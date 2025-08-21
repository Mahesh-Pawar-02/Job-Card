const express = require('express');
const router = express.Router();
const taxMasterController = require('../controllers/taxMasterController');

router.post('/', taxMasterController.createTax);
router.get('/', taxMasterController.getAllTaxes);
router.get('/:id', taxMasterController.getTaxById);
router.put('/:id', taxMasterController.updateTax);
router.delete('/:id', taxMasterController.deleteTax);

module.exports = router;


