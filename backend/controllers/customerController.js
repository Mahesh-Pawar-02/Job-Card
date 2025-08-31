// controllers/customerController.js
const { pool } = require("../config/database");

// Helper: basic email check
const isValidEmail = (s) => {
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM customer
      ORDER BY customer_name ASC
    `);
    res.json(rows); // contact_person already exists
  } catch (err) {
    console.error("getAllCustomers:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid customer id" });

    const [rows] = await pool.query(`
      SELECT *
      FROM customer
      WHERE customer_id = ?
      LIMIT 1
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ error: "Customer not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("getCustomerById:", err);
    res.status(500).json({ error: err.message });
  }
};

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const {
      customer_name,
      address,
      vendor_code,
      phone_no,
      email_id,
      contact_person, // updated field
      PAN_NO,
      GSTN,
      state_code,
      state_name
    } = req.body;

    if (!customer_name || String(customer_name).trim() === "") {
      return res.status(400).json({ error: "customer_name is required" });
    }

    const name = String(customer_name).trim();
    const addr = address ? String(address).trim() : null;
    const vendor = vendor_code ? String(vendor_code).trim() : null;
    const phone = phone_no ? String(phone_no).trim() : null;
    const email = email_id ? String(email_id).trim() : null;
    const pan = PAN_NO ? String(PAN_NO).trim() : null;
    const gst = GSTN ? String(GSTN).trim() : null;
    const sc = state_code ? String(state_code).trim() : null;
    const sn = state_name ? String(state_name).trim() : null;
    const cp = contact_person ? String(contact_person).trim() : null;

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const [result] = await pool.query(
      `INSERT INTO customer
        (customer_name, address, vendor_code, phone_no, email_id, contact_person, PAN_NO, GSTN, state_code, state_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, addr, vendor, phone, email, cp, pan, gst, sc, sn]
    );

    res.status(201).json({ message: "Customer created", customer_id: result.insertId });
  } catch (err) {
    console.error("createCustomer:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid customer id" });

    const {
      customer_name,
      address,
      vendor_code,
      phone_no,
      email_id,
      contact_person,
      PAN_NO,
      GSTN,
      state_code,
      state_name
    } = req.body;

    if (!customer_name || String(customer_name).trim() === "") {
      return res.status(400).json({ error: "customer_name is required" });
    }

    const name = String(customer_name).trim();
    const addr = address ? String(address).trim() : null;
    const vendor = vendor_code ? String(vendor_code).trim() : null;
    const phone = phone_no ? String(phone_no).trim() : null;
    const email = email_id ? String(email_id).trim() : null;
    const pan = PAN_NO ? String(PAN_NO).trim() : null;
    const gst = GSTN ? String(GSTN).trim() : null;
    const sc = state_code ? String(state_code).trim() : null;
    const sn = state_name ? String(state_name).trim() : null;
    const cp = contact_person ? String(contact_person).trim() : null;

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const [result] = await pool.query(
      `UPDATE customer SET
         customer_name = ?, address = ?, vendor_code = ?, phone_no = ?, email_id = ?,
         contact_person = ?, PAN_NO = ?, GSTN = ?, state_code = ?, state_name = ?
       WHERE customer_id = ?`,
      [name, addr, vendor, phone, email, cp, pan, gst, sc, sn, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer updated" });
  } catch (err) {
    console.error("updateCustomer:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete single customer
exports.deleteCustomer = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid customer id" });

    const [result] = await pool.query("DELETE FROM customer WHERE customer_id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error("deleteCustomer:", err);
    res.status(500).json({ error: err.message });
  }
};

// Search for autocomplete
exports.searchCustomers = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const like = `${q}%`;
    const [rows] = await pool.query(
      `SELECT customer_id, customer_name FROM customer
       WHERE customer_name LIKE ?
       LIMIT 10`,
      [like]
    );
    res.json(rows);
  } catch (err) {
    console.error("searchCustomers:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete multiple customers
exports.deleteMultipleCustomers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "No IDs provided" });

    const intIds = ids.map(x => Number(x)).filter(n => Number.isInteger(n));
    if (intIds.length === 0) return res.status(400).json({ error: "No valid IDs provided" });

    const [result] = await pool.query("DELETE FROM customer WHERE customer_id IN (?)", [intIds]);
    res.json({ message: "Customers deleted", affectedRows: result.affectedRows });
  } catch (err) {
    console.error("deleteMultipleCustomers:", err);
    res.status(500).json({ error: err.message });
  }
};
