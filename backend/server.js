require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const { testConnection } = require("./config/database");

const partRoutes = require("./routes/partRoutes");
const customerRoutes = require("./routes/customerRoutes");
const processRoutes = require("./routes/processRoutes");

const app = express();

// ✅ Enable CORS (for all origins during dev; you can restrict later)
app.use(cors());

// ✅ Middleware
app.use(bodyParser.json()); // parse JSON request bodies

// ✅ Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
app.use("/api/parts", partRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/processes", processRoutes);

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});

// ✅ Start server after testing DB connection
const PORT = process.env.PORT || 5000;
(async () => {
  const isConnected = await testConnection();
  if (isConnected) {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } else {
    console.error("❌ Server not started because database connection failed!");
    process.exit(1); // exit app if db is not connected
  }
})();
