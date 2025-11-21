/**
 * Database Queries for Sharelyst
 * Common database operations for users, groups, transactions, and payments
 */

const { query } = require('./utils');

/**
 * USER QUERIES
 */
const userQueries = {
  // Create a new user
  createUser: async (userData) => {
    const sql = `
      INSERT INTO users (first_name, last_name, email, phone, password, group_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      userData.first_name,
      userData.last_name,
      userData.email,
      userData.phone,
      userData.password,
      userData.group_id
    ];
    return await query(sql, values);
  },

  // Get user by ID
  getUserById: async (id) => {
    const sql = 'SELECT * FROM users WHERE id = $1';
    return await query(sql, [id]);
  },

  // Get user by email
  getUserByEmail: async (email) => {
    const sql = 'SELECT * FROM users WHERE email = $1';
    return await query(sql, [email]);
  },

  // Update user
  updateUser: async (id, updates) => {
    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const sql = `UPDATE users SET ${fields} WHERE id = $1 RETURNING *`;
    const values = [id, ...Object.values(updates)];
    return await query(sql, values);
  },

  // Delete user
  deleteUser: async (id) => {
    const sql = 'DELETE FROM users WHERE id = $1 RETURNING *';
    return await query(sql, [id]);
  },

  // Get all users in a group
  getUsersByGroupId: async (groupId) => {
    const sql = 'SELECT * FROM users WHERE group_id = $1';
    return await query(sql, [groupId]);
  }
};

/**
 * GROUP QUERIES
 */
const groupQueries = {
  // Create a new group
  createGroup: async (groupData) => {
    const sql = `
      INSERT INTO groups (group_number, name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [groupData.group_number, groupData.name, groupData.description];
    return await query(sql, values);
  },

  // Get group by ID
  getGroupById: async (id) => {
    const sql = 'SELECT * FROM groups WHERE id = $1';
    return await query(sql, [id]);
  },

  // Get group by group number
  getGroupByNumber: async (groupNumber) => {
    const sql = 'SELECT * FROM groups WHERE group_number = $1';
    return await query(sql, [groupNumber]);
  },

  // Update group
  updateGroup: async (id, updates) => {
    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const sql = `UPDATE groups SET ${fields} WHERE id = $1 RETURNING *`;
    const values = [id, ...Object.values(updates)];
    return await query(sql, values);
  },

  // Delete group
  deleteGroup: async (id) => {
    const sql = 'DELETE FROM groups WHERE id = $1 RETURNING *';
    return await query(sql, [id]);
  },

  // Get all transactions for a group
  getGroupTransactions: async (groupId) => {
    const sql = 'SELECT * FROM transactions WHERE group_id = $1 ORDER BY created_at DESC';
    return await query(sql, [groupId]);
  },

  // Get all payments for a group
  getGroupPayments: async (groupId) => {
    const sql = `
      SELECT p.*, u.first_name, u.last_name, u.email
      FROM payments p
      JOIN users u ON p.user_id = u.id
      WHERE p.group_id = $1
      ORDER BY p.created_at DESC
    `;
    return await query(sql, [groupId]);
  }
};

/**
 * TRANSACTION QUERIES
 */
const transactionQueries = {
  // Create a new transaction
  createTransaction: async (transactionData) => {
    const sql = `
      INSERT INTO transactions (name, transaction_id, total, split, group_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      transactionData.name,
      transactionData.transaction_id,
      transactionData.total,
      transactionData.split,
      transactionData.group_id
    ];
    return await query(sql, values);
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    const sql = 'SELECT * FROM transactions WHERE id = $1';
    return await query(sql, [id]);
  },

  // Get transaction by transaction_id
  getTransactionByTransactionId: async (transactionId) => {
    const sql = 'SELECT * FROM transactions WHERE transaction_id = $1';
    return await query(sql, [transactionId]);
  },

  // Update transaction
  updateTransaction: async (id, updates) => {
    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const sql = `UPDATE transactions SET ${fields} WHERE id = $1 RETURNING *`;
    const values = [id, ...Object.values(updates)];
    return await query(sql, values);
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    const sql = 'DELETE FROM transactions WHERE id = $1 RETURNING *';
    return await query(sql, [id]);
  },

  // Get all payments for a transaction
  getTransactionPayments: async (transactionId) => {
    const sql = `
      SELECT p.*, u.first_name, u.last_name, u.email
      FROM payments p
      JOIN users u ON p.user_id = u.id
      WHERE p.transaction_id = $1
      ORDER BY p.created_at DESC
    `;
    return await query(sql, [transactionId]);
  },

  // Get transaction with all payments
  getTransactionWithPayments: async (transactionId) => {
    const transactionSql = 'SELECT * FROM transactions WHERE id = $1';
    const paymentsSql = `
      SELECT p.*, u.first_name, u.last_name, u.email
      FROM payments p
      JOIN users u ON p.user_id = u.id
      WHERE p.transaction_id = $1
    `;
    
    const transaction = await query(transactionSql, [transactionId]);
    const payments = await query(paymentsSql, [transactionId]);
    
    return {
      ...transaction.rows[0],
      payments: payments.rows
    };
  }
};

/**
 * PAYMENT QUERIES
 */
const paymentQueries = {
  // Create a new payment
  createPayment: async (paymentData) => {
    const sql = `
      INSERT INTO payments (amount, user_id, transaction_id, group_id, payment_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      paymentData.amount,
      paymentData.user_id,
      paymentData.transaction_id,
      paymentData.group_id,
      paymentData.payment_type
    ];
    return await query(sql, values);
  },

  // Create multiple payments (for split transactions)
  createMultiplePayments: async (paymentsData) => {
    const sql = `
      INSERT INTO payments (amount, user_id, transaction_id, group_id, payment_type)
      VALUES ${paymentsData.map((_, i) => `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${i * 5 + 5})`).join(', ')}
      RETURNING *
    `;
    const values = paymentsData.flatMap(p => [
      p.amount,
      p.user_id,
      p.transaction_id,
      p.group_id,
      p.payment_type
    ]);
    return await query(sql, values);
  },

  // Get payment by ID
  getPaymentById: async (id) => {
    const sql = 'SELECT * FROM payments WHERE id = $1';
    return await query(sql, [id]);
  },

  // Update payment
  updatePayment: async (id, updates) => {
    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const sql = `UPDATE payments SET ${fields} WHERE id = $1 RETURNING *`;
    const values = [id, ...Object.values(updates)];
    return await query(sql, values);
  },

  // Delete payment
  deletePayment: async (id) => {
    const sql = 'DELETE FROM payments WHERE id = $1 RETURNING *';
    return await query(sql, [id]);
  },

  // Get all payments by user
  getPaymentsByUserId: async (userId) => {
    const sql = 'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC';
    return await query(sql, [userId]);
  },

  // Get user's total payments in a group
  getUserTotalInGroup: async (userId, groupId) => {
    const sql = `
      SELECT SUM(amount) as total
      FROM payments
      WHERE user_id = $1 AND group_id = $2
    `;
    return await query(sql, [userId, groupId]);
  }
};

module.exports = {
  userQueries,
  groupQueries,
  transactionQueries,
  paymentQueries
};
