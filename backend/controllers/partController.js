const { pool } = require('../config/database.js');

exports.searchParts = async (req, res) => {
  try {
    const search = req.query.search || '';
    const [rows] = await pool.query(
      'SELECT part_id, part_name FROM Part WHERE part_name LIKE ? LIMIT 10',
      [`%${search}%`]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error searching parts', error: error.message });
  }
};
