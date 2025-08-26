const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');

// Search parts by name
router.get('/search/', partController.searchParts);

// Get all parts
router.get('/', partController.getAllParts);

// Get one part by id (optional)
router.get('/:id', partController.getPartById);

// Update a part by id
router.put('/:id', partController.updatePart);

// Delete multiple parts by ids in request body
router.delete('/', partController.deleteMultipleParts);

module.exports = router;
