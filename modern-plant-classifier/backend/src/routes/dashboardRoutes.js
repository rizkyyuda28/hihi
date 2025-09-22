const express = require('express');
const router = express.Router();
const PredictionHistory = require('../models/PredictionHistory');
const User = require('../models/User');
const { Op } = require('sequelize');
const { authenticateUser, requireAuth } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');
    
    const userId = req.user.id;
    console.log('🔍 User ID for dashboard stats:', userId);
    
    // Build where clause for user-specific data
    const whereClause = { user_id: userId };
    
    // Get total predictions for this user
    const totalPredictions = await PredictionHistory.count({
      where: whereClause
    });
    
    // Get today's predictions for this user
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayPredictions = await PredictionHistory.count({
      where: {
        ...whereClause,
        created_at: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });
    
    // Get average confidence for this user
    const avgConfidenceResult = await PredictionHistory.findOne({
      where: whereClause,
      attributes: [
        [PredictionHistory.sequelize.fn('AVG', PredictionHistory.sequelize.col('confidence')), 'avgConfidence']
      ]
    });
    
    const avgConfidence = avgConfidenceResult ? parseFloat(avgConfidenceResult.dataValues.avgConfidence) || 0 : 0;
    
    // Get healthy vs diseased counts for this user
    const healthyCount = await PredictionHistory.count({
      where: { ...whereClause, status: 'healthy' }
    });
    
    const diseasedCount = await PredictionHistory.count({
      where: { ...whereClause, status: 'diseased' }
    });
    
    const stats = {
      totalPredictions,
      todayPredictions,
      avgConfidence: Math.round(avgConfidence * 10) / 10, // Round to 1 decimal
      healthyPlants: healthyCount,
      diseasedPlants: diseasedCount
    };
    
    console.log('✅ Dashboard stats for user', userId, ':', stats);
    
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
router.get('/recent-predictions', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('📋 Fetching recent predictions...');
    
    const userId = req.user.id;
    console.log('🔍 User ID for recent predictions:', userId);
    
    const limit = parseInt(req.query.limit) || 10;
    
    // Build where clause for user-specific data
    const whereClause = { user_id: userId };
    
    const recentPredictions = await PredictionHistory.findAll({
      where: whereClause,
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
    
    console.log(`✅ Found ${formattedPredictions.length} recent predictions for user ${userId}`);
    
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
router.get('/history', authenticateUser, requireAuth, async (req, res) => {
  try {
    console.log('📚 Fetching prediction history...');
    
    const userId = req.user.id;
    console.log('🔍 User ID for prediction history:', userId);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Build where clause for user-specific data
    const whereClause = { user_id: userId };
    
    const { count, rows } = await PredictionHistory.findAndCountAll({
      where: whereClause,
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
    
    console.log(`✅ Found ${count} prediction history records for user ${userId}`);
    
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

