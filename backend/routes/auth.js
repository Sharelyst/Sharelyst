/**
 * Authentication Routes
 * Handles user registration, login, and token verification
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const config = require('../config');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const { validateEmail, validatePassword } = require('../middleware/validation');

/**
 * POST /api/auth/register
 * Register a new user
 * 
 * Request body:
 * - username: string (required, unique)
 * - firstName: string (required)
 * - lastName: string (required)
 * - email: string (required, unique)
 * - phone: string (optional)
 * - password: string (required, min 6 characters)
 * - confirmPassword: string (required, must match password)
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { username, firstName, lastName, email, phone, password, confirmPassword } = req.body;

  // Validate required fields
  if (!username || !firstName || !lastName || !email || !password || !confirmPassword) {
    throw new ApiError(400, 'Username, first name, last name, email, password, and confirm password are required');
  }

  // Validate email format
  if (!validateEmail(email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new ApiError(400, passwordValidation.message);
  }

  // Validate password match
  if (password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  const db = req.app.get('db');

  // Check if username already exists
  const existingUsername = await new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM users WHERE username = ?',
      [username],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (existingUsername) {
    throw new ApiError(409, 'Username already exists');
  }

  // Check if email already exists
  const existingEmail = await new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM users WHERE email = ?',
      [email],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (existingEmail) {
    throw new ApiError(409, 'Email already exists');
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, config.security.bcryptSaltRounds);

  // Insert new user into database
  const result = await new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, first_name, last_name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [username, firstName, lastName, email, phone || null, passwordHash],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: result.id, username, email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      id: result.id,
      username,
      firstName,
      lastName,
      email,
      phone,
      token,
    },
  });
}));

/**
 * POST /api/auth/login
 * Login user with username/email and password
 * 
 * Request body:
 * - identifier: string (username OR email)
 * - password: string
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  // Validate required fields
  if (!identifier || !password) {
    throw new ApiError(400, 'Username/email and password are required');
  }

  const db = req.app.get('db');

  // Query user by username OR email
  const user = await new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [identifier, identifier],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  // Check if user exists
  if (!user) {
    console.log(`❌ Login failed: User not found with identifier "${identifier}"`);
    throw new ApiError(401, 'Invalid credentials');
  }

  console.log(`✓ User found: ${user.username} (${user.email})`);
  console.log(`Password info: length=${password.length}, first char="${password[0]}", last char="${password[password.length-1]}"`);

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    console.log(`❌ Login failed: Invalid password for user "${user.username}"`);
    console.log(`Expected password hash starts with: ${user.password_hash.substring(0, 20)}...`);
    throw new ApiError(401, 'Invalid credentials');
  }

  console.log(`✓ Password valid for user "${user.username}"`);


  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      token,
    },
  });
}));

/**
 * POST /api/auth/verify
 * Verify JWT token
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.post('/verify', authenticateToken, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    },
  });
}));

/**
 * GET /api/auth/me
 * Get current user profile
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const db = req.app.get('db');

  const user = await new Promise((resolve, reject) => {
    db.get(
      'SELECT id, username, first_name, last_name, email, phone, created_at FROM users WHERE id = ?',
      [req.user.id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    data: user,
  });
}));

/**
 * PUT /api/auth/profile
 * Update current user profile
 * 
 * Request body:
 * - firstName: string (optional)
 * - lastName: string (optional)
 * - email: string (optional)
 * - phone: string (optional)
 * - username: string (optional)
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.put('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, username } = req.body;
  const userId = req.user.id;

  // Validate at least one field is provided
  if (!firstName && !lastName && !email && !phone && !username) {
    throw new ApiError(400, 'At least one field must be provided for update');
  }

  const db = req.app.get('db');

  // If email is being updated, validate format and check for duplicates
  if (email) {
    if (!validateEmail(email)) {
      throw new ApiError(400, 'Invalid email format');
    }

    const existingEmail = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingEmail) {
      throw new ApiError(409, 'Email already exists');
    }
  }

  // If username is being updated, check for duplicates
  if (username) {
    const existingUsername = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingUsername) {
      throw new ApiError(409, 'Username already exists');
    }
  }

  // Build dynamic update query
  const updates = {};
  if (firstName !== undefined) updates.first_name = firstName;
  if (lastName !== undefined) updates.last_name = lastName;
  if (email !== undefined) updates.email = email;
  if (phone !== undefined) updates.phone = phone;
  if (username !== undefined) updates.username = username;

  const fields = Object.keys(updates)
    .map((key, index) => `${key} = ?`)
    .join(', ');
  const values = [...Object.values(updates), userId];

  await new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values,
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  // Fetch updated user data
  const updatedUser = await new Promise((resolve, reject) => {
    db.get(
      'SELECT id, username, first_name, last_name, email, phone, created_at FROM users WHERE id = ?',
      [userId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser,
  });
}));

// Health check endpoint to verify frontend-backend connectivity
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'Backend is reachable.' });
});

module.exports = router;
