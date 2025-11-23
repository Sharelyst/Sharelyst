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
 * GET /api/transactions/splitBills
 * Calculate how bills should be split among group members
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.get('/splitBills', authenticateToken, asyncHandler(async (req, res) => {
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

  // If the user is not enrolled in a group, return empty data
  if (!userWithGroup || !userWithGroup.group_id) {
    return res.status(200).json({
      success: true,
      message: 'User is not in any group',
      data: {
        total: 0,
        perPersonAmount: 0,
        usersSummary: [],
        transactions: []
      },
    });
  }

  // Get the group's id given a group number
  const group = await new Promise((resolve, reject) => {
    db.get(
      'SELECT id, group_number FROM groups WHERE group_number = ?',
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

  // Get the total sum for all transactions in the group
  const result = await new Promise((resolve, reject) => {
    db.get(
      'SELECT COALESCE(SUM(total), 0) as total FROM transactions WHERE group_id = ?',
      [group.id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  // Get the number of people in the group
  const count = await new Promise((resolve, reject) => {
    db.get(
      'SELECT COUNT(*) as count FROM users WHERE group_id = ?',
      [userWithGroup.group_id],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (count.count === 0) {
    throw new ApiError(400, 'No users in the group to split the bills');
  }

  // Get the amount paid by each user in the group
  const amountsById = await new Promise((resolve, reject) => {
    db.all(
      `SELECT users.id, users.first_name, users.last_name, COALESCE(SUM(payments.amount), 0) as amount
       FROM users
       LEFT JOIN payments ON payments.user_id = users.id AND payments.group_id = ?
       WHERE users.group_id = ?
       GROUP BY users.id`,
      [group.id, userWithGroup.group_id],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });

  const total = result.total || 0;
  const eachAmount = parseFloat((total / count.count).toFixed(2));

  // Calculate who owes money and who should receive money
  const owesMoneyList = [];
  const isOwedMoneyList = [];
  const usersSummary = [];

  for (const user of amountsById) {
    const amountPaid = parseFloat(user.amount);
    const difference = amountPaid - eachAmount;

    usersSummary.push({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      amountPaid: amountPaid.toFixed(2),
      shouldPay: eachAmount.toFixed(2),
      difference: difference.toFixed(2),
    });

    if (difference > 0.01) {
      // User paid more than their share, should receive money
      isOwedMoneyList.push({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        amount: parseFloat(difference.toFixed(2)),
      });
    } else if (difference < -0.01) {
      // User paid less than their share, owes money
      owesMoneyList.push({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        amount: parseFloat(Math.abs(difference).toFixed(2)),
      });
    }
  }

  // Generate settlement transactions using greedy algorithm
  const finalTransactions = [];
  
  // Create copies to manipulate
  const debtors = [...owesMoneyList];
  const creditors = [...isOwedMoneyList];

  for (const debtor of debtors) {
    let remainingDebt = debtor.amount;

    for (const creditor of creditors) {
      if (remainingDebt <= 0.01) break;
      if (creditor.amount <= 0.01) continue;

      const paymentAmount = Math.min(remainingDebt, creditor.amount);
      
      finalTransactions.push({
        from: `${debtor.firstName} ${debtor.lastName}`,
        to: `${creditor.firstName} ${creditor.lastName}`,
        amount: parseFloat(paymentAmount.toFixed(2)),
      });

      remainingDebt -= paymentAmount;
      creditor.amount -= paymentAmount;
    }
  }

  res.status(200).json({
    success: true,
    message: 'Bill split calculated successfully',
    data: {
      total: parseFloat(total.toFixed(2)),
      perPersonAmount: eachAmount,
      usersSummary,
      transactions: finalTransactions,
    },
  });
}));

/**
 * POST /api/transactions/settleBills
 * Settle all bills and optionally reset transactions or delete group
 * 
 * Request body:
 * - action: 'reset' | 'delete' (required)
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.post('/settleBills', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { action } = req.body;
  const db = req.app.get('db');

  if (!action || !['reset', 'delete'].includes(action)) {
    throw new ApiError(400, 'Action must be either "reset" or "delete"');
  }

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
    throw new ApiError(400, 'You must be in a group to settle bills');
  }

  // Get the group's id
  const group = await new Promise((resolve, reject) => {
    db.get(
      'SELECT id, group_number FROM groups WHERE group_number = ?',
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

  if (action === 'reset') {
    // Delete all transactions and payments for the group
    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM payments WHERE group_id = ?',
        [group.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM transactions WHERE group_id = ?',
        [group.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(200).json({
      success: true,
      message: 'All bills have been settled and transactions reset',
      data: { action: 'reset' },
    });
  } else if (action === 'delete') {
    // Delete all transactions, payments, and the group itself
    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM payments WHERE group_id = ?',
        [group.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM transactions WHERE group_id = ?',
        [group.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Remove group_id from all users in the group
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET group_id = NULL WHERE group_id = ?',
        [userWithGroup.group_id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Delete the group
    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM groups WHERE id = ?',
        [group.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(200).json({
      success: true,
      message: 'All bills have been settled and group has been deleted',
      data: { action: 'delete' },
    });
  }
}));
module.exports = router;
