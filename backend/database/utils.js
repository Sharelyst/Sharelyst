/**
 * Database Utilities
 * Helper functions for database operations
 */

const sqlite3 = require('sqlite3');
const path = require('path');
const config = require('../config');

/**
 * Create a database connection
 * @returns {sqlite3.Database} Database instance
 */
const createConnection = () => {
  const dbPath = path.resolve(__dirname, '..', config.database.path);
  
  const db = config.database.verbose
    ? new sqlite3.verbose().Database(dbPath)
    : new sqlite3.Database(dbPath);
  
  return db;
};

/**
 * Promisified database.get
 * @param {sqlite3.Database} db - Database instance
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<any>} Query result
 */
const dbGet = (db, query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

/**
 * Promisified database.all
 * @param {sqlite3.Database} db - Database instance
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
const dbAll = (db, query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

/**
 * Promisified database.run
 * @param {sqlite3.Database} db - Database instance
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<{lastID: number, changes: number}>} Query result
 */
const dbRun = (db, query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

/**
 * Close database connection gracefully
 * @param {sqlite3.Database} db - Database instance
 * @returns {Promise<void>}
 */
const closeConnection = (db) => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

module.exports = {
  createConnection,
  dbGet,
  dbAll,
  dbRun,
  closeConnection,
};
