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

// Create groups table (must be created before users due to foreign key)
const createGroupsTable = `
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_number INTEGER UNIQUE NOT NULL CHECK (
      group_number >= 100000 AND group_number <= 999999
    ),
    name TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

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
    group_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(group_number) ON DELETE SET NULL
  )
`;

// Create transactions table
const createTransactionsTable = `
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    transaction_id INTEGER UNIQUE NOT NULL,
    total REAL NOT NULL,
    split INTEGER DEFAULT 0,
    group_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
  )
`;

// Create payments table
const createPaymentsTable = `
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    user_id INTEGER NOT NULL,
    transaction_id INTEGER,
    group_id INTEGER,
    payment_type TEXT DEFAULT 'transaction',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CHECK (transaction_id IS NOT NULL OR group_id IS NOT NULL)
  )
`;

// Create indexes for better query performance
const createIndexes = [
  'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
  'CREATE INDEX IF NOT EXISTS idx_users_group_id ON users(group_id)',
  'CREATE INDEX IF NOT EXISTS idx_groups_group_number ON groups(group_number)',
  'CREATE INDEX IF NOT EXISTS idx_transactions_group_id ON transactions(group_id)',
  'CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id)',
  'CREATE INDEX IF NOT EXISTS idx_payments_group_id ON payments(group_id)',
];

// Initialize database
db.serialize(() => {
  // Create tables in order (respecting foreign key dependencies)
  db.run(createGroupsTable, (err) => {
    if (err) {
      console.error('Error creating groups table:', err.message);
      process.exit(1);
    }
    console.log('✓ Groups table created successfully.');
  });

  db.run(createUsersTable, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
      process.exit(1);
    }
    console.log('✓ Users table created successfully.');
  });

  db.run(createTransactionsTable, (err) => {
    if (err) {
      console.error('Error creating transactions table:', err.message);
      process.exit(1);
    }
    console.log('✓ Transactions table created successfully.');
  });

  db.run(createPaymentsTable, (err) => {
    if (err) {
      console.error('Error creating payments table:', err.message);
      process.exit(1);
    }
    console.log('✓ Payments table created successfully.');
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
