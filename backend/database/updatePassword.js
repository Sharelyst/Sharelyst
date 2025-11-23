/**
 * Update User Password Script
 * Updates the password for an existing user
 * Usage: node updatePassword.js <email> <newPassword>
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node updatePassword.js <email> <newPassword>');
  console.error('Example: node updatePassword.js ghh@gmail.com myNewPassword123');
  process.exit(1);
}

const [email, newPassword] = args;

// Database path
const dbPath = path.resolve(__dirname, '..', 'database.db');

// Connect to database
const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }

  console.log('Connected to database.');
  
  try {
    // Check if user exists
    db.get(
      'SELECT id, username, email FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          console.error('Error finding user:', err.message);
          db.close();
          process.exit(1);
        }

        if (!user) {
          console.error(`❌ User not found with email: ${email}`);
          db.close();
          process.exit(1);
        }

        console.log(`Found user: ${user.username} (${user.email})`);

        // Hash the new password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        db.run(
          'UPDATE users SET password_hash = ? WHERE id = ?',
          [passwordHash, user.id],
          (err) => {
            if (err) {
              console.error('Error updating password:', err.message);
            } else {
              console.log('\n✓ Password updated successfully!');
              console.log('\nNew credentials:');
              console.log('  Email:', user.email);
              console.log('  Username:', user.username);
              console.log('  Password:', newPassword);
              console.log('\nYou can now login with these credentials.');
            }
            db.close();
          }
        );
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    db.close();
    process.exit(1);
  }
});
