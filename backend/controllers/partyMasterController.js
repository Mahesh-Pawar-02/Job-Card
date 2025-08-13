const { pool } = require('../config/database');

// CREATE
async function createParty(req, res) {
  try {
    const partyData = req.body;
    const sql = `
      INSERT INTO party_master (
        party_name, party_type, vendor_code, address, telephone_nos, email,
        contact_person, legal_name, trade_name, pan, tcs_applicable, trans_catg,
        gstin, state, ac_ledger_name, place, pin, distance_km, country_code,
        port_code, currency_code, ledger_name_tally
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      partyData.party_name, partyData.party_type, partyData.vendor_code, partyData.address,
      partyData.telephone_nos, partyData.email, partyData.contact_person, partyData.legal_name,
      partyData.trade_name, partyData.pan, partyData.tcs_applicable, partyData.trans_catg,
      partyData.gstin, partyData.state, partyData.ac_ledger_name, partyData.place,
      partyData.pin, partyData.distance_km, partyData.country_code, partyData.port_code,
      partyData.currency_code, partyData.ledger_name_tally
    ];
    const [result] = await pool.query(sql, values);
    res.status(201).json({ id: result.insertId, ...partyData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// READ ALL
async function getAllParties(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM party_master');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// READ ONE
async function getPartyById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM party_master WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// UPDATE
async function updateParty(req, res) {
  try {
    const { id } = req.params;
    const partyData = req.body;
    const sql = `
      UPDATE party_master SET
        party_name = ?, party_type = ?, vendor_code = ?, address = ?, telephone_nos = ?, email = ?,
        contact_person = ?, legal_name = ?, trade_name = ?, pan = ?, tcs_applicable = ?, trans_catg = ?,
        gstin = ?, state = ?, ac_ledger_name = ?, place = ?, pin = ?, distance_km = ?, country_code = ?,
        port_code = ?, currency_code = ?, ledger_name_tally = ?
      WHERE id = ?
    `;
    const values = [
      partyData.party_name, partyData.party_type, partyData.vendor_code, partyData.address,
      partyData.telephone_nos, partyData.email, partyData.contact_person, partyData.legal_name,
      partyData.trade_name, partyData.pan, partyData.tcs_applicable, partyData.trans_catg,
      partyData.gstin, partyData.state, partyData.ac_ledger_name, partyData.place,
      partyData.pin, partyData.distance_km, partyData.country_code, partyData.port_code,
      partyData.currency_code, partyData.ledger_name_tally, id
    ];
    const [result] = await pool.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }
    res.json({ id, ...partyData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE
async function deleteParty(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM party_master WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }
    res.json({ message: 'Party deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createParty,
  getAllParties,
  getPartyById,
  updateParty,
  deleteParty
};