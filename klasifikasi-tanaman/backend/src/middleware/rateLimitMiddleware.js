/**
 * Rate Limiting Middleware
 * Protects against abuse and DoS attacks
 */

const rateLimit = require('express-rate-limit');
const config = require('../../config');

/**
 * General API rate limiting
 */
const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'You have exceeded the general rate limit. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'You have exceeded the general rate limit. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Strict rate limiting for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts',
    message: 'Too many login attempts. Please try again in 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts',
      message: 'Too many login attempts. Please try again in 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Rate limiting for prediction endpoints (more generous for ML operations)
 */
const predictionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 predictions per minute
  message: {
    success: false,
    error: 'Too many prediction requests',
    message: 'You have exceeded the prediction rate limit. Please wait before making another prediction.',
    code: 'PREDICTION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many prediction requests',
      message: 'You have exceeded the prediction rate limit. Please wait before making another prediction.',
      code: 'PREDICTION_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Rate limiting for file uploads
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads per minute
  message: {
    success: false,
    error: 'Too many upload requests',
    message: 'You have exceeded the upload rate limit. Please wait before uploading another file.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many upload requests',
      message: 'You have exceeded the upload rate limit. Please wait before uploading another file.',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Very strict rate limiting for registration
 */
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: {
    success: false,
    error: 'Too many registration attempts',
    message: 'Too many accounts created from this IP. Please try again in an hour.',
    code: 'REGISTRATION_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many registration attempts',
      message: 'Too many accounts created from this IP. Please try again in an hour.',
      code: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Custom rate limiter factory
 * @param {Object} options - Rate limiting options
 * @returns {Function} Rate limiting middleware
 */
const createCustomLimiter = (options) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests',
    code = 'RATE_LIMIT_EXCEEDED'
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: message,
        code: code,
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
        timestamp: new Date().toISOString()
      });
    }
  });
};

/**
 * Rate limiting based on user role
 * Authenticated users get higher limits
 */
const createRoleBasedLimiter = (options) => {
  const {
    anonymous = { windowMs: 15 * 60 * 1000, max: 10 },
    user = { windowMs: 15 * 60 * 1000, max: 50 },
    admin = { windowMs: 15 * 60 * 1000, max: 200 }
  } = options;

  return (req, res, next) => {
    let limits;
    
    if (req.user) {
      if (req.user.role === 'admin') {
        limits = admin;
      } else {
        limits = user;
      }
    } else {
      limits = anonymous;
    }

    const limiter = rateLimit({
      windowMs: limits.windowMs,
      max: limits.max,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        // Use user ID for authenticated users, IP for anonymous
        return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
      },
      handler: (req, res) => {
        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: `You have exceeded the rate limit for ${req.user ? 'your user role' : 'anonymous users'}.`,
          code: 'ROLE_BASED_RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
      }
    });

    limiter(req, res, next);
  };
};

module.exports = {
  generalLimiter,
  authLimiter,
  predictionLimiter,
  uploadLimiter,
  registrationLimiter,
  createCustomLimiter,
  createRoleBasedLimiter
}; 