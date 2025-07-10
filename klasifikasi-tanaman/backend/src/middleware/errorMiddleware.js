/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const config = require('../../config');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error logger
 */
const logError = (error, req = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code || 'UNKNOWN',
      statusCode: error.statusCode || 500
    }
  };
  
  if (req) {
    logEntry.request = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      user: req.user ? req.user.username : 'anonymous'
    };
  }
  
  console.error('🚨 Error occurred:', JSON.stringify(logEntry, null, 2));
};

/**
 * Not found middleware (404 handler)
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Resource not found: ${req.method} ${req.originalUrl}`,
    404,
    'NOT_FOUND'
  );
  
  next(error);
};

/**
 * Global error handler middleware
 */
const globalErrorHandler = (error, req, res, next) => {
  // Log the error
  logError(error, req);
  
  // Default error values
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let code = error.code || 'INTERNAL_ERROR';
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
  }
  
  if (error.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  }
  
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  }
  
  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }
  
  if (error.code === 11000) { // MongoDB duplicate key
    statusCode = 400;
    code = 'DUPLICATE_KEY';
    message = 'Duplicate entry found';
  }
  
  // Prepare error response
  const errorResponse = {
    success: false,
    error: message,
    code: code,
    timestamp: new Date().toISOString()
  };
  
  // Add stack trace in development
  if (config.isDevelopment()) {
    errorResponse.stack = error.stack;
    errorResponse.details = error;
  }
  
  // Add request ID if available
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }
  
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 * Wraps async functions to catch errors and pass them to error middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error handler
 */
const validationErrorHandler = (errors) => {
  const messages = errors.map(error => error.msg).join(', ');
  return new AppError(`Validation failed: ${messages}`, 400, 'VALIDATION_ERROR');
};

/**
 * Rate limit error handler
 */
const rateLimitHandler = (req, res) => {
  const error = {
    success: false,
    error: 'Too many requests',
    message: 'You have exceeded the request limit. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    timestamp: new Date().toISOString()
  };
  
  res.status(429).json(error);
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (server) => {
  const signals = ['SIGTERM', 'SIGINT'];
  
  signals.forEach(signal => {
    process.on(signal, () => {
      console.log(`🛑 Received ${signal}, starting graceful shutdown...`);
      
      server.close(() => {
        console.log('✅ HTTP server closed');
        
        // Close other connections (database, etc.)
        process.exit(0);
      });
      
      // Force close after 30 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    });
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    
    server.close(() => {
      process.exit(1);
    });
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    
    server.close(() => {
      process.exit(1);
    });
  });
};

/**
 * Health check error handler
 */
const healthCheckError = (service, error) => {
  return {
    service,
    status: 'unhealthy',
    error: error.message,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  AppError,
  logError,
  notFoundHandler,
  globalErrorHandler,
  asyncHandler,
  validationErrorHandler,
  rateLimitHandler,
  gracefulShutdown,
  healthCheckError
}; 