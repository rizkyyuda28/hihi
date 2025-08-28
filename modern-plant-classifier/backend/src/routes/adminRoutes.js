const express = require('express');
const router = express.Router();
const datasetController = require('../controllers/datasetController');

// No auth middleware - public admin routes

// Dataset Management Routes
router.post('/datasets', 
  datasetController.uploadDataset.array('images', 50), // Max 50 images
  datasetController.createDataset
);

router.get('/datasets', datasetController.getDatasets);
router.get('/datasets/stats', datasetController.getDatasetStats);
router.delete('/datasets/:id', datasetController.deleteDataset);

// Admin dashboard info
router.get('/dashboard', async (req, res) => {
  try {
    const Dataset = require('../models/Dataset');
    const Prediction = require('../models/Prediction');
    
    const [totalDatasets, totalImages, totalPredictions] = await Promise.all([
      Dataset.count(),
      Dataset.sum('image_count') || 0,
      Prediction.count()
    ]);

    res.json({
      success: true,
      dashboard: {
        totalDatasets,
        totalImages,
        totalPredictions,
        systemStatus: 'operational'
      }
    });
  } catch (error) {
    console.error('❌ Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

module.exports = router; 