const {pool} = require("../config/database");

// Get all processes
exports.getAllProcesses = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM process");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single process by ID
exports.getProcessById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM process WHERE process_id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Process not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new process
exports.createProcess = async (req, res) => {
  try {
    const {
      process_name,
      loading,
      pasting,
      pattern_no,
      shot_blasting,
      punching,
      temperature,
      time,
      case_depth,
      checking_location,
      cut_off_value,
      core_hardness,
      surface_hardness,
      microstructure
    } = req.body;

    const [result] = await pool.query(`
      INSERT INTO process (
        process_name, loading, pasting, pattern_no, shot_blasting, punching,
        temperature, time, case_depth, checking_location, cut_off_value,
        core_hardness, surface_hardness, microstructure
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      process_name, loading, pasting, pattern_no, shot_blasting, punching,
      temperature, time, case_depth, checking_location, cut_off_value,
      core_hardness, surface_hardness, microstructure
    ]);

    res.status(201).json({ message: "Process created", process_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update process
exports.updateProcess = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      process_name,
      loading,
      pasting,
      pattern_no,
      shot_blasting,
      punching,
      temperature,
      time,
      case_depth,
      checking_location,
      cut_off_value,
      core_hardness,
      surface_hardness,
      microstructure
    } = req.body;

    await pool.query(`
      UPDATE process SET
        process_name = ?, loading = ?, pasting = ?, pattern_no = ?, shot_blasting = ?, punching = ?,
        temperature = ?, time = ?, case_depth = ?, checking_location = ?, cut_off_value = ?,
        core_hardness = ?, surface_hardness = ?, microstructure = ?
      WHERE process_id = ?
    `, [
      process_name, loading, pasting, pattern_no, shot_blasting, punching,
      temperature, time, case_depth, checking_location, cut_off_value,
      core_hardness, surface_hardness, microstructure, id
    ]);

    res.json({ message: "Process updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete process
exports.deleteMultipleProcesses = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided" });
    }

    const [result] = await pool.query(`DELETE FROM process WHERE process_id IN (?)`, [ids]);
    res.json({ message: "Processes deleted", affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search for autocomplete
exports.searchProcesses = async (req, res) => {
  try {
    const q = req.query.q || "";
    const [rows] = await pool.query(
      "SELECT process_id, process_name FROM process WHERE process_name LIKE ? LIMIT 10",
      [`%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
