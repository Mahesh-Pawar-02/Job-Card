const express = require('express');
const router = express.Router();
const processMasterController = require('../controllers/processMasterController');

router.post('/', processMasterController.createProcess);
router.get('/', processMasterController.getAllProcesses);
router.get('/:id', processMasterController.getProcessById);
router.put('/:id', processMasterController.updateProcess);
router.delete('/:id', processMasterController.deleteProcess);

module.exports = router;


