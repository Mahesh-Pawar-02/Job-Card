const { pool } = require('../config/database')

// Get all inwards with pagination and search
exports.getInwardLCChallans = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query
    const offset = (page - 1) * limit
    
    let whereClause = 'WHERE 1=1'
    let params = []
    
    // Search by GRN no
    if (search) {
      whereClause += ' AND grn_no LIKE ?'
      params.push(`%${search}%`)
    }
    
    // Get total count for pagination
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM inward_lc_challan ${whereClause}`,
      params
    )
    const total = countResult[0].total
    
    // Get paginated results
    const [rows] = await pool.query(
      `SELECT id, grn_no, grn_date, supplier_id, challan_no, challan_date, 
              item_id, item_name, process_id, qty, created_at 
       FROM inward_lc_challan ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )
    
    res.json({
      success: true,
      message: `Successfully retrieved ${rows.length} inwards`,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (err) {
    console.error('Error fetching inwards:', err)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch inwards. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
}

// Get specific inward by ID
exports.getInwardLCChallanById = async (req, res) => {
  try {
    const { id } = req.params
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid inward ID provided' 
      })
    }
    
    const [rows] = await pool.query(
      'SELECT id, grn_no, grn_date, supplier_id, challan_no, challan_date, item_id, item_name, process_id, qty, created_at FROM inward_lc_challan WHERE id = ?',
      [id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Inward not found with the provided ID' 
      })
    }
    
    res.json({ 
      success: true, 
      message: 'Inward retrieved successfully',
      data: rows[0] 
    })
  } catch (err) {
    console.error('Error fetching inward by ID:', err)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch inward details. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
}

// Create new inward
exports.createInwardLCChallan = async (req, res) => {
  try {
    const { grn_no, grn_date, supplier_id, challan_no, challan_date, item_id, item_name, process_id, qty } = req.body
    
    // Validate required fields with specific messages
    const requiredFields = [
      { field: 'grn_no', name: 'GRN Number' },
      { field: 'grn_date', name: 'GRN Date' },
      { field: 'supplier_id', name: 'Supplier' },
      { field: 'challan_no', name: 'Challan Number' },
      { field: 'challan_date', name: 'Challan Date' },
      { field: 'item_id', name: 'Item' },
      { field: 'item_name', name: 'Item Name' },
      { field: 'process_id', name: 'Process' },
      { field: 'qty', name: 'Quantity' }
    ]
    
    for (const { field, name } of requiredFields) {
      if (!req.body[field] || (typeof req.body[field] === 'string' && !req.body[field].trim())) {
        return res.status(400).json({ 
          success: false, 
          error: `${name} is required` 
        })
      }
    }
    
    // Validate quantity is positive number
    if (isNaN(qty) || Number(qty) <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity must be a positive number' 
      })
    }
    
    // Check if GRN no already exists
    const [existing] = await pool.query(
      'SELECT id FROM inward_lc_challan WHERE grn_no = ?',
      [grn_no]
    )
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: `GRN Number "${grn_no}" already exists. Please use a different GRN number.` 
      })
    }
    
    // Insert new inward
    const [result] = await pool.query(
      'INSERT INTO inward_lc_challan (grn_no, grn_date, supplier_id, challan_no, challan_date, item_id, item_name, process_id, qty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [grn_no, grn_date, supplier_id, challan_no, challan_date, item_id, item_name, process_id, qty]
    )
    
    res.status(201).json({ 
      success: true, 
      message: `Inward with GRN Number "${grn_no}" created successfully`,
      data: { id: result.insertId, grn_no }
    })
  } catch (err) {
    console.error('Error creating inward:', err)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create inward. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
}

