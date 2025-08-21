const { pool } = require('../config/database');

async function createUnit(req, res) {
  try {
    const { unit_code, unit_name } = req.body;
    if (!unit_code || !unit_name) {
      return res.status(400).json({ error: 'unit_code and unit_name are required' });
    }
    const [result] = await pool.query('INSERT INTO unit_master (unit_code, unit_name) VALUES (?, ?)', [unit_code, unit_name]);
    res.status(201).json({ id: result.insertId, unit_code, unit_name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAllUnits(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM unit_master ORDER BY unit_code');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getUnitById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM unit_master WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Unit not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateUnit(req, res) {
  try {
    const { id } = req.params;
    const { unit_code, unit_name } = req.body;
    if (!unit_code || !unit_name) {
      return res.status(400).json({ error: 'unit_code and unit_name are required' });
    }
    const [result] = await pool.query('UPDATE unit_master SET unit_code = ?, unit_name = ? WHERE id = ?', [unit_code, unit_name, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Unit not found' });
    res.json({ id, unit_code, unit_name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteUnit(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM unit_master WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Unit not found' });
    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
};


