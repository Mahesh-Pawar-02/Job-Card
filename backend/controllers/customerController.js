const {pool} = require("../config/database");

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM customer");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM customer WHERE customer_id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const { customer_name } = req.body;
    const [result] = await pool.query("INSERT INTO customer (customer_name) VALUES (?)", [customer_name]);
    res.status(201).json({ message: "Customer created", customer_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name } = req.body;

    await pool.query("UPDATE customer SET customer_name = ? WHERE customer_id = ?", [customer_name, id]);
    res.json({ message: "Customer updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM customer WHERE customer_id = ?", [id]);
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search for autocomplete
exports.searchCustomers = async (req, res) => {
  try {
    const q = req.query.q || "";
    const [rows] = await pool.query(
      "SELECT customer_id, customer_name FROM customer WHERE customer_name LIKE ? LIMIT 10",
      [`%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Delete multiple customers
exports.deleteMultipleCustomers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided" });
    }

    const [result] = await pool.query(`DELETE FROM customer WHERE customer_id IN (?)`, [ids]);
    res.json({ message: "Customers deleted", affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};