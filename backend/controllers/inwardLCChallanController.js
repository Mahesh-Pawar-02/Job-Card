const { pool } = require('../config/database');

async function computeNextGrnNo() {
  // Use sequence table to avoid reuse after deletions
  try {
    const [res] = await pool.query('INSERT INTO inward_lc_grn_seq VALUES ()');
    const nextNumeric = res.insertId;
    return String(nextNumeric).padStart(3, '0');
  } catch (e) {
    // Fallback to old method if sequence table missing
    const [rows] = await pool.query("SELECT LPAD(COALESCE(MAX(CAST(grn_no AS UNSIGNED)), 0) + 1, 3, '0') AS next_grn_no FROM inward_lc_challan");
    return rows[0]?.next_grn_no || '001';
  }
}

async function createInwardLCChallan(req, res) {
  try {
    const {
      grn_no,
      grn_date,
      supplier_id,
      challan_no,
      challan_date,
      item_id,
      item_name,
      process_id,
      qty,
    } = req.body;

    // Use provided GRN number if present; otherwise compute next
    let finalGrnNo = (grn_no && String(grn_no).trim()) ? String(grn_no).trim() : null;
    if (!finalGrnNo) {
      try {
        finalGrnNo = await computeNextGrnNo();
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    }

    if (!finalGrnNo || !grn_date || !supplier_id || !item_id || !qty) {
      return res.status(400).json({ error: 'grn_no (auto), grn_date, supplier_id, item_id and qty are required' });
    }

    // Ensure dates are in YYYY-MM-DD format
    const formattedGrnDate = grn_date ? grn_date.split('T')[0] : null;
    const formattedChallanDate = challan_date ? challan_date.split('T')[0] : null;

    const [result] = await pool.query(
      `INSERT INTO inward_lc_challan (grn_no, grn_date, supplier_id, challan_no, challan_date, item_id, item_name, process_id, qty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalGrnNo, formattedGrnDate, supplier_id, challan_no || null, formattedChallanDate, item_id, item_name || null, process_id || null, qty]
    );

    res.status(201).json({ id: result.insertId, grn_no: finalGrnNo, grn_date: formattedGrnDate, supplier_id, challan_no, challan_date: formattedChallanDate, item_id, item_name, process_id, qty });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getInwardLCChallans(req, res) {
  try {
    // Group by GRN and aggregate parts
    const [rows] = await pool.query(`
      SELECT 
        grn_no,
        grn_date,
        supplier_id,
        challan_no,
        challan_date,
        GROUP_CONCAT(
          CONCAT(
            'Item: ', COALESCE(item_name, ''), 
            ' | Process: ', COALESCE((SELECT process_name FROM process_master WHERE id = inward_lc_challan.process_id), ''),
            ' | Qty: ', qty
          ) SEPARATOR '; '
        ) as parts_details,
        COUNT(*) as total_parts,
        SUM(qty) as total_qty
      FROM inward_lc_challan 
      GROUP BY grn_no, grn_date, supplier_id, challan_no, challan_date
      ORDER BY CAST(grn_no AS UNSIGNED) ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getInwardLCChallanById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM inward_lc_challan WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getNextGrnNo(req, res) {
  try {
    const next = await computeNextGrnNo();
    res.json({ next_grn_no: next });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createInwardLCChallan,
  getInwardLCChallans,
  getInwardLCChallanById,
  getNextGrnNo,
};

async function updateInwardLCChallan(req, res) {
  try {
    const { id } = req.params;
    const {
      grn_no,
      grn_date,
      supplier_id,
      challan_no,
      challan_date,
      item_id,
      item_name,
      process_id,
      qty,
    } = req.body;

    // Ensure dates are in YYYY-MM-DD format
    const formattedGrnDate = grn_date ? grn_date.split('T')[0] : null;
    const formattedChallanDate = challan_date ? challan_date.split('T')[0] : null;

    const [result] = await pool.query(
      `UPDATE inward_lc_challan
       SET grn_no = ?, grn_date = ?, supplier_id = ?, challan_no = ?, challan_date = ?, item_id = ?, item_name = ?, process_id = ?, qty = ?
       WHERE id = ?`,
      [grn_no, formattedGrnDate, supplier_id, challan_no || null, formattedChallanDate, item_id, item_name || null, process_id || null, qty, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ id: Number(id), grn_no, grn_date: formattedGrnDate, supplier_id, challan_no, challan_date: formattedChallanDate, item_id, item_name, process_id, qty });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteInwardLCChallan(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM inward_lc_challan WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteInwardLCChallanByGrn(req, res) {
  try {
    const { grn_no } = req.params;
    const [result] = await pool.query('DELETE FROM inward_lc_challan WHERE grn_no = ?', [grn_no]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'GRN not found' });
    res.json({ message: `Deleted ${result.affectedRows} parts for GRN ${grn_no}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports.updateInwardLCChallan = updateInwardLCChallan;
module.exports.deleteInwardLCChallan = deleteInwardLCChallan;
module.exports.deleteInwardLCChallanByGrn = deleteInwardLCChallanByGrn;


