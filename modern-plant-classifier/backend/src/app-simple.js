const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Database imports
const { sequelize } = require('./config/database');
const Prediction = require('./models/Prediction');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Load ML services in order of preference: Python ML > TensorFlow.js > Fallback
let mlService;
let mlServiceType = 'fallback';

try {
  console.log('🐍 Attempting to load Python ML Service...');
  mlService = require('./services/mlService.python');
  mlServiceType = 'python';
  console.log('✅ Python ML Service loaded successfully - REAL MACHINE LEARNING!');
} catch (pythonError) {
  console.log('⚠️ Python ML failed to load, trying TensorFlow.js...');
  console.log('💡 Python error:', pythonError.message);
  
  try {
    console.log('🤖 Attempting to load TensorFlow.js ML Service...');
    mlService = require('./services/mlService');
    mlServiceType = 'tensorflowjs';
    console.log('✅ TensorFlow.js ML Service loaded successfully');
  } catch (tfError) {
    console.log('⚠️ TensorFlow.js failed to load, using fallback service');
    console.log('💡 TensorFlow.js error:', tfError.message);
    mlService = require('./services/mlService.fallback');
    mlServiceType = 'fallback';
    console.log('🔄 Fallback ML Service loaded (mock predictions)');
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Plant Disease Classifier API - Simple Version',
    status: 'running',
    endpoints: {
      prediction: 'POST /api/predict/predict',
      health: 'GET /api/health'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'backend-simple'
  });
});

// Prediction endpoint
app.post('/api/predict/predict', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    console.log('Processing image:', req.file.filename);
    console.log(`🔍 Using ${mlServiceType} ML service`);
    
    // Get prediction from ML service (Python/TensorFlow.js/Fallback)
    const prediction = await mlService.predict(req.file.path);
    
    // Parse class name for better display
    const parseClassName = (className) => {
      const parts = className.split('___');
      if (parts.length >= 2) {
        const plant = parts[0].replace(/[()]/g, '').replace(/_/g, ' ');
        const disease = parts[1].replace(/_/g, ' ');
        return {
          plant,
          disease,
          isHealthy: disease.toLowerCase().includes('healthy')
        };
      }
      return {
        plant: 'Unknown',
        disease: className.replace(/_/g, ' '),
        isHealthy: false
      };
    };

    // Handle different response formats (real ML vs fallback)
    const className = prediction.className || prediction.topPrediction?.className || 'Unknown';
    const confidence = prediction.confidence || prediction.topPrediction?.probability || 0.5;
    
    const parsedResult = parseClassName(className);
    const confidencePercent = Math.round(confidence * 100);

    // Generate recommendations
    const getRecommendation = (disease, isHealthy) => {
      if (isHealthy) {
        return "Tanaman terlihat sehat! Lanjutkan perawatan yang baik.";
      }
      
      const recommendations = {
        'cercospora': 'Gunakan fungisida berbasis copper dan tingkatkan drainase.',
        'rust': 'Aplikasikan fungisida dan pastikan sirkulasi udara yang baik.',
        'blight': 'Gunakan fungisida preventif dan hindari penyiraman dari atas.',
        'bacterial': 'Gunakan bakterisida dan tingkatkan sanitasi kebun.',
        'leaf mold': 'Kurangi kelembaban dan tingkatkan ventilasi.',
        'septoria': 'Pangkas daun yang terinfeksi dan gunakan fungisida.',
        'spider mites': 'Gunakan mitisida atau semprotkan air untuk mengurangi populasi.',
        'target spot': 'Aplikasikan fungisida dan hindari irigasi overhead.',
        'mosaic virus': 'Buang tanaman yang terinfeksi dan kontrol serangga vektor.',
        'yellow leaf curl': 'Gunakan varietas tahan dan kontrol whitefly.'
      };
      
      const diseaseKey = Object.keys(recommendations).find(key => 
        disease.toLowerCase().includes(key)
      );
      
      return diseaseKey ? recommendations[diseaseKey] : 
        'Konsultasikan dengan ahli pertanian untuk penanganan yang tepat.';
    };

    const recommendation = getRecommendation(parsedResult.disease, parsedResult.isHealthy);

    // Save prediction to database
    try {
      const predictionRecord = await Prediction.create({
        imageFilename: req.file.originalname,
        imagePath: req.file.path,
        predictedClass: className,
        predictedClassId: prediction.classId || 0,
        confidence: confidence,
        plantType: parsedResult.plant,
        diseaseType: parsedResult.disease,
        isHealthy: parsedResult.isHealthy,
        processingTime: prediction.processingTime || 1000,
        modelUsed: `klasifikasi-tanaman-${mlServiceType}`,
        modelAccuracy: '86.12%',
        allProbabilities: prediction.probabilities || {},
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress,
        isRealML: mlServiceType !== 'fallback',
        metadata: {
          fileSize: req.file.size,
          mimetype: req.file.mimetype,
          mlServiceType: mlServiceType,
          confidencePercent: confidencePercent
        }
      });
      
      console.log(`💾 Prediction saved to database with ID: ${predictionRecord.id}`);
    } catch (dbError) {
      console.error('❌ Failed to save prediction to database:', dbError.message);
      // Don't fail the request if database save fails
    }

    // Clean up uploaded file
    setTimeout(() => {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }, 5000); // Delete after 5 seconds

    res.json({
      success: true,
      plant: {
        name: parsedResult.disease,  // Disease name as main identifier
        scientificName: null,
        description: `Detected ${parsedResult.disease} on ${parsedResult.plant}`,
        symptoms: parsedResult.isHealthy ? 
          "No visible symptoms detected" : 
          "Visible damage or discoloration on leaves",
        treatment: recommendation,
        prevention: parsedResult.isHealthy ? 
          "Continue regular care and monitoring" :
          "Apply recommended treatment and improve growing conditions",
        severity: parsedResult.isHealthy ? 'Low' : 
          (confidencePercent > 80 ? 'Medium' : 'High')
      },
      confidence: confidence,  // Already in decimal format (0.0-1.0)
      timestamp: new Date().toISOString(),
      processingTime: 1.0,
      metadata: {
        filename: req.file.originalname,
        fileSize: req.file.size,
        plantType: parsedResult.plant
      }
    });

  } catch (error) {
    console.error('Prediction error:', error);
    
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Prediction failed',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// Initialize database
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log('📊 Database tables synchronized');
    
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    console.log('⚠️ Continuing without database...');
  }
}

// API endpoint for prediction statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await Prediction.getStatistics();
    const recentPredictions = await Prediction.getRecentPredictions(10);
    
    res.json({
      success: true,
      statistics: stats,
      recentPredictions: recentPredictions,
      mlServiceType: mlServiceType,
      totalPredictions: stats.reduce((sum, stat) => sum + parseInt(stat.count), 0)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Plant Disease Classifier API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📊 Statistics: http://localhost:${PORT}/api/stats`);
  console.log(`🧠 ML Service: ${mlServiceType} mode`);
  console.log(`🎯 Real ML: ${mlServiceType !== 'fallback' ? 'YES' : 'NO'}`);
  
  // Initialize database
  await initializeDatabase();
});

module.exports = app; 