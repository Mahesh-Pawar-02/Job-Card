const db = require('../config/database')

// Create new inward
exports.createInwardLC = async (req, res) => {
  try {
    const { grn_no, grn_date, supplier_id, challan_no, challan_date, item_id, item_name, process_id, qty } = req.body
    // Insert into DB using user-provided GRN No
    await db.query(
      'INSERT INTO inward_lc_challan (grn_no, grn_date, supplier_id, challan_no, challan_date, item_id, item_name, process_id, qty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [grn_no, grn_date, supplier_id, challan_no, challan_date, item_id, item_name, process_id, qty]
    )
    res.json({ success: true, grn_no })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


