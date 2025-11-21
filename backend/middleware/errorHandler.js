/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

const config = require('../config');

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Default to 500 if no status code
  if (!statusCode) {
    statusCode = 500;
  }

  // Prepare error response
  const response = {
    success: false,
    message: message || 'Internal server error',
    ...(config.isDevelopment && { stack: err.stack }),
  };

  // Log error in development
  if (config.isDevelopment) {
    console.error('Error:', err);
  }

  res.status(statusCode).json(response);
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiError,
  errorHandler,
  notFound,
  asyncHandler,
};
