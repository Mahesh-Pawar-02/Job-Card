const { pool } = require("../config/database")
const path = require("path");
const fs = require("fs");

function normalizeJSON(input) {
  if (input == null || input === "") return null;
  try {
    if (typeof input === "string") return JSON.stringify(JSON.parse(input));
    return JSON.stringify(input);
  } catch {
    return JSON.stringify(input);
  }
}

function safeUnlink(relPath) {
  if (!relPath) return;
  const filePath = path.join("uploads/parts", relPath);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("File delete error:", filePath, err);
    }
  });
}

// Get all parts
exports.getAllParts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        c.customer_name,
        c.customer_id,
        pr.process_name,
        pr.process_id
      FROM part p
      JOIN customer c ON p.customer_id = c.customer_id
      JOIN process pr ON p.process_id = pr.process_id
    `);
    res.json(rows);
  } catch (err) {
    console.error("GetAllParts Error:", err);
    res.status(500).json({ error: "Failed to fetch parts list. Please try again." });
  }
};

// Get part details
exports.getPartById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        p.id AS part_id,
        p.name AS part_name,
        p.no AS part_no,
        p.material,
        p.weight,
        p.furnace_capacity,
        p.batch_qty,
        p.total_part_weight,
        p.drg,
        p.drawing,
        p.part_image,
        p.charge_image,
        p.broach_spline,
        p.anti_carb_paste,
        p.hard_temp,
        p.rpm,
        p.loading_pattern,
        p.pasting,
        p.pattern_no,
        p.shot_blasting,
        p.punching,
        p.tempering_temp,
        p.soaking_time,
        p.case_depth,
        p.checking_location,
        p.cut_off_value,
        p.core_hardness,
        p.surface_hardness,
        p.microstructure,
        c.customer_name,
        c.customer_id,
        pr.*
      FROM part p
      JOIN customer c ON p.customer_id = c.customer_id
      JOIN process pr ON p.process_id = pr.process_id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Part not found with given ID." });
    }

    const part = rows[0];
    if (part.microstructure) {
      try {
        part.microstructure = JSON.parse(part.microstructure);
      } catch {
        part.microstructure = null;
      }
    }
    res.json(part);
  } catch (err) {
    console.error("GetPartById Error:", err);
    res.status(500).json({ error: "Failed to fetch part details." });
  }
};

// Search parts
exports.searchParts = async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q.trim()) {
      return res.status(400).json({ error: "Search query cannot be empty." });
    }

    const [rows] = await pool.query(`
      SELECT 
        p.id AS part_id,
        p.name AS part_name,
        p.no AS part_no,
        c.customer_name
      FROM part p
      JOIN customer c ON p.customer_id = c.customer_id
      WHERE p.name LIKE ? OR p.no LIKE ?
      LIMIT 10
    `, [`%${q}%`, `%${q}%`]);

    res.json(rows);
  } catch (err) {
    console.error("SearchParts Error:", err);
    res.status(500).json({ error: "Failed to search parts." });
  }
};

exports.searchParts = async (req, res) => {
  try {
    const q = req.query.q || "";
    const [rows] = await pool.query(`
      SELECT p.id AS part_id, p.name AS part_name, p.no AS part_no, c.customer_name
      FROM part p
      JOIN customer c ON p.customer_id = c.customer_id
      WHERE p.name LIKE ? OR p.no LIKE ?
      LIMIT 10
    `, [`%${q}%`, `%${q}%`]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create part
exports.createPart = async (req, res) => {
  try {
    const { name, no } = req.body;
    if (!name || !no) {
      return res.status(400).json({ error: "Part name and number are required." });
    }

    const {
      customer_id,
      process_id,
      // basics 
      material,
      weight,
      furnace_capacity, // optional; default 600kg at DB 
      batch_qty,
      total_part_weight,
      drg,
      broach_spline,
      anti_carb_paste,
      hard_temp,
      rpm,
      // new process-related 
      loading_pattern,
      pasting,
      pattern_no,
      shot_blasting,
      punching,
      tempering_temp,
      soaking_time,
      case_depth,
      checking_location,
      cut_off_value,
      core_hardness,
      surface_hardness,
      microstructure, // JSON (case/core etc.) 
    } = req.body;

    const part_image = req.files?.part_image?.[0]?.filename || null;
    const charge_image = req.files?.charge_image?.[0]?.filename || null;
    const drawing = req.files?.drawing?.[0]?.filename || null;

    const microJSON = normalizeJSON(microstructure);
    const [result] = await pool.query(
      `INSERT INTO part (
    customer_id, process_id, loading_pattern, pasting, pattern_no, shot_blasting, punching,
    tempering_temp, soaking_time, case_depth, checking_location, cut_off_value,
    core_hardness, surface_hardness, microstructure, name, no, material,
    weight, furnace_capacity, batch_qty, total_part_weight, drg, drawing,
    broach_spline, anti_carb_paste, hard_temp, rpm, part_image, charge_image
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_id ?? null,
        process_id ?? null,
        loading_pattern ?? null,
        pasting ?? null,
        pattern_no ?? null,
        shot_blasting ?? null,
        punching ?? null,
        tempering_temp ?? null,
        soaking_time ?? null,
        case_depth ?? null,
        checking_location ?? null,
        cut_off_value ?? null,
        core_hardness ?? null,
        surface_hardness ?? null,
        microJSON,
        name,
        no,
        material ?? null,
        weight ?? null,
        furnace_capacity ?? null,
        batch_qty ?? null,
        total_part_weight ?? null,
        drg ?? null,
        drawing,
        broach_spline ?? null,
        anti_carb_paste ?? null,
        hard_temp ?? null,
        rpm ?? null,
        part_image,
        charge_image,
      ]
    );
    res.json({ message: "Part created", id: result.insertId });
  } catch (err) {
    console.error("CreatePart Error:", err);
    res.status(500).json({ error: `Failed to create part. ${err.message}` });
  }
};

