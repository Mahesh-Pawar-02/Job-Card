const { pool } = require('../config/database.js');

exports.searchCustomers = async (req, res) => {
  try {
    const search = req.query.search || '';
    const [rows] = await pool.query(
      'SELECT customer_id, customer_name FROM Customer WHERE customer_name LIKE ? LIMIT 10',
      [`%${search}%`]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error searching customers', error: error.message });
  }
};
