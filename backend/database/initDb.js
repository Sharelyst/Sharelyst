/**
 * Database initialization script
 * Creates the users table with proper schema and constraints
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create database connection
const dbPath = path.join(__dirname, "..", "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
        process.exit(1);
    }
    console.log("Connected to the SQLite database.");
});

// Create users table
const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;

db.run(createUsersTable, (err) => {
    if (err) {
        console.error("Error creating users table:", err.message);
        process.exit(1);
    }
    console.log("Users table created successfully.");
    
    // Close the database connection
    db.close((err) => {
        if (err) {
            console.error("Error closing database:", err.message);
        }
        console.log("Database initialization complete.");
    });
});
