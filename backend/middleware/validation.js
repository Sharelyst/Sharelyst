/**
 * Validation Middleware
 * Request validation helpers
 */

const { ApiError } = require('./errorHandler');

/**
 * Validate required fields in request body
 */
const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missing = [];
    
    for (const field of fields) {
      if (!req.body[field]) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      throw new ApiError(400, `Missing required fields: ${missing.join(', ')}`);
    }

    next();
  };
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
const validatePassword = (password, minLength = 6) => {
  if (password.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters long` };
  }
  return { valid: true };
};

module.exports = {
  validateRequiredFields,
  validateEmail,
  validatePassword,
};
