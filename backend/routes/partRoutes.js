const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');

// Search parts by name
router.get('/', partController.searchParts);

module.exports = router;
