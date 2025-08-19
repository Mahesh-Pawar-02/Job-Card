const { pool } = require('../config/database');

// CREATE
async function createProcess(req, res) {
  try {
    const { process_code, process_name } = req.body;
    if (!process_code || !process_name) {
      return res.status(400).json({ error: 'process_code and process_name are required' });
    }
    const sql = 'INSERT INTO process_master (process_code, process_name) VALUES (?, ?)';
    const [result] = await pool.query(sql, [process_code, process_name]);
    res.status(201).json({ id: result.insertId, process_code, process_name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// READ ALL
async function getAllProcesses(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM process_master ORDER BY process_code');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// READ ONE
async function getProcessById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM process_master WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Process not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// UPDATE
async function updateProcess(req, res) {
  try {
    const { id } = req.params;
    const { process_code, process_name } = req.body;
    if (!process_code || !process_name) {
      return res.status(400).json({ error: 'process_code and process_name are required' });
    }
    const sql = 'UPDATE process_master SET process_code = ?, process_name = ? WHERE id = ?';
    const [result] = await pool.query(sql, [process_code, process_name, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Process not found' });
    res.json({ id, process_code, process_name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE
async function deleteProcess(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM process_master WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Process not found' });
    res.json({ message: 'Process deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createProcess,
  getAllProcesses,
  getProcessById,
  updateProcess,
  deleteProcess,
};


