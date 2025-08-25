const { pool } = require('../config/database.js');

/**
 * Create Inward with parts
 * req.body = {
 *   customer_id: 1,
 *   inward_date: "2025-08-25",
 *   parts: [{ part_id: 1, qty: 34 }, { part_id: 2, qty: 567 }]
 * }
 */
exports.createInward = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { customer_id, inward_date, parts } = req.body;

    await connection.beginTransaction();

    // Insert Inward
    const [inwardResult] = await connection.query(
      'INSERT INTO Inward (inward_date, customer_id) VALUES (?, ?)',
      [inward_date, customer_id]
    );
    const inwardId = inwardResult.insertId;

    // Insert Inward-Part records
    for (const part of parts) {
      await connection.query(
        'INSERT INTO InwardPart (inward_id, part_id, qty) VALUES (?, ?, ?)',
        [inwardId, part.part_id, part.qty]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Inward created successfully', inwardId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error creating inward', error: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Get all inwards with customer + parts
 */
exports.getAllInwards = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.inward_id, i.inward_date, i.customer_id, c.customer_name,
             p.part_id, p.part_name, ip.qty
      FROM Inward i
      JOIN Customer c ON i.customer_id = c.customer_id
      JOIN InwardPart ip ON i.inward_id = ip.inward_id
      JOIN Part p ON ip.part_id = p.part_id
      ORDER BY i.inward_id DESC
    `);

    // Group data by inward_id
    const inwards = {};
    rows.forEach(row => {
      if (!inwards[row.inward_id]) {
        inwards[row.inward_id] = {
          inward_id: row.inward_id,
          inward_date: row.inward_date,
          customer_id: row.customer_id,
          customer_name: row.customer_name,
          parts: []
        };
      }
      inwards[row.inward_id].parts.push({
        part_id: row.part_id,
        part_name: row.part_name,
        qty: row.qty
      });
    });

    res.json(Object.values(inwards));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inwards', error: error.message });
  }
};

/**
 * Get single inward by ID with customer + parts
 */
exports.getInwardById = async (req, res) => {
  try {
    const inwardId = req.params.id;

    const [rows] = await pool.query(`
      SELECT i.inward_id, i.inward_date, c.customer_id, c.customer_name,
             p.part_id, p.part_name, ip.qty
      FROM Inward i
      JOIN Customer c ON i.customer_id = c.customer_id
      JOIN InwardPart ip ON i.inward_id = ip.inward_id
      JOIN Part p ON ip.part_id = p.part_id
      WHERE i.inward_id = ?
    `, [inwardId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Inward not found' });
    }

    // Group data (one inward with multiple parts)
    const inward = {
      inward_id: rows[0].inward_id,
      inward_date: rows[0].inward_date,
      customer_id: rows[0].customer_id,
      customer_name: rows[0].customer_name,
      parts: []
    };

    rows.forEach(row => {
      inward.parts.push({
        part_id: row.part_id,
        part_name: row.part_name,
        qty: row.qty
      });
    });

    res.json(inward);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inward', error: error.message });
  }
};


/**
 * Update Inward (date, customer, parts)
 */
exports.updateInward = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const inwardId = req.params.id;
    const { customer_id, inward_date, parts } = req.body;

    await connection.beginTransaction();

    // Update inward
    await connection.query(
      'UPDATE Inward SET inward_date = ?, customer_id = ? WHERE inward_id = ?',
      [inward_date, customer_id, inwardId]
    );

    // Delete old parts
    await connection.query('DELETE FROM InwardPart WHERE inward_id = ?', [inwardId]);

    // Insert new parts
    for (const part of parts) {
      await connection.query(
        'INSERT INTO InwardPart (inward_id, part_id, qty) VALUES (?, ?, ?)',
        [inwardId, part.part_id, part.qty]
      );
    }

    await connection.commit();
    res.json({ message: 'Inward updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error updating inward', error: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Delete multiple inwards
 * req.body = { ids: [1, 2, 3] }
 */
exports.deleteInwards = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: 'No IDs provided' });
    }

    await connection.beginTransaction();

    // Delete from InwardPart first (foreign key constraint)
    await connection.query(
      `DELETE FROM InwardPart WHERE inward_id IN (?)`,
      [ids]
    );

    // Delete from Inward
    await connection.query(
      `DELETE FROM Inward WHERE inward_id IN (?)`,
      [ids]
    );

    await connection.commit();
    res.json({ message: 'Inwards deleted successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error deleting inwards', error: error.message });
  } finally {
    connection.release();
  }
};

