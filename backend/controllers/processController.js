// controllers/processController.js
const { pool } = require("../config/database");

// Get all processes
exports.getAllProcesses = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT process_id, process_name, short_name FROM process ORDER BY process_name ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single process by ID
exports.getProcessById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid process id" });

    const [rows] = await pool.query(
      "SELECT process_id, process_name, short_name FROM process WHERE process_id = ?",
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Process not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new process
exports.createProcess = async (req, res) => {
  try {
    const { process_name, short_name } = req.body;

    if (!process_name || String(process_name).trim() === "") {
      return res.status(400).json({ error: "process_name is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO process (process_name, short_name) VALUES (?, ?)",
      [String(process_name).trim(), short_name ? String(short_name).trim() : null]
    );

    res.status(201).json({ message: "Process created", process_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update process
exports.updateProcess = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid process id" });

    const { process_name, short_name } = req.body;
    if (!process_name || String(process_name).trim() === "") {
      return res.status(400).json({ error: "process_name is required" });
    }

    const [result] = await pool.query(
      "UPDATE process SET process_name = ?, short_name = ? WHERE process_id = ?",
      [String(process_name).trim(), short_name ? String(short_name).trim() : null, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "Process not found" });
    res.json({ message: "Process updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete multiple processes
exports.deleteMultipleProcesses = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided" });
    }

    // sanitize to integers
    const intIds = ids.map((x) => Number(x)).filter((n) => Number.isInteger(n));
    if (intIds.length === 0) return res.status(400).json({ error: "No valid IDs provided" });

    const [result] = await pool.query("DELETE FROM process WHERE process_id IN (?)", [intIds]);
    res.json({ message: "Processes deleted", affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search for autocomplete
exports.searchProcesses = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (q === "") {
      // return some results if empty query (limit to 50)
      const [rows] = await pool.query("SELECT process_id, process_name, short_name FROM process ORDER BY process_name LIMIT 50");
      return res.json(rows);
    }
    const like = `%${q}%`;
    const [rows] = await pool.query(
      "SELECT process_id, process_name, short_name FROM process WHERE process_name LIKE ? OR short_name LIKE ? LIMIT 10",
      [like, like]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