// Update part
exports.updatePart = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Part ID is required for update." });

    const {
      customer_id,
      process_id,
      name,
      no,
      material,
      weight,
      furnace_capacity,
      batch_qty,
      total_part_weight,
      drg,
      broach_spline,
      anti_carb_paste,
      hard_temp,
      rpm,
      loading_pattern,
      pasting,
      pattern_no,
      shot_blasting,
      punching,
      tempering_temp,
      soaking_time,
      case_depth,
      checking_location,
      cut_off_value,
      core_hardness,
      surface_hardness,
      microstructure,
    } = req.body;

    const newPartImage = req.files?.part_image?.[0]?.filename || null;
    const newChargeImage = req.files?.charge_image?.[0]?.filename || null;
    const newDrawing = req.files?.drawing?.[0]?.filename || null;

    // 1) Fetch existing file names
    const [rows] = await pool.query(
      `SELECT part_image, charge_image, drawing FROM part WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Part not found" });
    }

    const old = rows[0];

    // 2) Delete old files safely if new files uploaded
    if (newPartImage && old.part_image) {
      safeUnlink(old.part_image);
    }
    if (newChargeImage && old.charge_image) {
      safeUnlink(old.charge_image);
    }
    if (newDrawing && old.drawing) {
      safeUnlink(old.drawing);
    }

    // Normalize microstructure JSON if needed (define normalizeJSON function)
    const microJSON = normalizeJSON(microstructure);

    // 3) Update DB (conditionally update files if new ones uploaded)
    await pool.query(
      `
  UPDATE part SET
    customer_id = ?,
    process_id = ?,
    loading_pattern = ?,
    pasting = ?,
    pattern_no = ?,
    shot_blasting = ?,
    punching = ?,
    tempering_temp = ?,
    soaking_time = ?,
    case_depth = ?,
    checking_location = ?,
    cut_off_value = ?,
    core_hardness = ?,
    surface_hardness = ?,
    microstructure = ?,
    name = ?,
    no = ?,
    material = ?,
    weight = ?,
    furnace_capacity = ?,
    batch_qty = ?,
    total_part_weight = ?,
    drg = ?,
    drawing = COALESCE(?, drawing),
    broach_spline = ?,
    anti_carb_paste = ?,
    hard_temp = ?,
    rpm = ?,
    part_image = COALESCE(?, part_image),
    charge_image = COALESCE(?, charge_image)
  WHERE id = ?
  `,
      [
        customer_id ?? null,
        process_id ?? null,
        loading_pattern ?? null,
        pasting ?? null,
        pattern_no ?? null,
        shot_blasting ?? null,
        punching ?? null,
        tempering_temp ?? null,
        soaking_time ?? null,
        case_depth ?? null,
        checking_location ?? null,
        cut_off_value ?? null,
        core_hardness ?? null,
        surface_hardness ?? null,
        microJSON,
        name,
        no,
        material ?? null,
        weight ?? null,
        furnace_capacity ?? null,
        batch_qty ?? null,
        total_part_weight ?? null,
        drg ?? null,
        newDrawing,       // Only update if newDrawing exists, else keep old
        broach_spline ?? null,
        anti_carb_paste ?? null,
        hard_temp ?? null,
        rpm ?? null,
        newPartImage,     // Update part_image only if new uploaded
        newChargeImage,   // Update charge_image only if new uploaded
        id,
      ]
    );

    res.json({ message: "Part updated successfully" });
  } catch (err) {
    console.error("UpdatePart Error:", err);
    res.status(500).json({ error: `Failed to update part. ${err.message}` });
  }
};

// Delete multiple parts
exports.deleteMultipleParts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Please provide valid part IDs to delete." });
    }

    // तुझं delete code जसंच्या तसं...

    res.json({ message: `Deleted ${result.affectedRows} part(s) successfully` });
  } catch (err) {
    console.error("DeleteParts Error:", err);
    res.status(500).json({ error: "Failed to delete parts." });
  }
};
