const express = require('express');
const router = express.Router();
const unitMasterController = require('../controllers/unitMasterController');

router.post('/', unitMasterController.createUnit);
router.get('/', unitMasterController.getAllUnits);
router.get('/:id', unitMasterController.getUnitById);
router.put('/:id', unitMasterController.updateUnit);
router.delete('/:id', unitMasterController.deleteUnit);

module.exports = router;


