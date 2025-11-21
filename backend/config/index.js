/**
 * Configuration Module
 * Centralizes all environment variables and configuration settings
 * Supports multiple environments: development, production, test
 */

require('dotenv').config();

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    host: process.env.HOST || '0.0.0.0',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key-only-for-dev',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },

  // Database Configuration
  database: {
    path: process.env.DB_PATH || './database.db',
    verbose: process.env.NODE_ENV === 'development',
  },

  // Security Configuration
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
};

// Validation for production environment
if (config.isProduction) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret-key-only-for-dev') {
    console.error('ERROR: JWT_SECRET must be set in production environment');
    process.exit(1);
  }

  if (config.cors.origin === '*') {
    console.warn('WARNING: CORS is set to allow all origins. Consider restricting in production.');
  }
}

module.exports = config;
