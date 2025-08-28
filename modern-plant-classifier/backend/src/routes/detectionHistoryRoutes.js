const express = require('express');
const router = express.Router();
const { authenticateToken, authenticateSession } = require('../middleware/authMiddleware');
const DetectionHistory = require('../models/DetectionHistory');
const { Op } = require('sequelize');

// Get user's detection history (requires authentication)
router.get('/my-history', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await DetectionHistory.findAndCountAll({
      where: {
        userId: req.user.id
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: [
        'id', 'imageFileName', 'originalImageName', 'plantClass', 
        'confidence', 'recommendations', 'createdAt'
      ]
    });

    res.json({
      success: true,
      data: {
        detections: rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching detection history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch detection history',
      message: 'Internal server error'
    });
  }
});

// Get detection history by ID (requires authentication)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const detection = await DetectionHistory.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      attributes: [
        'id', 'imageFileName', 'originalImageName', 'plantClass', 
        'confidence', 'recommendations', 'predictionResult', 'createdAt'
      ]
    });

    if (!detection) {
      return res.status(404).json({
        success: false,
        error: 'Detection not found',
        message: 'Detection history not found or access denied'
      });
    }

    res.json({
      success: true,
      data: detection
    });
  } catch (error) {
    console.error('Error fetching detection details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch detection details',
      message: 'Internal server error'
    });
  }
});

// Delete detection history (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const detection = await DetectionHistory.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!detection) {
      return res.status(404).json({
        success: false,
        error: 'Detection not found',
        message: 'Detection history not found or access denied'
      });
    }

    await detection.destroy();

    res.json({
      success: true,
      message: 'Detection history deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting detection history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete detection history',
      message: 'Internal server error'
    });
  }
});

// Get detection statistics for user (requires authentication)
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const totalDetections = await DetectionHistory.count({
      where: { userId: req.user.id }
    });

    const plantClassStats = await DetectionHistory.findAll({
      where: { userId: req.user.id },
      attributes: [
        'plantClass',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['plantClass'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });

    const recentDetections = await DetectionHistory.count({
      where: {
        userId: req.user.id,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalDetections,
        plantClassStats,
        recentDetections,
        lastDetection: await DetectionHistory.max('createdAt', {
          where: { userId: req.user.id }
        })
      }
    });
  } catch (error) {
    console.error('Error fetching detection stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch detection statistics',
      message: 'Internal server error'
    });
  }
});

// Search detection history (requires authentication)
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query, plantClass, startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = { userId: req.user.id };

    if (query) {
      whereClause[Op.or] = [
        { originalImageName: { [Op.iLike]: `%${query}%` } },
        { plantClass: { [Op.iLike]: `%${query}%` } }
      ];
    }

    if (plantClass) {
      whereClause.plantClass = plantClass;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows } = await DetectionHistory.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      attributes: [
        'id', 'imageFileName', 'originalImageName', 'plantClass', 
        'confidence', 'recommendations', 'createdAt'
      ]
    });

    res.json({
      success: true,
      data: {
        detections: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error searching detection history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search detection history',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
