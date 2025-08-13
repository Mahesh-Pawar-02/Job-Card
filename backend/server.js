const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection, createPartyMasterTable } = require('./config/database');

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

// Use partyMaster routes
app.use('/api/party-master', partyMasterRoutes);

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
})();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
});
