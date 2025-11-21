/**
 * Database Initialization Script
 * Creates the database schema with proper tables and constraints
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

// Create database connection
const dbPath = path.resolve(__dirname, '..', config.database.path);
console.log(`Initializing database at: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
});

// Create users table
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create indexes for better query performance
const createIndexes = [
  'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
  'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
];

// Initialize database
db.serialize(() => {
  // Create tables
  db.run(createUsersTable, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
      process.exit(1);
    }
    console.log('✓ Users table created successfully.');
  });

  // Create indexes
  createIndexes.forEach((indexQuery, idx) => {
    db.run(indexQuery, (err) => {
      if (err) {
        console.error(`Error creating index ${idx + 1}:`, err.message);
      } else {
        console.log(`✓ Index ${idx + 1} created successfully.`);
      }
    });
  });

  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
      process.exit(1);
    }
    console.log('✓ Database initialization complete.');
  });
});
