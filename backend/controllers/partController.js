const {pool} = require("../config/database");
const fs = require("fs");
const path = require("path")

// Get all parts (list view)
exports.getAllParts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.part_id, p.part_name, p.part_no, c.customer_name
      FROM part p
      JOIN customer c ON p.customer_id = c.customer_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get part details (view page)
exports.getPartById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT p.*, c.customer_name, pr.*
      FROM part p
      JOIN customer c ON p.customer_id = c.customer_id
      JOIN process pr ON p.process_id = pr.process_id
      WHERE p.part_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Part not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search parts (for autocomplete or search bar)
exports.searchParts = async (req, res) => {
  try {
    const q = req.query.q || "";
    const [rows] = await pool.query(`
      SELECT p.part_id, p.part_name, p.part_no, c.customer_name
      FROM part p
      JOIN customer c ON p.customer_id = c.customer_id
      WHERE p.part_name LIKE ? OR p.part_no LIKE ?
      LIMIT 10
    `, [`%${q}%`, `%${q}%`]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new part
exports.createPart = async (req, res) => {
  try {
    const {
      customer_id,
      process_id,
      part_name,
      part_no,
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
    } = req.body;

    // Handle images (Multer saves them in uploads/parts)
    const image1 = req.files["image1"] ? req.files["image1"][0].filename : null;
    const image2 = req.files["image2"] ? req.files["image2"][0].filename : null;

    const [result] = await pool.query(
      `INSERT INTO part 
      (customer_id, process_id, part_name, part_no, material, weight, furnace_capacity, batch_qty, total_part_weight, drg, broach_spline, anti_carb_paste, hard_temp, rpm, image1, image2)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_id,
        process_id,
        part_name,
        part_no,
        material,
        weight || null,
        furnace_capacity,
        batch_qty || null,
        total_part_weight || null,
        drg,
        broach_spline,
        anti_carb_paste,
        hard_temp || null,
        rpm || null,
        image1,
        image2,
      ]
    );

    res.json({ message: "Part created", part_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create part" });
  }
};

// Update part
exports.updatePart = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_id,
      process_id,
      part_name,
      part_no,
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
    } = req.body;

    // Handle new uploads (Multer saves them in uploads/parts)
    const newImage1 = req.files["image1"] ? req.files["image1"][0].filename : null;
    const newImage2 = req.files["image2"] ? req.files["image2"][0].filename : null;

    // 1️⃣ Fetch current images
    const [rows] = await pool.query(
      `SELECT image1, image2 FROM part WHERE part_id=?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Part not found" });
    }
    const oldPart = rows[0];

    // 2️⃣ If new images uploaded → delete old ones safely
    if (newImage1 && oldPart.image1) {
      const oldPath = path.join("uploads/parts", oldPart.image1);
      fs.unlink(oldPath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Error deleting old image1:", oldPath, err);
        }
      });
    }
    if (newImage2 && oldPart.image2) {
      const oldPath = path.join("uploads/parts", oldPart.image2);
      fs.unlink(oldPath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Error deleting old image2:", oldPath, err);
        }
      });
    }

    // 3️⃣ Update DB
    await pool.query(
      `UPDATE part 
       SET customer_id=?, process_id=?, part_name=?, part_no=?, material=?, weight=?, furnace_capacity=?, batch_qty=?, total_part_weight=?, drg=?, broach_spline=?, anti_carb_paste=?, hard_temp=?, rpm=?, 
           image1=COALESCE(?, image1), image2=COALESCE(?, image2)
       WHERE part_id=?`,
      [
        customer_id,
        process_id,
        part_name,
        part_no,
        material,
        weight || null,
        furnace_capacity,
        batch_qty || null,
        total_part_weight || null,
        drg,
        broach_spline,
        anti_carb_paste,
        hard_temp || null,
        rpm || null,
        newImage1,
        newImage2,
        id,
      ]
    );

    res.json({ message: "Part updated" });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Failed to update part" });
  }
};

// Delete multiple parts (or single)
exports.deleteMultipleParts = async (req, res) => {
  try {
    const { ids } = req.body; // expects { ids: [1, 2, 3] }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided" });
    }

    // 1️⃣ Get old images for these parts
    const [rows] = await pool.query(
      `SELECT image1, image2 FROM part WHERE part_id IN (?)`,
      [ids]
    );

    // 2️⃣ Delete files from uploads/parts (safe mode)
    rows.forEach((part) => {
      ["image1", "image2"].forEach((field) => {
        if (part[field]) {
          const filePath = path.join("uploads/parts", part[field]);
          fs.unlink(filePath, (err) => {
            if (err && err.code !== "ENOENT") {
              console.error("Error deleting file:", filePath, err);
            }
          });
        }
      });
    });

    // 3️⃣ Delete DB rows
    const [result] = await pool.query(
      `DELETE FROM part WHERE part_id IN (?)`,
      [ids]
    );

    res.json({ message: "Parts deleted", affectedRows: result.affectedRows });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: err.message });
  }
};
