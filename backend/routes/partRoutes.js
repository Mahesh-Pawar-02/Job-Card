const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');
const upload = require('../middleware/uploadParts');

// Search parts by name
router.get('/search/', partController.searchParts);

// Get all parts
router.get('/', partController.getAllParts);

// Get one part by id (optional)
router.get('/:id', partController.getPartById);

// IMPORTANT: use upload.fields for multipart/form-data with 2 images
router.post(
  '/',
  upload.fields([{ name: 'img_1', maxCount: 1 }, { name: 'img_2', maxCount: 1 }]),
  partController.createPart
);

router.put(
  '/:id',
  upload.fields([{ name: 'img_1', maxCount: 1 }, { name: 'img_2', maxCount: 1 }]),
  partController.updatePart
);

// Delete multiple parts by ids in request body
router.delete('/', partController.deleteMultipleParts);

module.exports = router;
