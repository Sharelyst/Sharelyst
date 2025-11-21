/**
 * Sharelyst Backend Server
 * Production-ready Express server with environment configuration
 */

// Load environment variables first
const config = require('./config');

// Import core modules
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');

// Initialize Express app
const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (config.isDevelopment) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Initialize database connection
let db;
if (config.database.verbose) {
  const sqlite3Verbose = sqlite3.verbose();
  db = new sqlite3Verbose.Database(config.database.path, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      process.exit(1);
    }
    console.log('Connected to the SQLite database.');
  });
} else {
  db = new sqlite3.Database(config.database.path, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      process.exit(1);
    }
    console.log('Connected to the SQLite database.');
  });
}

// Store database instance in app for use in routes
app.set('db', db);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sharelyst API is running',
    environment: config.env,
    version: '1.0.0',
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    console.log('Database connection closed.');
    process.exit(err ? 1 : 0);
  });
});

// Start the server
const server = app.listen(config.server.port, config.server.host, () => {
  console.log('='.repeat(50));
  console.log('🚀 Sharelyst Backend Server Started');
  console.log('='.repeat(50));
  console.log(`Environment: ${config.env}`);
  console.log(`Server: http://${config.server.host}:${config.server.port}`);
  console.log(`Local: http://localhost:${config.server.port}`);
  console.log(`Android Emulator: http://10.0.2.2:${config.server.port}`);
  console.log('='.repeat(50));
});

module.exports = { app, db };