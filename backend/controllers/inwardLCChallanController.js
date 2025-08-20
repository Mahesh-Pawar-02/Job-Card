const { pool } = require('../config/database');

async function computeNextGrnNo() {
  const [rows] = await pool.query("SELECT LPAD(COALESCE(MAX(CAST(grn_no AS UNSIGNED)), 0) + 1, 3, '0') AS next_grn_no FROM inward_lc_challan");
  return rows[0]?.next_grn_no || '001';
}

async function createInwardLCChallan(req, res) {
  try {
    const {
      grn_no, // ignored; server computes authoritative number
      grn_date,
      supplier_id,
      challan_no,
      challan_date,
      item_id,
      item_name,
      process_id,
      qty,
    } = req.body;

    let finalGrnNo;
    try {
      finalGrnNo = await computeNextGrnNo();
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }

    if (!finalGrnNo || !grn_date || !supplier_id || !item_id || !qty) {
      return res.status(400).json({ error: 'grn_no (auto), grn_date, supplier_id, item_id and qty are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO inward_lc_challan (grn_no, grn_date, supplier_id, challan_no, challan_date, item_id, item_name, process_id, qty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalGrnNo, grn_date, supplier_id, challan_no || null, challan_date || null, item_id, item_name || null, process_id || null, qty]
    );

    res.status(201).json({ id: result.insertId, grn_no: finalGrnNo, grn_date, supplier_id, challan_no, challan_date, item_id, item_name, process_id, qty });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getInwardLCChallans(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM inward_lc_challan ORDER BY CAST(grn_no AS UNSIGNED) ASC, id ASC');
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

    const [result] = await pool.query(
      `UPDATE inward_lc_challan
       SET grn_no = ?, grn_date = ?, supplier_id = ?, challan_no = ?, challan_date = ?, item_id = ?, item_name = ?, process_id = ?, qty = ?
       WHERE id = ?`,
      [grn_no, grn_date, supplier_id, challan_no || null, challan_date || null, item_id, item_name || null, process_id || null, qty, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ id: Number(id), grn_no, grn_date, supplier_id, challan_no, challan_date, item_id, item_name, process_id, qty });
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

module.exports.updateInwardLCChallan = updateInwardLCChallan;
module.exports.deleteInwardLCChallan = deleteInwardLCChallan;


