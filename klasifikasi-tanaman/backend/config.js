/**
 * Configuration file for the Plant Disease Classifier Backend
 */

const config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,
  HOST: process.env.HOST || 'localhost',

  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
  SESSION_SECRET: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,

  // Database
  DB_PATH: process.env.DB_PATH || './database.sqlite',

  // Machine Learning
  MODEL_PATH: process.env.MODEL_PATH || './tfjs_model/model.json',
  CLASSES_PATH: process.env.CLASSES_PATH || './tfjs_model/classes.json',

  // Upload Configuration
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp'],
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN ? 
    process.env.CORS_ORIGIN.split(',') : 
    ['http://localhost:3001', 'http://localhost:3000'],

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Development flags
  isDevelopment: () => config.NODE_ENV === 'development',
  isProduction: () => config.NODE_ENV === 'production',
  
  // Model configuration
  MODEL_CONFIG: {
    inputShape: [224, 224, 3],
    outputClasses: 17,
    imageSize: 224
  }
};

module.exports = config; 