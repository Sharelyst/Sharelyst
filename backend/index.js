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
const groupRoutes = require('./routes/groups');

// Initialize Express app
const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware - logs all client requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const clientIp = req.ip || req.connection.remoteAddress || 'Unknown';
  const userAgent = req.get('user-agent') || 'Unknown';
  
  // Log the incoming request
  console.log('\n' + '='.repeat(80));
  console.log(`[${timestamp}] Incoming Request`);
  console.log(`Client IP: ${clientIp}`);
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.originalUrl || req.url}`);
  console.log(`User-Agent: ${userAgent}`);
  
  // Log request body for POST/PUT/PATCH requests (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    // Hide sensitive fields
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    console.log(`Body:`, JSON.stringify(sanitizedBody, null, 2));
  }
  
  // Capture response details
  const startTime = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - startTime;
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response Time: ${duration}ms`);
    console.log('='.repeat(80) + '\n');
    return originalSend.apply(res, arguments);
  };
  
  next();
});

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
app.use('/api/groups', groupRoutes);

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

// Add error handler for server
server.on('error', (error) => {
  console.error('❌ Server Error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${config.server.port} is already in use`);
  }
  process.exit(1);
});

module.exports = { app, db };