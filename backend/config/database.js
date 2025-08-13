require('dotenv').config();
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
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
  createPartyMasterTable
};
