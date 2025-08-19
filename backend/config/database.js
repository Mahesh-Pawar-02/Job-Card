require('dotenv').config();
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mahesh@7846',
  database: process.env.DB_NAME || 'jobcard_db',
  port: process.env.DB_PORT || 3306
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Create party_master table if not exists
const createPartyMasterTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS party_master (
      id INT AUTO_INCREMENT PRIMARY KEY,
      party_name VARCHAR(100),
      party_type VARCHAR(50),
      vendor_code VARCHAR(50),
      address VARCHAR(255),
      telephone_nos VARCHAR(50),
      email VARCHAR(100),
      contact_person VARCHAR(100),
      legal_name VARCHAR(100),
      trade_name VARCHAR(100),
      pan VARCHAR(20),
      tcs_applicable CHAR(1),
      trans_catg VARCHAR(20),
      gstin VARCHAR(20),
      state VARCHAR(50),
      ac_ledger_name VARCHAR(100),
      place VARCHAR(100),
      pin VARCHAR(10),
      distance_km INT,
      country_code VARCHAR(10),
      port_code VARCHAR(10),
      currency_code VARCHAR(10),
      ledger_name_tally VARCHAR(100)
    );
  `;
  try {
    const connection = await pool.getConnection();
    await connection.query(createTableSQL);
    console.log('✅ party_master table checked/created.');
    connection.release();
  } catch (error) {
    console.error('❌ Error creating party_master table:', error.message);
  }
};

module.exports = {
  pool,
  testConnection,
  createPartyMasterTable,
  // New: process master helpers
  createProcessMasterTable: async () => {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS process_master (
        id INT AUTO_INCREMENT PRIMARY KEY,
        process_code VARCHAR(20) UNIQUE,
        process_name VARCHAR(150)
      );
    `;
    try {
      const connection = await pool.getConnection();
      await connection.query(createTableSQL);
      console.log('✅ process_master table checked/created.');
      connection.release();
    } catch (error) {
      console.error('❌ Error creating process_master table:', error.message);
    }
  },
  seedProcessMaster: async () => {
    // Ensure default processes exist
    const defaults = [
      ['CHT', 'Carburizing Hardneing & Tempering'],
      ['HT', 'Hardening and Tempering'],
      ['OC', 'Only Carburizing'],
      ['Shot Blasting', 'Shot Blasting'],
      ['CHT+Shot Blasting', 'CHT + Shot Blasting']
    ];
    try {
      const connection = await pool.getConnection();
      // Use INSERT IGNORE relying on UNIQUE(process_code)
      const valuesSql = defaults.map(() => '(?, ?)').join(',');
      const flatValues = defaults.flat();
      await connection.query(
        `INSERT IGNORE INTO process_master (process_code, process_name) VALUES ${valuesSql}`,
        flatValues
      );
      console.log('✅ process_master seeded with default values (if missing).');
      connection.release();
    } catch (error) {
      console.error('❌ Error seeding process_master:', error.message);
    }
  }
  ,
  // Item master table
  createItemMasterTable: async () => {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS item_master (
        id INT AUTO_INCREMENT PRIMARY KEY,
        part_number VARCHAR(100) UNIQUE,
        part_name VARCHAR(255),
        stock_unit VARCHAR(50),
        rate_per_kg DECIMAL(12,2),
        weight DECIMAL(12,3),
        surface_hardness VARCHAR(50),
        core_hardness VARCHAR(50),
        case_depth VARCHAR(50),
        material VARCHAR(100),
        batch_qty INT,
        loading VARCHAR(100),
        broach_spline VARCHAR(100),
        anti_carb_paste VARCHAR(100),
        pattern_no VARCHAR(100),
        rpm INT,
        shot_blasting VARCHAR(20),
        punching VARCHAR(20)
      );
    `;
    try {
      const connection = await pool.getConnection();
      await connection.query(createTableSQL);
      console.log('✅ item_master table checked/created.');
      connection.release();
    } catch (error) {
      console.error('❌ Error creating item_master table:', error.message);
    }
  }
  ,
  // Unit master table and seeders
  createUnitMasterTable: async () => {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS unit_master (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unit_code VARCHAR(20) UNIQUE,
        unit_name VARCHAR(100)
      );
    `;
    try {
      const connection = await pool.getConnection();
      await connection.query(createTableSQL);
      console.log('✅ unit_master table checked/created.');
      connection.release();
    } catch (error) {
      console.error('❌ Error creating unit_master table:', error.message);
    }
  },
  seedUnitMaster: async () => {
    const defaults = [
      ['KG', 'Kilograms'],
      ['NOS', 'Numbers']
    ];
    try {
      const connection = await pool.getConnection();
      const valuesSql = defaults.map(() => '(?, ?)').join(',');
      const flatValues = defaults.flat();
      await connection.query(
        `INSERT IGNORE INTO unit_master (unit_code, unit_name) VALUES ${valuesSql}`,
        flatValues
      );
      console.log('✅ unit_master seeded with default values (if missing).');
      connection.release();
    } catch (error) {
      console.error('❌ Error seeding unit_master:', error.message);
    }
  }
  ,
  // State master table and seeders
  createStateMasterTable: async () => {
    // Ensure table exists
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS state_master (
        id INT AUTO_INCREMENT PRIMARY KEY,
        state_code VARCHAR(10) UNIQUE,
        state_name VARCHAR(100)
      );
    `;
    try {
      const connection = await pool.getConnection();
      await connection.query(createTableSQL);

      // Ensure gst_state_code column exists (compatible with MySQL versions without IF NOT EXISTS)
      const [cols] = await connection.query("SHOW COLUMNS FROM state_master LIKE 'gst_state_code'");
      if (cols.length === 0) {
        await connection.query('ALTER TABLE state_master ADD COLUMN gst_state_code INT');
      }

      // Ensure unique index on gst_state_code exists
      const [indexes] = await connection.query(
        "SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'state_master' AND INDEX_NAME = 'ux_state_master_gst_code'"
      );
      if (indexes.length === 0) {
        try {
          await connection.query('CREATE UNIQUE INDEX ux_state_master_gst_code ON state_master (gst_state_code)');
        } catch (_) {
          // Ignore if concurrent creation or version-specific differences
        }
      }

      console.log('✅ state_master table checked/created (gst_state_code ensured).');
      connection.release();
    } catch (error) {
      console.error('❌ Error creating/updating state_master table:', error.message);
    }
  },
  seedStateMaster: async () => {
    // GST state codes (e.g., Maharashtra = 27)
    const defaults = [
      // States
      ['AP', 'Andhra Pradesh', 37],
      ['AR', 'Arunachal Pradesh', 12],
      ['AS', 'Assam', 18],
      ['BR', 'Bihar', 10],
      ['CT', 'Chhattisgarh', 22],
      ['GA', 'Goa', 30],
      ['GJ', 'Gujarat', 24],
      ['HR', 'Haryana', 6],
      ['HP', 'Himachal Pradesh', 2],
      ['JH', 'Jharkhand', 20],
      ['KA', 'Karnataka', 29],
      ['KL', 'Kerala', 32],
      ['MP', 'Madhya Pradesh', 23],
      ['MH', 'Maharashtra', 27],
      ['MN', 'Manipur', 14],
      ['ML', 'Meghalaya', 17],
      ['MZ', 'Mizoram', 15],
      ['NL', 'Nagaland', 13],
      ['OD', 'Odisha', 21],
      ['PB', 'Punjab', 3],
      ['RJ', 'Rajasthan', 8],
      ['SK', 'Sikkim', 11],
      ['TN', 'Tamil Nadu', 33],
      ['TS', 'Telangana', 36],
      ['TR', 'Tripura', 16],
      ['UP', 'Uttar Pradesh', 9],
      ['UK', 'Uttarakhand', 5],
      ['WB', 'West Bengal', 19],
      // Union Territories
      ['AN', 'Andaman and Nicobar Islands', 35],
      ['CH', 'Chandigarh', 4],
      ['DN', 'Dadra and Nagar Haveli and Daman and Diu', 26],
      ['DL', 'Delhi', 7],
      ['JK', 'Jammu and Kashmir', 1],
      ['LA', 'Ladakh', 38],
      ['LD', 'Lakshadweep', 31],
      ['PY', 'Puducherry', 34],
    ];
    try {
      const connection = await pool.getConnection();
      const valuesSql = defaults.map(() => '(?, ?, ?)').join(',');
      const flatValues = defaults.flat();
      // Upsert by state_code to ensure gst_state_code is updated if previously inserted
      await connection.query(
        `INSERT INTO state_master (state_code, state_name, gst_state_code) VALUES ${valuesSql}
         ON DUPLICATE KEY UPDATE state_name = VALUES(state_name), gst_state_code = VALUES(gst_state_code)`,
        flatValues
      );
      console.log('✅ state_master seeded/updated with GST codes.');
      connection.release();
    } catch (error) {
      console.error('❌ Error seeding state_master:', error.message);
    }
  }
  ,
  // Tax master table and seeders
  createTaxMasterTable: async () => {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS tax_master (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tax_name VARCHAR(100) UNIQUE,
        cgst_per DECIMAL(5,2) DEFAULT 0,
        sgst_per DECIMAL(5,2) DEFAULT 0,
        igst_per DECIMAL(5,2) DEFAULT 0,
        cess_per DECIMAL(5,2) DEFAULT 0
      );
    `;
    try {
      const connection = await pool.getConnection();
      await connection.query(createTableSQL);
      console.log('✅ tax_master table checked/created.');
      connection.release();
    } catch (error) {
      console.error('❌ Error creating tax_master table:', error.message);
    }
  },
  seedTaxMaster: async () => {
    const defaults = [
      ['GST 18%', 9.00, 9.00, 18.00, 0.00],
      ['GST 12%', 6.00, 6.00, 12.00, 0.00],
      ['+GST 18%', 0.00, 0.00, 18.00, 0.00]
    ];
    try {
      const connection = await pool.getConnection();
      const valuesSql = defaults.map(() => '(?, ?, ?, ?, ?)').join(',');
      const flatValues = defaults.flat();
      await connection.query(
        `INSERT INTO tax_master (tax_name, cgst_per, sgst_per, igst_per, cess_per) VALUES ${valuesSql}
         ON DUPLICATE KEY UPDATE cgst_per = VALUES(cgst_per), sgst_per = VALUES(sgst_per), igst_per = VALUES(igst_per), cess_per = VALUES(cess_per)`,
        flatValues
      );
      console.log('✅ tax_master seeded with default taxes.');
      connection.release();
    } catch (error) {
      console.error('❌ Error seeding tax_master:', error.message);
    }
  }
};
