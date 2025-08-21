const { pool } = require('../config/database');

// CREATE
async function createItem(req, res) {
  try {
    const item = req.body;
    if (!item.part_number || !item.part_name) {
      return res.status(400).json({ error: 'part_number and part_name are required' });
    }
    const sql = `
      INSERT INTO item_master (
        part_number, part_name, stock_unit, rate_per_kg, weight,
        surface_hardness, core_hardness, case_depth, material, batch_qty,
        loading, broach_spline, anti_carb_paste, pattern_no, rpm,
        shot_blasting, punching
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      item.part_number, item.part_name, item.stock_unit || null, item.rate_per_kg || null, item.weight || null,
      item.surface_hardness || null, item.core_hardness || null, item.case_depth || null, item.material || null, item.batch_qty || null,
      item.loading || null, item.broach_spline || null, item.anti_carb_paste || null, item.pattern_no || null, item.rpm || null,
      item.shot_blasting || null, item.punching || null
    ];
    const [result] = await pool.query(sql, values);
    res.status(201).json({ id: result.insertId, ...item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// READ ALL
async function getAllItems(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM item_master ORDER BY part_number');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// READ ONE
async function getItemById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM item_master WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// UPDATE
async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const item = req.body;
    const sql = `
      UPDATE item_master SET
        part_number = ?, part_name = ?, stock_unit = ?, rate_per_kg = ?, weight = ?,
        surface_hardness = ?, core_hardness = ?, case_depth = ?, material = ?, batch_qty = ?,
        loading = ?, broach_spline = ?, anti_carb_paste = ?, pattern_no = ?, rpm = ?,
        shot_blasting = ?, punching = ?
      WHERE id = ?
    `;
    const values = [
      item.part_number, item.part_name, item.stock_unit || null, item.rate_per_kg || null, item.weight || null,
      item.surface_hardness || null, item.core_hardness || null, item.case_depth || null, item.material || null, item.batch_qty || null,
      item.loading || null, item.broach_spline || null, item.anti_carb_paste || null, item.pattern_no || null, item.rpm || null,
      item.shot_blasting || null, item.punching || null,
      id
    ];
    const [result] = await pool.query(sql, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ id, ...item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE
async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM item_master WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
};


