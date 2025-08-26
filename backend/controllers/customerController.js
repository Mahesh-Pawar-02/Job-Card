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


// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const results = await pool.query('SELECT * FROM customer');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

// Get one customer by id
exports.getCustomerById = async (req, res) => {
  const id = req.params.id;
  try {
    const results = await pool.query('SELECT * FROM customer WHERE customer_id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// Create new customer
// exports.createCustomer = async (req, res) => {
//   const { customer_name } = req.body;
//   try {
//     const result = await pool.query('INSERT INTO customer (customer_name) VALUES (?)', [customer_name]);
//     res.status(201).json({ insertId: result.insertId });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create customer' });
//   }
// };

// Update customer by id
exports.updateCustomer = async (req, res) => {
  const id = req.params.id;
  const { customer_name } = req.body;
  try {
    const result = await pool.query('UPDATE customer SET customer_name = ? WHERE customer_id = ?', [customer_name, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

// Delete multiple customers by ids
exports.deleteMultipleCustomers = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
  try {
    const placeholders = ids.map(() => '?').join(',');
    const result = await pool.query(`DELETE FROM customer WHERE customer_id IN (${placeholders})`, ids);
    res.json({ message: `${result.affectedRows} customers deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customers' });
  }
};
