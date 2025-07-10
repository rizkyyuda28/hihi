/**
 * Prediction Controller
 * Handles plant disease prediction using TensorFlow.js ML service
 */

const { validationResult } = require('express-validator');
const mlService = require('../services/mlService');
const { 
  asyncHandler, 
  AppError, 
  validationErrorHandler 
} = require('../middleware/errorMiddleware');
const { v4: uuidv4 } = require('uuid');

// Simple in-memory prediction history (replace with database in production)
const predictionHistory = new Map();

/**
 * Predict plant disease from uploaded image
 * POST /api/predict
 */
const predictController = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  // Validate file upload
  if (!req.file || !req.file.buffer) {
    throw new AppError(
      'No image file provided. Please upload a valid image.',
      400,
      'NO_IMAGE_PROVIDED'
    );
  }

  const predictionId = uuidv4();
  const userId = req.user ? req.user.id : null;
  const userAgent = req.get('User-Agent') || 'Unknown';

  try {
    console.log(`🔍 Starting prediction ${predictionId} for user: ${userId || 'anonymous'}`);
    
    // Make prediction using ML service
    const mlResult = await mlService.predict(req.file.buffer);
    
    const processingTime = Date.now() - startTime;
    
    // Prepare prediction result
    const prediction = {
      id: predictionId,
      userId: userId,
      result: mlResult.prediction,
      fileInfo: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      metadata: {
        userAgent: userAgent,
        ip: req.ip,
        processingTime: processingTime,
        timestamp: new Date().toISOString()
      }
    };

    // Store in prediction history
    predictionHistory.set(predictionId, prediction);

    // Clean up old predictions (keep last 100)
    if (predictionHistory.size > 100) {
      const oldestKey = predictionHistory.keys().next().value;
      predictionHistory.delete(oldestKey);
    }

    // Log successful prediction
    console.log(`✅ Prediction completed: ${predictionId} - ${mlResult.prediction.class} (${mlResult.prediction.confidencePercentage}%) in ${processingTime}ms`);

    // Prepare response
    const response = {
      success: true,
      message: 'Prediction completed successfully',
      data: {
        predictionId: predictionId,
        result: {
          disease: mlResult.prediction.class,
          confidence: mlResult.prediction.confidence,
          confidencePercentage: mlResult.prediction.confidencePercentage,
          topPredictions: mlResult.prediction.topPredictions
        },
        fileInfo: {
          originalName: req.file.originalname,
          size: req.file.size
        },
        metadata: {
          processingTime: processingTime,
          timestamp: prediction.metadata.timestamp
        }
      }
    };

    // Add recommendations based on disease
    response.data.recommendations = getRecommendations(mlResult.prediction.class);

    res.status(200).json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error(`❌ Prediction failed: ${predictionId} - ${error.message} (${processingTime}ms)`);
    
    // Determine error type and response
    if (error.message.includes('Image preprocessing failed')) {
      throw new AppError(
        'Invalid image format or corrupted file. Please upload a valid image.',
        400,
        'INVALID_IMAGE'
      );
    }
    
    if (error.message.includes('Model loading failed')) {
      throw new AppError(
        'Machine learning service is temporarily unavailable. Please try again later.',
        503,
        'ML_SERVICE_UNAVAILABLE'
      );
    }
    
    // Generic prediction error
    throw new AppError(
      'Prediction failed. Please try again with a different image.',
      500,
      'PREDICTION_FAILED'
    );
  }
});

/**
 * Get prediction history for user
 * GET /api/predict/history
 */
