const express = require('express');
const router = express.Router();
const PredictionHistory = require('../models/PredictionHistory');
const User = require('../models/User');
const { Op } = require('sequelize');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');
    
    // Get total predictions
    const totalPredictions = await PredictionHistory.count();
    
    // Get today's predictions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayPredictions = await PredictionHistory.count({
      where: {
        created_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });
    
    // Get average confidence
    const avgConfidenceResult = await PredictionHistory.findOne({
      attributes: [
        [PredictionHistory.sequelize.fn('AVG', PredictionHistory.sequelize.col('confidence')), 'avgConfidence']
      ]
    });
    
    const avgConfidence = avgConfidenceResult ? parseFloat(avgConfidenceResult.dataValues.avgConfidence) || 0 : 0;
    
    // Get healthy vs diseased counts
    const healthyCount = await PredictionHistory.count({
      where: { status: 'healthy' }
    });
    
    const diseasedCount = await PredictionHistory.count({
      where: { status: 'diseased' }
    });
    
    const stats = {
      totalPredictions,
      todayPredictions,
      avgConfidence: Math.round(avgConfidence * 10) / 10, // Round to 1 decimal
      healthyPlants: healthyCount,
      diseasedPlants: diseasedCount
    };
    
    console.log('✅ Dashboard stats:', stats);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

// Get recent predictions
router.get('/recent-predictions', async (req, res) => {
  try {
    console.log('📋 Fetching recent predictions...');
    
    const limit = parseInt(req.query.limit) || 10;
    
    const recentPredictions = await PredictionHistory.findAll({
      order: [['created_at', 'DESC']],
      limit: limit,
      attributes: [
        'id',
        'prediction',
        'confidence',
        'status',
        'plant_type',
        'disease_name',
        'created_at'
      ]
    });
    
    // Format the data for frontend
    const formattedPredictions = recentPredictions.map(pred => ({
      id: pred.id,
      prediction: pred.prediction,
      confidence: pred.confidence,
      status: pred.status,
      plant_type: pred.plant_type,
      disease_name: pred.disease_name,
      timestamp: formatTimestamp(pred.created_at)
    }));
    
    console.log(`✅ Found ${formattedPredictions.length} recent predictions`);
    
    res.json({
      success: true,
      data: formattedPredictions
    });
    
  } catch (error) {
    console.error('❌ Error fetching recent predictions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent predictions'
    });
  }
});

// Get prediction history with pagination
router.get('/history', async (req, res) => {
  try {
    console.log('📚 Fetching prediction history...');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await PredictionHistory.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit: limit,
      offset: offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.json({
      success: true,
      data: {
        predictions: rows,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching prediction history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prediction history'
    });
  }
});

// Helper function to format timestamp
function formatTimestamp(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

module.exports = router;

