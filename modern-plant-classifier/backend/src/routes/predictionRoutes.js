const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const { handleImageUpload, validateUploadedFile } = require('../middleware/uploadMiddleware');
const { optionalAuth } = require('../middleware/authMiddleware');
const guestDetectionLimit = require('../middleware/guestDetectionLimit');
const { validateDatasetFilename } = require('../middleware/datasetValidationMiddleware');

// POST /api/predict - Predict disease from uploaded image (guests allowed with limit)
router.post('/predict', 
  guestDetectionLimit,
  optionalAuth,
  handleImageUpload,
  validateUploadedFile,
  validateDatasetFilename, // Add dataset filename validation
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

// GET /api/predict/guest-limit - Check guest detection limit
router.get('/guest-limit', 
  predictionController.checkGuestLimit
);

// GET /api/predict/allowed-keywords - Get list of allowed keywords for filenames
router.get('/allowed-keywords', 
  (req, res) => {
    const { ALLOWED_WORDS, ALLOWED_PLANT_NAMES, ALLOWED_DISEASE_NAMES } = require('../middleware/datasetValidationMiddleware');
    
    res.json({
      success: true,
      data: {
        allowedKeywords: ALLOWED_WORDS,
        plantNames: ALLOWED_PLANT_NAMES,
        diseaseNames: ALLOWED_DISEASE_NAMES,
        totalKeywords: ALLOWED_WORDS.length,
        examples: [
          'corn_healthy.jpg',
          'tomato_blight.jpg', 
          'potato_rust.jpg',
          'jagung_sehat.jpg',
          'tomat_penyakit.jpg',
          'kentang_healthy.jpg'
        ]
      }
    });
  }
);

module.exports = router; 