// Update inward
exports.updateInwardLCChallan = async (req, res) => {
  try {
    const { id } = req.params
    const { grn_no, grn_date, supplier_id, challan_no, challan_date, item_id, item_name, process_id, qty } = req.body
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid inward ID provided' 
      })
    }
    
    // Validate required fields with specific messages
    const requiredFields = [
      { field: 'grn_no', name: 'GRN Number' },
      { field: 'grn_date', name: 'GRN Date' },
      { field: 'supplier_id', name: 'Supplier' },
      { field: 'challan_no', name: 'Challan Number' },
      { field: 'challan_date', name: 'Challan Date' },
      { field: 'item_id', name: 'Item' },
      { field: 'item_name', name: 'Item Name' },
      { field: 'process_id', name: 'Process' },
      { field: 'qty', name: 'Quantity' }
    ]
    
    for (const { field, name } of requiredFields) {
      if (!req.body[field] || (typeof req.body[field] === 'string' && !req.body[field].trim())) {
        return res.status(400).json({ 
          success: false, 
          error: `${name} is required` 
        })
      }
    }
    
    // Validate quantity is positive number
    if (isNaN(qty) || Number(qty) <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity must be a positive number' 
      })
    }
    
    // Check if inward exists
    const [existing] = await pool.query(
      'SELECT id, grn_no FROM inward_lc_challan WHERE id = ?',
      [id]
    )
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Inward not found with the provided ID' 
      })
    }
    
    // Check if GRN no already exists for other records
    const [grnCheck] = await pool.query(
      'SELECT id FROM inward_lc_challan WHERE grn_no = ? AND id != ?',
      [grn_no, id]
    )
    
    if (grnCheck.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: `GRN Number "${grn_no}" already exists for another record. Please use a different GRN number.` 
      })
    }
    
    // Update inward
    await pool.query(
      'UPDATE inward_lc_challan SET grn_no = ?, grn_date = ?, supplier_id = ?, challan_no = ?, challan_date = ?, item_id = ?, item_name = ?, process_id = ?, qty = ? WHERE id = ?',
      [grn_no, grn_date, supplier_id, challan_no, challan_date, item_id, item_name, process_id, qty, id]
    )
    
    res.json({ 
      success: true, 
      message: `Inward with GRN Number "${grn_no}" updated successfully`,
      data: { id, grn_no }
    })
  } catch (err) {
    console.error('Error updating inward:', err)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update inward. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
}

// Delete single inward
exports.deleteInwardLCChallan = async (req, res) => {
  try {
    const { id } = req.params
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid inward ID provided' 
      })
    }
    
    // Check if inward exists
    const [existing] = await pool.query(
      'SELECT id, grn_no FROM inward_lc_challan WHERE id = ?',
      [id]
    )
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Inward not found with the provided ID' 
      })
    }
    
    // Delete inward
    await pool.query('DELETE FROM inward_lc_challan WHERE id = ?', [id])
    
    res.json({ 
      success: true, 
      message: `Inward with GRN Number "${existing[0].grn_no}" deleted successfully` 
    })
  } catch (err) {
    console.error('Error deleting inward:', err)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete inward. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
}

// Delete multiple inwards
exports.deleteMultipleInwardLCChallans = async (req, res) => {
  try {
    const { ids } = req.body
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide an array of inward IDs to delete' 
      })
    }
    
    // Validate all IDs are numbers
    if (!ids.every(id => !isNaN(id) && id > 0)) {
      return res.status(400).json({ 
        success: false, 
        error: 'All IDs must be valid positive numbers' 
      })
    }
    
    // Check if all inwards exist
    const [existing] = await pool.query(
      'SELECT id, grn_no FROM inward_lc_challan WHERE id IN (?)',
      [ids]
    )
    
    if (existing.length !== ids.length) {
      return res.status(400).json({ 
        success: false, 
        error: `Some inwards not found. Only ${existing.length} out of ${ids.length} inwards exist.` 
      })
    }
    
    // Delete multiple inwards
    await pool.query('DELETE FROM inward_lc_challan WHERE id IN (?)', [ids])
    
    const grnNumbers = existing.map(item => item.grn_no).join(', ')
    
    res.json({ 
      success: true, 
      message: `Successfully deleted ${ids.length} inwards: ${grnNumbers}` 
    })
  } catch (err) {
    console.error('Error deleting multiple inwards:', err)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete inwards. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
}


