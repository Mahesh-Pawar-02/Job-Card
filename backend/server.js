const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection, createPartyMasterTable, createProcessMasterTable, seedProcessMaster, createItemMasterTable, createUnitMasterTable, seedUnitMaster, createStateMasterTable, seedStateMaster, createTaxMasterTable, seedTaxMaster, createCategoryMasterTable, seedCategoryMaster, createInwardLCChallanTable, seedInwardLCChallan } = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Backend API!' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Import partyMaster routes
const partyMasterRoutes = require('./routes/partyMasterRoutes');
const processMasterRoutes = require('./routes/processMasterRoutes');
const itemMasterRoutes = require('./routes/itemMasterRoutes');
const unitMasterRoutes = require('./routes/unitMasterRoutes');
const stateMasterRoutes = require('./routes/stateMasterRoutes');
const taxMasterRoutes = require('./routes/taxMasterRoutes');
const categoryMasterRoutes = require('./routes/categoryMasterRoutes');
const inwardLCChallanRoutes = require('./routes/inwardLCChallanRoutes');

// Use partyMaster routes
app.use('/api/party-master', partyMasterRoutes);
app.use('/api/process-master', processMasterRoutes);
app.use('/api/item-master', itemMasterRoutes);
app.use('/api/unit-master', unitMasterRoutes);
app.use('/api/state-master', stateMasterRoutes);
app.use('/api/tax-master', taxMasterRoutes);
app.use('/api/category-master', categoryMasterRoutes);
app.use('/api/inward-lc-challan', inwardLCChallanRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Test DB connection and create table on startup
(async () => {
  await testConnection();
  await createPartyMasterTable();
  await createProcessMasterTable();
  await seedProcessMaster();
  await createItemMasterTable();
  await createUnitMasterTable();
  await seedUnitMaster();
  await createStateMasterTable();
  await seedStateMaster();
  await createTaxMasterTable();
  await seedTaxMaster();
  await createCategoryMasterTable();
  await seedCategoryMaster();
  await createInwardLCChallanTable();
  await seedInwardLCChallan();
})();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
});