const getHistoryController = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const { limit = 10, offset = 0 } = req.query;

  if (!userId) {
    throw new AppError('Authentication required to view history', 401, 'AUTH_REQUIRED');
  }

  // Filter predictions by user
  const userPredictions = Array.from(predictionHistory.values())
    .filter(p => p.userId === userId)
    .sort((a, b) => new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp))
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.status(200).json({
    success: true,
    message: 'Prediction history retrieved successfully',
    data: {
      predictions: userPredictions.map(p => ({
        id: p.id,
        disease: p.result.class,
        confidence: p.result.confidencePercentage,
        fileName: p.fileInfo.originalName,
        timestamp: p.metadata.timestamp,
        processingTime: p.metadata.processingTime
      })),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: userPredictions.length
      }
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Get specific prediction by ID
 * GET /api/predict/:id
 */
const getPredictionController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null;

  const prediction = predictionHistory.get(id);

  if (!prediction) {
    throw new AppError('Prediction not found', 404, 'PREDICTION_NOT_FOUND');
  }

  // Check if user has access to this prediction
  if (prediction.userId !== userId && (!req.user || req.user.role !== 'admin')) {
    throw new AppError('Access denied to this prediction', 403, 'ACCESS_DENIED');
  }

  res.status(200).json({
    success: true,
    message: 'Prediction retrieved successfully',
    data: {
      prediction: {
        id: prediction.id,
        result: prediction.result,
        fileInfo: prediction.fileInfo,
        metadata: prediction.metadata,
        recommendations: getRecommendations(prediction.result.class)
      }
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Get ML model information
 * GET /api/predict/model-info
 */
const getModelInfoController = asyncHandler(async (req, res) => {
  const modelInfo = mlService.getModelInfo();

  res.status(200).json({
    success: true,
    message: 'Model information retrieved successfully',
    data: {
      model: modelInfo,
      supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      maxFileSize: '10MB',
      inputSize: '224x224 pixels'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Health check for ML service
 * GET /api/predict/health
 */
const healthCheckController = asyncHandler(async (req, res) => {
  const healthResult = await mlService.healthCheck();

  const statusCode = healthResult.status === 'healthy' ? 200 : 503;

  res.status(statusCode).json({
    success: healthResult.status === 'healthy',
    message: `ML service is ${healthResult.status}`,
    data: {
      service: 'ML Prediction Service',
      status: healthResult.status,
      details: healthResult.message,
      testPrediction: healthResult.testPrediction || null
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Get prediction statistics (admin only)
 * GET /api/predict/stats
 */
const getStatsController = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new AppError('Admin access required', 403, 'ADMIN_REQUIRED');
  }

  const predictions = Array.from(predictionHistory.values());
  
  // Calculate statistics
  const stats = {
    total: predictions.length,
    byUser: {},
    byDisease: {},
    avgProcessingTime: 0,
    avgConfidence: 0
  };

  let totalProcessingTime = 0;
  let totalConfidence = 0;

  predictions.forEach(p => {
    // By user
    const userId = p.userId || 'anonymous';
    stats.byUser[userId] = (stats.byUser[userId] || 0) + 1;

    // By disease
    const disease = p.result.class;
    stats.byDisease[disease] = (stats.byDisease[disease] || 0) + 1;

    // Processing time and confidence
    totalProcessingTime += p.metadata.processingTime;
    totalConfidence += p.result.confidence;
  });

  if (predictions.length > 0) {
    stats.avgProcessingTime = Math.round(totalProcessingTime / predictions.length);
    stats.avgConfidence = Math.round((totalConfidence / predictions.length) * 100) / 100;
  }

  res.status(200).json({
    success: true,
    message: 'Prediction statistics retrieved successfully',
    data: stats,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get recommendations based on predicted disease
 * @private
 */
function getRecommendations(disease) {
  const recommendations = {
    'Corn healthy': {
      status: 'healthy',
      message: 'Your corn plant appears to be healthy!',
      actions: ['Continue regular care', 'Monitor for any changes', 'Maintain proper watering']
    },
    'Potato healthy': {
      status: 'healthy', 
      message: 'Your potato plant appears to be healthy!',
      actions: ['Continue regular care', 'Monitor for any changes', 'Ensure good drainage']
    },
    'Tomato healthy': {
      status: 'healthy',
      message: 'Your tomato plant appears to be healthy!',
      actions: ['Continue regular care', 'Monitor for any changes', 'Maintain proper spacing']
    },
    'Corn Cercospora leaf spot': {
      status: 'disease',
      message: 'Corn Cercospora leaf spot detected.',
      actions: ['Remove affected leaves', 'Improve air circulation', 'Apply fungicide if necessary', 'Avoid overhead watering']
    },
    'Corn Common rust': {
      status: 'disease',
      message: 'Corn Common rust detected.',
      actions: ['Remove affected leaves', 'Apply appropriate fungicide', 'Ensure good air circulation', 'Monitor spread']
    },
    'Corn Northern Leaf Blight': {
      status: 'disease',
      message: 'Corn Northern Leaf Blight detected.',
      actions: ['Remove infected debris', 'Rotate crops', 'Apply fungicide treatment', 'Improve drainage']
    }
    // Add more recommendations for other diseases...
  };

  return recommendations[disease] || {
    status: 'unknown',
    message: 'Disease detected. Please consult with a plant pathologist.',
    actions: ['Isolate affected plants', 'Consult agricultural extension service', 'Take photos for expert consultation']
  };
}

module.exports = {
  predictController,
  getHistoryController,
  getPredictionController,
  getModelInfoController,
  healthCheckController,
  getStatsController
}; 