const { pool } = require('../config/database');

async function createTax(req, res) {
  try {
    const { tax_name, cgst_per = 0, sgst_per = 0, igst_per = 0, cess_per = 0 } = req.body;
    if (!tax_name) return res.status(400).json({ error: 'tax_name is required' });
    const sql = 'INSERT INTO tax_master (tax_name, cgst_per, sgst_per, igst_per, cess_per) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.query(sql, [tax_name, cgst_per, sgst_per, igst_per, cess_per]);
    res.status(201).json({ id: result.insertId, tax_name, cgst_per, sgst_per, igst_per, cess_per });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAllTaxes(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM tax_master ORDER BY tax_name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getTaxById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM tax_master WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Tax not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateTax(req, res) {
  try {
    const { id } = req.params;
    const { tax_name, cgst_per = 0, sgst_per = 0, igst_per = 0, cess_per = 0 } = req.body;
    if (!tax_name) return res.status(400).json({ error: 'tax_name is required' });
    const sql = 'UPDATE tax_master SET tax_name = ?, cgst_per = ?, sgst_per = ?, igst_per = ?, cess_per = ? WHERE id = ?';
    const [result] = await pool.query(sql, [tax_name, cgst_per, sgst_per, igst_per, cess_per, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Tax not found' });
    res.json({ id, tax_name, cgst_per, sgst_per, igst_per, cess_per });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteTax(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tax_master WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Tax not found' });
    res.json({ message: 'Tax deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createTax,
  getAllTaxes,
  getTaxById,
  updateTax,
  deleteTax,
};


