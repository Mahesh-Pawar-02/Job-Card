const express = require('express');
const router = express.Router();
const stateMasterController = require('../controllers/stateMasterController');

router.post('/', stateMasterController.createState);
router.get('/', stateMasterController.getAllStates);
router.get('/:id', stateMasterController.getStateById);
router.put('/:id', stateMasterController.updateState);
router.delete('/:id', stateMasterController.deleteState);

module.exports = router;


