const express = require('express');
const router = express.Router();
const partyMasterController = require('../controllers/partyMasterController');

// Create a new party
router.post('/', partyMasterController.createParty);

// Get all parties
router.get('/', partyMasterController.getAllParties);

// Get a single party by ID
router.get('/:id', partyMasterController.getPartyById);

// Update a party by ID
router.put('/:id', partyMasterController.updateParty);

// Delete a party by ID
router.delete('/:id', partyMasterController.deleteParty);

module.exports = router;