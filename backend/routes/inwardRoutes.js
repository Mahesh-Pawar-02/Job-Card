const express = require('express');
const router = express.Router();
const inwardController = require('../controllers/inwardController');

// CRUD Routes
router.post('/', inwardController.createInward);       // Create
router.get('/', inwardController.getAllInwards);       // Read All
router.get('/:id', inwardController.getInwardById);    // ✅ Get single inward
router.put('/:id', inwardController.updateInward);     // Update
router.delete('/', inwardController.deleteInwards);    // Delete multiple

module.exports = router;
