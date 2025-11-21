/**
 * Database Models for Sharelyst
 * These models define the structure of data and relationships
 */

/**
 * User Model
 * Represents a user in the system
 */
class User {
  constructor({
    id = null,
    first_name,
    last_name,
    email,
    phone = null,
    password,
    group_id = null,
    created_at = null,
    updated_at = null
  }) {
    this.id = id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.phone = phone;
    this.password = password; // Should be hashed before storing
    this.group_id = group_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  /**
   * Validates that group_id is 6 digits if provided
   */
  isValidGroupId() {
    if (this.group_id === null) return true;
    return this.group_id >= 100000 && this.group_id <= 999999;
  }
}

/**
 * Group Model
 * Represents a group of users sharing expenses
 */
class Group {
  constructor({
    id = null,
    group_number,
    name = null,
    description = null,
    created_at = null,
    updated_at = null
  }) {
    this.id = id;
    this.group_number = group_number;
    this.name = name;
    this.description = description;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  /**
   * Validates that group_number is exactly 6 digits
   */
  isValidGroupNumber() {
    return this.group_number >= 100000 && this.group_number <= 999999;
  }

  /**
   * Generates a random 6-digit group number
   */
  static generateGroupNumber() {
    return Math.floor(100000 + Math.random() * 900000);
  }
}

/**
 * Transaction Model
 * Represents a single transaction with multiple payments
 */
class Transaction {
  constructor({
    id = null,
    name,
    transaction_id,
    total,
    split = false,
    group_id,
    created_at = null,
    updated_at = null
  }) {
    this.id = id;
    this.name = name;
    this.transaction_id = transaction_id;
    this.total = parseFloat(total);
    this.split = split; // true = equal split, false = custom split
    this.group_id = group_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  /**
   * Validates that total is a positive number
   */
  isValidTotal() {
    return this.total > 0;
  }
}

/**
 * Payment Model
 * Represents an individual payment by a user
 */
class Payment {
  constructor({
    id = null,
    amount,
    user_id,
    transaction_id = null,
    group_id = null,
    payment_type = 'transaction',
    created_at = null,
    updated_at = null
  }) {
    this.id = id;
    this.amount = parseFloat(amount);
    this.user_id = user_id;
    this.transaction_id = transaction_id;
    this.group_id = group_id;
    this.payment_type = payment_type; // 'transaction' or 'group'
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  /**
   * Validates that amount is a positive number
   */
  isValidAmount() {
    return this.amount > 0;
  }

  /**
   * Validates that either transaction_id or group_id is provided
   */
  isValidAssociation() {
    return this.transaction_id !== null || this.group_id !== null;
  }
}

module.exports = {
  User,
  Group,
  Transaction,
  Payment
};
