const express = require('express');
const router = express.Router();
const itemMasterController = require('../controllers/itemMasterController');

router.post('/', itemMasterController.createItem);
router.get('/', itemMasterController.getAllItems);
router.get('/:id', itemMasterController.getItemById);
router.put('/:id', itemMasterController.updateItem);
router.delete('/:id', itemMasterController.deleteItem);

module.exports = router;


