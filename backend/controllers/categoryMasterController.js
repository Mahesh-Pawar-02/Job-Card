const { pool } = require('../config/database');

async function createCategory(req, res) {
  try {
    const { category_name } = req.body;
    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ error: 'category_name is required' });
    }
    const [result] = await pool.query('INSERT INTO category_master (category_name) VALUES (?)', [category_name.trim()]);
    res.status(201).json({ id: result.insertId, category_name: category_name.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAllCategories(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM category_master ORDER BY category_name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM category_master WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { category_name } = req.body;
    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ error: 'category_name is required' });
    }
    const [result] = await pool.query('UPDATE category_master SET category_name = ? WHERE id = ?', [category_name.trim(), id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ id, category_name: category_name.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM category_master WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};


