const express = require('express');
const router = express.Router();
const controller = require('../controllers/inwardLCChallanController');

router.post('/', controller.createInwardLCChallan);
router.get('/', controller.getInwardLCChallans);
router.get('/next-grn', controller.getNextGrnNo);
router.get('/:id', controller.getInwardLCChallanById);
router.put('/:id', controller.updateInwardLCChallan);
router.delete('/:id', controller.deleteInwardLCChallan);
router.delete('/grn/:grn_no', controller.deleteInwardLCChallanByGrn);

module.exports = router;


