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


router.get('/splitBills', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const db = req.app.get('db');

  // fetch group user is in

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

   //If the user is not enrolled in a group, then return total as 0
   // Pass the message along as well
    if (!userWithGroup || !userWithGroup.group_id) {
    return res.status(200).json({
      success: true,
      message: 'User is not in any group',
      data: { total: 0 },
    });
  }

    //Get theh group's id given a group number
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
    //Get the total sum for each transaction in the group
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
    
    //Get the number of people in the group
    const count = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM users WHERE group_id = ?',
        [group.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    // Get the amount paid by each user in the group
    const amountsbyId = await new Promise((resolve, reject) => {
      db.all('SELECT users.id, users.first_name, users.last_name, SUM(amount) , from payments JOIN users ON payments.user_id = users.id WHERE payments.group_id = ? GROUP BY users.id',[group.id]
        ,      (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      )

    });   

    
    if(count.count === 0){throw new ApiError(400, 'No users in the group to split the bills');}
    
    const eachAmount = (result.total / people.count).toFixed(2);
    
    const owesMoney = [];
    const isOwedMoney = [];
    totalAmountToBeReceived, totalAmountToBePaid= 0;

    //compute who goes where 
    for(let i in amountsbyId){
      //if person's total amount paid is less than each Amount, they owe money
      if(i.amount > eachAmount){
        amountToBeReceived = (i.amount - eachAmount).toFixed(2);
        owesMoney.push(i.first_name, i.last_name, amountToBeReceived);
        totalAmountToBeReceived += amountToBeReceived
      }
      else{
        amountOwed = (eachAmount - i.amount).toFixed(2);
        isOwedMoney.push(i.first_name, i.last_name, amountOwed);
         totalAmountToBePaid += amountOwed}
    }

    //Final check to ensure amounts balance
    if(Math.abs(totalAmountToBePaid - totalAmountToBeReceived) > 0.01){
      throw new ApiError(500, 'Internal calculation error: amounts do not balance');
    }


    //Get rid of the people who owe nothing
    const finalTransactions = [];
    for(let i in isOwedMoney){
      const msg = `${i.first_name} ${i.last_name} owes $0`;
      finalTransactions.push(msg);
    }



    //Go over all the people who are owed money and match them with people who owe money
    for(let i in isOwedMoney){

      for(let j in owesMoney){
        if(i.amount > 0){
          if(j.amount > 0 && i.amount >= j.amount){
            i.ampount -= j.amount; 
            const receiver = i.first_name + ' ' + i.last_name;
            const sender = j.first_name + ' ' + j.last_name;
            const message = `${sender} owes ${receiver} $${j.amount}`;
            finalTransactions.push(message);
            j.amount = 0;            
          }else{
            const receiver = i.first_name + ' ' + i.last_name;
            const sender = j.first_name + ' ' + j.last_name;
            const message = `${sender} owes ${receiver} $${i.amount}`;
            i.amount = 0;
            j.amount -= i.amount;
            finalTransactions.push(message);
          }
        }
    } 


      // Send out the final response
      res.status(200).json({
      success: true,
      message: 'Transactions to settle bills calculated successfully',
      data: {

        total : result.total,
        amountsPaid : amountsbyId,
        transactions: finalTransactions
      },
    });

    }








    


    










  
}));
module.exports = router;
