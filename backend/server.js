const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { testConnection } = require('./config/database.js');

const path = require('path');
const fs = require('fs');

// make sure folders exist
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PARTS_DIR  = path.join(UPLOAD_DIR, 'parts');
fs.mkdirSync(PARTS_DIR, { recursive: true });

// Import Routes
const inwardRoutes = require('./routes/inwardRoutes');
const customerRoutes = require('./routes/customerRoutes');
const partRoutes = require('./routes/partRoutes');

const app = express();
app.use(bodyParser.json());

// serve files statically at /uploads/*
app.use('/uploads', require('express').static(UPLOAD_DIR));

// ✅ Enable CORS (allow frontend to call backend)
app.use(cors({
  origin: 'http://localhost:5173',  // your vite dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Routes
app.use('/api/inwards', inwardRoutes);
app.use('/api/customers', customerRoutes); // 🔹 added
app.use('/api/parts', partRoutes);         // 🔹 added

// Test DB connection
testConnection();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
