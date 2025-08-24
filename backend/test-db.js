const { pool, testConnection } = require('./config/database');

async function testDatabase() {
  console.log('🔌 Testing database connection...');
  
  try {
    // Test basic connection
    const connectionResult = await testConnection();
    
    if (connectionResult) {
      console.log('✅ Database connection successful!');
      
      // Test a simple query
      const [rows] = await pool.query('SELECT 1 as test');
      console.log('✅ Database query test successful:', rows[0]);
      
      // Check if tables exist
      const [tables] = await pool.query('SHOW TABLES');
      console.log('📋 Existing tables:', tables.map(t => Object.values(t)[0]));
      
    } else {
      console.log('❌ Database connection failed!');
    }
  } catch (error) {
    console.error('❌ Error during database test:', error);
  } finally {
    // Close the pool
    await pool.end();
    console.log('🔌 Database connection pool closed.');
  }
}

testDatabase();
