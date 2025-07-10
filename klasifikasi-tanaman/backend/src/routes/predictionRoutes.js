/**
 * Prediction Routes
 * Handles all ML prediction-related endpoints
 */

const express = require('express');
const { param, query } = require('express-validator');
const router = express.Router();

// Import controllers
const {
  predictController,
  getHistoryController,
  getPredictionController,
  getModelInfoController,
  healthCheckController,
  getStatsController
} = require('../controllers/predictionController');

// Import middleware
const { 
  uploadSingle, 
  validateImageFile 
} = require('../middleware/uploadMiddleware');
const { 
  requireAuth, 
  optionalAuth, 
  requireRole 
} = require('../middleware/authMiddleware');
const { 
  predictionLimiter, 
  uploadLimiter,
  generalLimiter 
} = require('../middleware/rateLimitMiddleware');

/**
 * @route   POST /api/predict
 * @desc    Predict plant disease from uploaded image
 * @access  Public (with rate limiting)
 */
router.post('/',
  predictionLimiter,
  uploadLimiter,
  optionalAuth, // Optional auth to track user predictions
  uploadSingle('image'),
  validateImageFile,
  predictController
);

/**
 * @route   GET /api/predict/history
 * @desc    Get prediction history for authenticated user
 * @access  Private
 * @query   limit - Number of predictions to return (default: 10)
 * @query   offset - Number of predictions to skip (default: 0)
 */
router.get('/history',
  generalLimiter,
  requireAuth,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be an integer between 1 and 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer')
  ],
  getHistoryController
);

/**
 * @route   GET /api/predict/:id
 * @desc    Get specific prediction by ID
 * @access  Private (owner or admin)
 */
router.get('/:id',
  generalLimiter,
  optionalAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid prediction ID format')
  ],
  getPredictionController
);

/**
 * @route   GET /api/predict/model/info
 * @desc    Get ML model information
 * @access  Public
 */
router.get('/model/info',
  generalLimiter,
  getModelInfoController
);

/**
 * @route   GET /api/predict/service/health
 * @desc    Health check for ML prediction service
 * @access  Public
 */
router.get('/service/health',
  healthCheckController
);

/**
 * @route   GET /api/predict/admin/stats
 * @desc    Get prediction statistics (admin only)
 * @access  Private (Admin)
 */
router.get('/admin/stats',
  generalLimiter,
  requireAuth,
  requireRole('admin'),
  getStatsController
);

module.exports = router; 