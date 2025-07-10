const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const { handleImageUpload, validateUploadedFile } = require('../middleware/uploadMiddleware');
const { optionalAuth } = require('../middleware/authMiddleware');

// POST /api/predict - Predict disease from uploaded image (guests allowed)
router.post('/predict', 
  optionalAuth,
  handleImageUpload,
  validateUploadedFile,
  predictionController.predictDisease
);

// GET /api/predict/history - Get prediction history
router.get('/history', 
  optionalAuth,
  predictionController.getPredictionHistory
);

// GET /api/predict/stats - Get prediction statistics
router.get('/stats', 
  optionalAuth,
  predictionController.getPredictionStats
);

// GET /api/predict/model-info - Get ML model information
router.get('/model-info', 
  predictionController.getModelInfo
);

module.exports = router; 