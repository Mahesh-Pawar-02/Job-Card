const { pool } = require('../config/database.js');

exports.searchParts = async (req, res) => {
  try {
    const search = req.query.search || '';
    const [rows] = await pool.query(
      'SELECT part_id, part_name FROM part WHERE part_name LIKE ? LIMIT 10',
      [`%${search}%`]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error searching parts', error: error.message });
  }
};

// List all parts (limited columns)
exports.getAllParts = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT part_id, part_name, part_no FROM part');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parts' });
  }
};

// Get one part by id
exports.getPartById = async (req, res) => {
  const id = req.params.id;
  try {
    const [results] = await pool.query('SELECT * FROM part WHERE part_id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Part not found' });
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch part' });
  }
};

// Update a part by id (update all available columns in body)
exports.updatePart = async (req, res) => {
  const id = req.params.id;
  const {
    part_name,
    material,
    drg,
    loading,
    broach_spline,
    anti_carb_paste,
    case_depth,
    s_f_hardness,
    wt_pc,
    total_weight,
    batch_qty,
    patn_no,
    hard_temp,
    rpm,
    shot_blasting,
    punching
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE part SET 
        part_name = ?, material = ?, drg = ?, loading = ?, broach_spline = ?, anti_carb_paste = ?, 
        case_depth = ?, s_f_hardness = ?, wt_pc = ?, total_weight = ?, batch_qty = ?, patn_no = ?, 
        hard_temp = ?, rpm = ?, shot_blasting = ?, punching = ? 
      WHERE part_id = ?`,
      [
        part_name,
        material,
        drg,
        loading,
        broach_spline,
        anti_carb_paste,
        case_depth,
        s_f_hardness,
        wt_pc,
        total_weight,
        batch_qty,
        patn_no,
        hard_temp,
        rpm,
        shot_blasting,
        punching,
        id
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Part not found' });
    res.json({ message: 'Part updated successfully' });
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update part' });
  }
};

// Delete multiple parts by ids
exports.deleteMultipleParts = async (req, res) => {
  const { ids } = req.body; // array of ids to delete
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
  try {
    const placeholders = ids.map(() => '?').join(',');
    const result = await pool.query(`DELETE FROM part WHERE part_id IN (${placeholders})`, ids);
    res.json({ message: `${result.affectedRows} parts deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete parts' });
  }
};
