const { pool } = require('../config/database');

async function createState(req, res) {
  try {
    const { state_code, state_name, gst_state_code } = req.body;
    if (!state_code || !state_name) return res.status(400).json({ error: 'state_code and state_name are required' });
    const [result] = await pool.query('INSERT INTO state_master (state_code, state_name, gst_state_code) VALUES (?, ?, ?)', [state_code, state_name, gst_state_code ?? null]);
    res.status(201).json({ id: result.insertId, state_code, state_name, gst_state_code: gst_state_code ?? null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAllStates(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM state_master ORDER BY COALESCE(gst_state_code, 999), state_name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getStateById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM state_master WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'State not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateState(req, res) {
  try {
    const { id } = req.params;
    const { state_code, state_name, gst_state_code } = req.body;
    if (!state_code || !state_name) return res.status(400).json({ error: 'state_code and state_name are required' });
    const [result] = await pool.query('UPDATE state_master SET state_code = ?, state_name = ?, gst_state_code = ? WHERE id = ?', [state_code, state_name, gst_state_code ?? null, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'State not found' });
    res.json({ id, state_code, state_name, gst_state_code: gst_state_code ?? null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteState(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM state_master WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'State not found' });
    res.json({ message: 'State deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createState,
  getAllStates,
  getStateById,
  updateState,
  deleteState,
};


