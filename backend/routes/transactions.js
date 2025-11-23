/**
 * Transaction Routes
 * Handles transaction creation and management
 */

const express = require('express');
const router = express.Router();

const { ApiError, asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/transactions/create
 * Create a new transaction
 * 
 * Request body:
 * - name: string (required)
 * - total: number (required)
 * - split: boolean (default: false)
 * - payments: array of { user_id: number, amount: number } (required)
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.post('/create', authenticateToken, asyncHandler(async (req, res) => {
  const { name, total, split, payments } = req.body;
  const userId = req.user.id;

  // Validate required fields
  if (!name || !total || !payments || !Array.isArray(payments) || payments.length === 0) {
    throw new ApiError(400, 'Transaction name, total, and payments are required');
  }

  // Validate total is a positive number
  if (isNaN(total) || total <= 0) {
    throw new ApiError(400, 'Total must be a positive number');
  }

  const db = req.app.get('db');

  // Get user's group
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
    throw new ApiError(400, 'You must be in a group to create transactions');
  }

  const groupId = userWithGroup.group_id;

  // Get group details
  const group = await new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM groups WHERE group_number = ?',
      [groupId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  // Validate all users are in the same group
  for (const payment of payments) {
    if (!payment.user_id || payment.amount === undefined) {
      throw new ApiError(400, 'Each payment must have user_id and amount');
    }

    const userInGroup = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM users WHERE id = ? AND group_id = ?',
        [payment.user_id, groupId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!userInGroup) {
      throw new ApiError(400, `User ${payment.user_id} is not in your group`);
    }
  }

  // Validate total matches sum of payments
  const paymentSum = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  if (Math.abs(paymentSum - parseFloat(total)) > 0.01) {
    throw new ApiError(400, `Payment amounts (${paymentSum}) must equal total (${total})`);
  }

  // Generate unique transaction_id
  const transactionId = Math.floor(100000 + Math.random() * 900000);

  // Create transaction
  const transactionResult = await new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO transactions (name, transaction_id, total, split, group_id) VALUES (?, ?, ?, ?, ?)',
      [name, transactionId, total, split ? 1 : 0, group.id],
      function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });

  // Create payments
  const paymentResults = [];
  for (const payment of payments) {
    const paymentResult = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO payments (amount, user_id, transaction_id, group_id, payment_type) VALUES (?, ?, ?, ?, ?)',
        [payment.amount, payment.user_id, transactionResult.id, group.id, 'transaction'],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
    paymentResults.push(paymentResult);
  }

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    data: {
      id: transactionResult.id,
      transactionId: transactionId,
      name: name,
      total: total,
      split: split,
      payments: payments,
    },
  });
}));

/**
 * GET /api/transactions/my-group
 * Get all transactions for user's group
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.get('/my-group', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const db = req.app.get('db');

  // Get user's group
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
      data: [],
    });
  }

  // Get group details
  const group = await new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM groups WHERE group_number = ?',
      [userWithGroup.group_id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (!group) {
    return res.status(200).json({
      success: true,
      message: 'Group not found',
      data: [],
    });
  }

  // Get all transactions for the group
  const transactions = await new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM transactions WHERE group_id = ? ORDER BY created_at DESC',
      [group.id],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });

  // Get payments for each transaction
  const transactionsWithPayments = await Promise.all(
    transactions.map(async (transaction) => {
      const payments = await new Promise((resolve, reject) => {
        db.all(
          `SELECT p.*, u.username, u.first_name, u.last_name 
           FROM payments p 
           JOIN users u ON p.user_id = u.id 
           WHERE p.transaction_id = ?`,
          [transaction.id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      return {
        ...transaction,
        payments,
      };
    })
  );

  res.status(200).json({
    success: true,
    message: 'Transactions retrieved successfully',
    data: transactionsWithPayments,
  });
}));

/**
 * GET /api/transactions/total
 * Get total amount for user's group
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.get('/total', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const db = req.app.get('db');

  // Get user's group
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
      data: { total: 0 },
    });
  }

  // Get group details
  const group = await new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM groups WHERE group_number = ?',
      [userWithGroup.group_id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (!group) {
    return res.status(200).json({
      success: true,
      message: 'Group not found',
      data: { total: 0 },
    });
  }

  // Get total
  const result = await new Promise((resolve, reject) => {
    db.get(
      'SELECT SUM(total) as total FROM transactions WHERE group_id = ?',
      [group.id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  res.status(200).json({
    success: true,
    message: 'Total retrieved successfully',
    data: {
      total: result.total || 0,
    },
  });
}));

/**
 * GET /api/transactions/user-spendings
 * Get total spending by each user in the group
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.get('/user-spendings', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const db = req.app.get('db');

  // Get user's group
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
      data: [],
    });
  }

  // Get group details
  const group = await new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM groups WHERE group_number = ?',
      [userWithGroup.group_id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (!group) {
    return res.status(200).json({
      success: true,
      message: 'Group not found',
      data: [],
    });
  }

  // Get total spending by each user in the group
  const userSpendings = await new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        COALESCE(SUM(p.amount), 0) as total_spent
      FROM users u
      LEFT JOIN payments p ON u.id = p.user_id AND p.group_id = ?
      WHERE u.group_id = ?
      GROUP BY u.id, u.username, u.first_name, u.last_name
      ORDER BY total_spent DESC`,
      [group.id, userWithGroup.group_id],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });

  res.status(200).json({
    success: true,
    message: 'User spendings retrieved successfully',
    data: userSpendings,
  });
}));

/**
 * GET /api/transactions/:id
 * Get a specific transaction by ID with all payment details
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const transactionId = req.params.id;
  const db = req.app.get('db');

  // Get user's group
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
    throw new ApiError(403, 'You must be in a group to view transactions');
  }

  // Get group details
  const group = await new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM groups WHERE group_number = ?',
      [userWithGroup.group_id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  // Get the transaction
  const transaction = await new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM transactions WHERE id = ? AND group_id = ?',
      [transactionId, group.id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found or you do not have access to it');
  }

  // Get payments for this transaction
  const payments = await new Promise((resolve, reject) => {
    db.all(
      `SELECT p.*, u.username, u.first_name, u.last_name 
       FROM payments p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.transaction_id = ?`,
      [transaction.id],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });

  res.status(200).json({
    success: true,
    message: 'Transaction retrieved successfully',
    data: {
      ...transaction,
      payments,
    },
  });
}));

module.exports = router;
