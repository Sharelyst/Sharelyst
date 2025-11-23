/**
 * Create Test User Script
 * Creates or updates a test user with known credentials
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Database path
const dbPath = path.resolve(__dirname, '..', 'database.db');

// Test user credentials
const testUser = {
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@test.com',
  password: 'password123', // Plain text password
};

// Connect to database
const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }

  console.log('Connected to database.');
  
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(testUser.password, 10);
    
    // Check if user exists
    db.get(
      'SELECT id FROM users WHERE email = ?',
      [testUser.email],
      async (err, row) => {
        if (err) {
          console.error('Error checking user:', err.message);
          db.close();
          process.exit(1);
        }

        if (row) {
          // Update existing user
          db.run(
            'UPDATE users SET username = ?, first_name = ?, last_name = ?, password_hash = ? WHERE email = ?',
            [testUser.username, testUser.firstName, testUser.lastName, passwordHash, testUser.email],
            (err) => {
              if (err) {
                console.error('Error updating user:', err.message);
              } else {
                console.log('\n✓ Test user updated successfully!');
                console.log('\nCredentials:');
                console.log('  Email:', testUser.email);
                console.log('  Username:', testUser.username);
                console.log('  Password:', testUser.password);
              }
              db.close();
            }
          );
        } else {
          // Insert new user
          db.run(
            'INSERT INTO users (username, first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?, ?)',
            [testUser.username, testUser.firstName, testUser.lastName, testUser.email, passwordHash],
            (err) => {
              if (err) {
                console.error('Error creating user:', err.message);
              } else {
                console.log('\n✓ Test user created successfully!');
                console.log('\nCredentials:');
                console.log('  Email:', testUser.email);
                console.log('  Username:', testUser.username);
                console.log('  Password:', testUser.password);
              }
              db.close();
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    db.close();
    process.exit(1);
  }
});
