const { pool } = require('../config/database.js');
const path = require('path');
const fs = require('fs');

// helper: '' -> null
const toNull = (v) => (v === undefined || v === '' ? null : v);

// helper: from multer files to 'uploads/parts/<filename>' (URL-friendly)
const getStoredPath = (file) =>
  file ? path.posix.join('uploads', 'parts', file.filename) : null;
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
    const [results] = await pool.query(`
  SELECT p.part_id, p.part_name, p.part_no, c.customer_name 
  FROM part p
  LEFT JOIN customer c ON p.customer_id = c.customer_id
`);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parts' });
  }
};

// Get one part by id
exports.getPartById = async (req, res) => {
  const id = req.params.id;
  try {
    const [results] = await pool.query(`
      SELECT p.*, c.customer_name 
      FROM part p
      LEFT JOIN customer c ON p.customer_id = c.customer_id
      WHERE p.part_id = ?
    `, [id]);

    if (results.length === 0) return res.status(404).json({ message: 'Part not found' });
    res.json(results[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch part' });
  }
};

// Create a new part
// Create a new part (multipart/form-data)
exports.createPart = async (req, res) => {
  try {
    // files from multer
    const img1 = req.files?.img_1?.[0] || null;
    const img2 = req.files?.img_2?.[0] || null;

    // store URL-facing relative paths
    const img_1 = getStoredPath(img1);
    const img_2 = getStoredPath(img2);

    // text fields come from req.body (strings)
    const {
      customer_id,
      part_name,
      part_no,
      material,
      weight,
      process,
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
      microstructure,
      furnace_capacity,
      batch_qty,
      total_part_weight,
      drg,
      broach_spline,
      anti_carb_paste,
      hard_temp,
      rpm
    } = req.body;

    const [result] = await pool.query(
      `
      INSERT INTO part (
        customer_id, part_name, part_no, material, weight, process, loading, pasting, 
        pattern_no, shot_blasting, punching, temperature, time, case_depth, checking_location, 
        cut_off_value, core_hardness, surface_hardness, microstructure, furnace_capacity, 
        batch_qty, total_part_weight, drg, broach_spline, anti_carb_paste, hard_temp, rpm,
        img_1, img_2
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        toNull(customer_id), toNull(part_name), toNull(part_no), toNull(material), toNull(weight),
        toNull(process), toNull(loading), toNull(pasting), toNull(pattern_no), toNull(shot_blasting),
        toNull(punching), toNull(temperature), toNull(time), toNull(case_depth), toNull(checking_location),
        toNull(cut_off_value), toNull(core_hardness), toNull(surface_hardness), toNull(microstructure),
        toNull(furnace_capacity), toNull(batch_qty), toNull(total_part_weight), toNull(drg),
        toNull(broach_spline), toNull(anti_carb_paste), toNull(hard_temp), toNull(rpm),
        img_1, img_2
      ]
    );

    res.status(201).json({
      message: 'Part created successfully',
      part_id: result.insertId
    });
  } catch (error) {
    console.error(error);
    // optional: handle foreign key errors, etc.
    res.status(500).json({ error: 'Failed to create part' });
  }
};

// Update a part by id
// Update a part by id (multipart/form-data)
exports.updatePart = async (req, res) => {
  const id = req.params.id;

  try {
    // load existing paths so we can keep them if no new file is sent
    const [existingRows] = await pool.query(
      `SELECT img_1, img_2 FROM part WHERE part_id = ?`,
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Part not found' });
    }
    const current = existingRows[0];

    const newImg1 = req.files?.img_1?.[0] || null;
    const newImg2 = req.files?.img_2?.[0] || null;

    const img_1 = newImg1 ? getStoredPath(newImg1) : current.img_1;
    const img_2 = newImg2 ? getStoredPath(newImg2) : current.img_2;

    // If you want to delete old files when replaced, uncomment:
    // const tryUnlink = (p) => p && fs.existsSync(p) && fs.unlink(p, () => {});
    // if (newImg1 && current.img_1) tryUnlink(path.join(__dirname, '..', current.img_1));
    // if (newImg2 && current.img_2) tryUnlink(path.join(__dirname, '..', current.img_2));

    const {
      customer_id,
      part_name,
      part_no,
      material,
      weight,
      process,
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
      microstructure,
      furnace_capacity,
      batch_qty,
      total_part_weight,
      drg,
      broach_spline,
      anti_carb_paste,
      hard_temp,
      rpm
    } = req.body;

    const [result] = await pool.query(
      `
      UPDATE part SET
        customer_id = ?, part_name = ?, part_no = ?, material = ?, weight = ?, process = ?, 
        loading = ?, pasting = ?, pattern_no = ?, shot_blasting = ?, punching = ?, 
        temperature = ?, time = ?, case_depth = ?, checking_location = ?, cut_off_value = ?, 
        core_hardness = ?, surface_hardness = ?, microstructure = ?, furnace_capacity = ?, 
        batch_qty = ?, total_part_weight = ?, drg = ?, broach_spline = ?, anti_carb_paste = ?, 
        hard_temp = ?, rpm = ?, img_1 = ?, img_2 = ?
      WHERE part_id = ?
      `,
      [
        toNull(customer_id), toNull(part_name), toNull(part_no), toNull(material), toNull(weight),
        toNull(process), toNull(loading), toNull(pasting), toNull(pattern_no), toNull(shot_blasting),
        toNull(punching), toNull(temperature), toNull(time), toNull(case_depth), toNull(checking_location),
        toNull(cut_off_value), toNull(core_hardness), toNull(surface_hardness), toNull(microstructure),
        toNull(furnace_capacity), toNull(batch_qty), toNull(total_part_weight), toNull(drg),
        toNull(broach_spline), toNull(anti_carb_paste), toNull(hard_temp), toNull(rpm),
        img_1, img_2, id
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Part not found' });
    res.json({ message: 'Part updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update part' });
  }
};

// Delete multiple parts by ids
exports.deleteMultipleParts = async (req, res) => {
  const { ids } = req.body; // array of ids to delete
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
  try {
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await pool.query(`DELETE FROM part WHERE part_id IN (${placeholders})`, ids);
    res.json({ message: `${result.affectedRows} parts deleted` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete parts' });
  }
};

