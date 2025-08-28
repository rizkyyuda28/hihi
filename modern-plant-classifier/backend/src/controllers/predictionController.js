// Try to load TensorFlow.js service, fallback to mock service if not available
let mlService;
try {
  mlService = require('../services/mlService');
} catch (error) {
  console.warn('⚠️ TensorFlow.js not available, using fallback service in controller');
  mlService = require('../services/mlService.fallback');
}
const Plant = require('../models/Plant');
const Prediction = require('../models/Prediction');
const DetectionHistory = require('../models/DetectionHistory');
const GuestDetectionLimit = require('../models/GuestDetectionLimit');
const path = require('path');
const fs = require('fs').promises;

class PredictionController {
  // Predict disease from uploaded image
  async predictDisease(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No image uploaded' 
        });
      }

      // Check if file passed dataset validation
      if (!req.fileMetadata || !req.fileMetadata.isValidDataset) {
        return res.status(400).json({
          success: false,
          error: 'File validation failed',
          message: 'File must contain valid plant/disease keywords from the dataset'
        });
      }

      const imagePath = req.file.path;
      const filename = req.file.originalname;
      const plantType = req.fileMetadata.plantType;
      const diseaseType = req.fileMetadata.diseaseType;
      
      console.log(`📷 Processing uploaded image: ${imagePath}`);
      console.log(`🌱 Plant type detected: ${plantType}`);
      console.log(`🦠 Disease type detected: ${diseaseType}`);

      // Make ML prediction
      const prediction = await mlService.predict(imagePath);

      // Find plant data from database
      const plant = await Plant.findOne({ 
        where: { modelClassId: prediction.classId } 
      });

      if (!plant) {
        throw new Error(`Plant not found for class ID: ${prediction.classId}`);
      }

      // Save prediction to database
      const predictionRecord = await Prediction.create({
        userId: req.user?.id || null, // null untuk guest users
        plantId: plant.id,
        imagePath: imagePath,
        confidence: prediction.confidence,
        probabilities: prediction.probabilities,
        sessionId: req.sessionID,
        ipAddress: req.ip
      });

      // Save to detection history with enhanced metadata
      await DetectionHistory.create({
        userId: req.user?.id || null,
        ipAddress: req.ip || req.guestIp || 'unknown',
        userAgent: req.headers['user-agent'] || req.guestUserAgent || 'unknown',
        imageFileName: path.basename(imagePath),
        originalImageName: filename,
        predictionResult: {
          ...prediction,
          detectedPlantType: plantType,
          detectedDiseaseType: diseaseType,
          filenameValidation: req.fileMetadata
        },
        confidence: prediction.confidence,
        plantClass: plant.name,
        recommendations: plant.treatment,
        isGuest: !req.user,
        sessionId: req.sessionID
      });

      // Update guest detection limit if user is guest
      if (!req.user && req.guestLimit) {
        await req.guestLimit.update({
          detectionCount: req.guestLimit.detectionCount + 1,
          lastDetectionAt: new Date()
        });
      }

      // Prepare response with enhanced information
      const response = {
        success: true,
        prediction: {
          id: predictionRecord.id,
          plant: {
            id: plant.id,
            name: plant.name,
            scientificName: plant.scientificName,
            description: plant.description,
            symptoms: plant.symptoms,
            treatment: plant.treatment,
            prevention: plant.prevention,
            severity: plant.severity,
            imageUrl: plant.imageUrl
          },
          confidence: prediction.confidence,
          probabilities: prediction.probabilities,
          timestamp: predictionRecord.createdAt,
          filenameAnalysis: {
            originalName: filename,
            detectedPlantType: plantType,
            detectedDiseaseType: diseaseType,
            validationPassed: true
          }
        }
      };

      // Clean up uploaded file after processing
      try {
        await fs.unlink(imagePath);
      } catch (error) {
        console.warn('Failed to delete uploaded file:', error);
      }

      res.json(response);

    } catch (error) {
      console.error('❌ Prediction error:', error);
      
      // Clean up uploaded file in case of error
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.warn('Failed to delete uploaded file after error:', unlinkError);
        }
      }

      res.status(500).json({ 
        success: false, 
        error: 'Prediction failed. Please try again.' 
      });
    }
  }

  // Get prediction history
  async getPredictionHistory(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      
      // If user is logged in, show their predictions
      if (req.user) {
        where.userId = req.user.id;
      } else {
        // For guests, show predictions from current session
        where.sessionId = req.sessionID;
      }

      const { count, rows: predictions } = await Prediction.findAndCountAll({
        where,
        include: [
          {
            model: Plant,
            attributes: ['id', 'name', 'scientificName', 'severity', 'imageUrl']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          predictions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ Get prediction history error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch prediction history' 
      });
    }
  }

  // Get model information
  async getModelInfo(req, res) {
    try {
      const modelInfo = await mlService.getModelInfo();
      
      res.json({
        success: true,
        data: modelInfo
      });

    } catch (error) {
      console.error('❌ Get model info error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch model information' 
      });
    }
  }

  // Get prediction statistics
  async getPredictionStats(req, res) {
    try {
      const where = {};
      
      // If user is logged in, show their stats
      if (req.user) {
        where.userId = req.user.id;
      } else {
        // For guests, show stats from current session
        where.sessionId = req.sessionID;
      }

      const totalPredictions = await Prediction.count({ where });
      
      const topDiseases = await Prediction.findAll({
        where,
        include: [
          {
            model: Plant,
            attributes: ['name', 'severity']
          }
        ],
        attributes: [
          'plantId',
          [Prediction.sequelize.fn('COUNT', Prediction.sequelize.col('plantId')), 'count']
        ],
        group: ['plantId'],
        order: [[Prediction.sequelize.fn('COUNT', Prediction.sequelize.col('plantId')), 'DESC']],
        limit: 5
      });

      res.json({
        success: true,
        data: {
          totalPredictions,
          topDiseases
        }
      });

    } catch (error) {
      console.error('❌ Get prediction stats error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch prediction statistics' 
      });
    }
  }
}

module.exports = new PredictionController(); 