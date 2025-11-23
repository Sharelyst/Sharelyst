/**
 * Group Routes
 * Handles group creation, joining, and management
 */

const express = require('express');
const router = express.Router();

const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

/**
 * Generate a unique 6-digit group code
 */
const generateUniqueGroupCode = async (db) => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    // Generate a random 6-digit number (100000 - 999999)
    const groupCode = Math.floor(100000 + Math.random() * 900000);
    
    // Check if this code already exists
    const existing = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM groups WHERE group_number = ?',
        [groupCode],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!existing) {
      return groupCode;
    }
    
    attempts++;
  }
  
  throw new ApiError(500, 'Unable to generate unique group code. Please try again.');
};

/**
 * POST /api/groups/create
 * Create a new group and generate a unique 6-digit code
 * 
 * Request body:
 * - name: string (required)
 * - description: string (optional)
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.post('/create', authenticateToken, asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  // Validate required fields
  if (!name || name.trim() === '') {
    throw new ApiError(400, 'Group name is required');
  }

  const db = req.app.get('db');

  // Check if user is already in a group
  const userWithGroup = await new Promise((resolve, reject) => {
    db.get(
      'SELECT group_id FROM users WHERE id = ?',
      [userId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (userWithGroup && userWithGroup.group_id) {
    throw new ApiError(400, 'You are already in a group. Please leave your current group first.');
  }

  // Generate unique group code
  const groupCode = await generateUniqueGroupCode(db);

  // Create the group
  const groupResult = await new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO groups (group_number, name, description) VALUES (?, ?, ?)',
      [groupCode, name.trim(), description || null],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, groupCode });
      }
    );
  });

  // Update user's group_id
  await new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET group_id = ? WHERE id = ?',
      [groupCode, userId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  res.status(201).json({
    success: true,
    message: 'Group created successfully',
    data: {
      id: groupResult.id,
      groupCode: groupCode,
      name: name.trim(),
      description: description || null,
    },
  });
}));

/**
 * POST /api/groups/join
 * Join an existing group using a 6-digit code
 * 
 * Request body:
 * - groupCode: number (required, 6-digit code)
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.post('/join', authenticateToken, asyncHandler(async (req, res) => {
  const { groupCode } = req.body;
  const userId = req.user.id;

  // Validate group code
  if (!groupCode) {
    throw new ApiError(400, 'Group code is required');
  }

  // Validate it's a 6-digit number
  const code = parseInt(groupCode);
  if (isNaN(code) || code < 100000 || code > 999999) {
    throw new ApiError(400, 'Invalid group code. Must be a 6-digit number.');
  }

  const db = req.app.get('db');

  // Check if user is already in a group
  const userWithGroup = await new Promise((resolve, reject) => {
    db.get(
      'SELECT group_id FROM users WHERE id = ?',
      [userId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (userWithGroup && userWithGroup.group_id) {
    throw new ApiError(400, 'You are already in a group. Please leave your current group first.');
  }

  // Check if group exists
  const group = await new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM groups WHERE group_number = ?',
      [code],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (!group) {
    throw new ApiError(404, 'Group not found. Please check the code and try again.');
  }

  // Add user to the group
  await new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET group_id = ? WHERE id = ?',
      [code, userId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  res.status(200).json({
    success: true,
    message: 'Successfully joined the group',
    data: {
      id: group.id,
      groupCode: group.group_number,
      name: group.name,
      description: group.description,
    },
  });
}));

/**
 * GET /api/groups/my-group
 * Get the current user's group information
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.get('/my-group', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const db = req.app.get('db');

  // Get user's group_id
  const userWithGroup = await new Promise((resolve, reject) => {
    db.get(
      'SELECT group_id FROM users WHERE id = ?',
      [userId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (!userWithGroup || !userWithGroup.group_id) {
    return res.status(200).json({
      success: true,
      message: 'User is not in any group',
      data: null,
    });
  }

  // Get group details
  const group = await new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM groups WHERE group_number = ?',
      [userWithGroup.group_id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  // Get all members of the group
  const members = await new Promise((resolve, reject) => {
    db.all(
      'SELECT id, username, first_name, last_name, email FROM users WHERE group_id = ?',
      [userWithGroup.group_id],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });

  res.status(200).json({
    success: true,
    message: 'Group retrieved successfully',
    data: {
      id: group.id,
      groupCode: group.group_number,
      name: group.name,
      description: group.description,
      members: members,
      createdAt: group.created_at,
    },
  });
}));

/**
 * POST /api/groups/leave
 * Leave the current group
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.post('/leave', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const db = req.app.get('db');

  // Get user's group_id
  const userWithGroup = await new Promise((resolve, reject) => {
    db.get(
      'SELECT group_id FROM users WHERE id = ?',
      [userId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (!userWithGroup || !userWithGroup.group_id) {
    throw new ApiError(400, 'You are not in any group');
  }

  const groupId = userWithGroup.group_id;

  // Remove user from group
  await new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET group_id = NULL WHERE id = ?',
      [userId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  // Check if there are any remaining members
  const remainingMembers = await new Promise((resolve, reject) => {
    db.get(
      'SELECT COUNT(*) as count FROM users WHERE group_id = ?',
      [groupId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  // If no members left, delete the group
  if (remainingMembers.count === 0) {
    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM groups WHERE group_number = ?',
        [groupId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  res.status(200).json({
    success: true,
    message: 'Successfully left the group',
  });
}));

module.exports = router;
