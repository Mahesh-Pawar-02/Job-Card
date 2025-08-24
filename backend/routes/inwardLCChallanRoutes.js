const express = require('express');
const router = express.Router();
const controller = require('../controllers/inwardLCChallanController');

// Get all inwards with pagination, search, and filter
router.get('/', controller.getInwardLCChallans);

// Get specific inward by ID
router.get('/:id', controller.getInwardLCChallanById);

// Create new inward
router.post('/', controller.createInwardLCChallan);

// Update inward
router.put('/:id', controller.updateInwardLCChallan);

// Delete single inward
router.delete('/:id', controller.deleteInwardLCChallan);

// Delete multiple inwards
router.delete('/bulk', controller.deleteMultipleInwardLCChallans);

module.exports = router;


