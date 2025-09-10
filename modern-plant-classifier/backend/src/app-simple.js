// Load environment variables from config.env
require('dotenv').config({ path: '../config.env' });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import database for login functionality
const sequelize = require('./config/database');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002'],
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

// No admin routes import needed

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

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find user by username or email
    const { Op } = require('sequelize');
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
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

    // Get identifiable classes for notification
    const datasetReader = require('./utils/datasetReader');
    const identifiableClasses = datasetReader.getIdentifiableClasses();
    
    // Check if prediction is reliable and if the class is in our dataset
    const isReliable = confidencePercent >= 60;
    const isUnknown = className === 'Unknown' || confidencePercent < 30;
    const isClassInDataset = Object.values(identifiableClasses).some(cls => 
      cls.className.toLowerCase() === className.toLowerCase()
    );
    
    // Check if this is a valid plant image (not a flowchart, document, etc.)
    // If confidence is too high for a non-plant image, it's likely a false positive
    const isLikelyNonPlantImage = confidencePercent > 90 && !isClassInDataset;
    const isInvalidPlantImage = confidencePercent < 30 || isLikelyNonPlantImage;
    
    console.log('🔍 Image validation:', {
      confidencePercent,
      className,
      isClassInDataset,
      isLikelyNonPlantImage,
      isInvalidPlantImage
    });
    
    // Debug: check identifiable classes
    console.log('🔍 Identifiable classes:', Object.keys(identifiableClasses));
    console.log('🔍 Current class:', className);
    
    // For testing: force invalid for high confidence non-plant images
    if (confidencePercent > 90 && !isClassInDataset) {
      console.log('❌ High confidence non-plant image detected, returning notification only');
      return res.json({
        success: true,
        result: null,
        notification: {
          type: 'warning',
          title: 'Foto tidak dikenali',
          message: 'Mohon upload foto tanaman yang sesuai dengan dataset yang tersedia.',
          showPlantList: true
        }
      });
    }

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

    // No database saving needed - just log the prediction
    console.log(`📊 Prediction: ${className} (${confidencePercent}% confidence)`);
    console.log(`📁 File: ${req.file.originalname} (${req.file.size} bytes)`);

    // Clean up uploaded file
    setTimeout(() => {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }, 5000); // Delete after 5 seconds

    // Valid image, return result only
    console.log('✅ Valid image detected, returning prediction result');
    res.json({
      success: true,
      result: {
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
        processingTime: prediction.processingTime / 1000 || 1.0, // Convert to seconds
        metadata: {
          filename: req.file.originalname,
          fileSize: req.file.size,
          plantType: parsedResult.plant,
          mlServiceType: mlServiceType,
          realML: mlServiceType !== 'fallback'
        }
      },
      notification: null
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

// Initialize system (no database needed)
async function initializeSystem() {
  try {
    const datasetReader = require('./utils/datasetReader');
    const datasets = datasetReader.getAvailableDatasets();
    const totalImages = datasets.reduce((sum, dataset) => sum + dataset.imageCount, 0);
    
    console.log('✅ System initialized successfully');
    console.log(`📊 Found ${datasets.length} datasets with ${totalImages} total images`);
    console.log(`🌱 Supported plants: ${[...new Set(datasets.map(d => d.plantType))].join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error initializing system:', error.message);
    console.log('⚠️ Continuing with limited functionality...');
  }
}

// API endpoint for system information (no database needed)
app.get('/api/stats', async (req, res) => {
  try {
    const datasetReader = require('./utils/datasetReader');
    const datasets = datasetReader.getAvailableDatasets();
    const totalImages = datasets.reduce((sum, dataset) => sum + dataset.imageCount, 0);
    
    res.json({
      success: true,
      systemInfo: {
        totalDatasets: datasets.length,
        totalImages: totalImages,
        mlServiceType: mlServiceType,
        supportedPlants: [...new Set(datasets.map(d => d.plantType))],
        modelAccuracy: '86.12%'
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get system information',
      details: error.message
    });
  }
});

// API endpoint to get list of identifiable plants
app.get('/api/plants', async (req, res) => {
  try {
    const datasetReader = require('./utils/datasetReader');
    const plantGroups = datasetReader.getDatasetsByPlantType();
    const totalDatasets = Object.values(plantGroups).reduce((sum, group) => sum + group.length, 0);

    res.json({
      success: true,
      plants: plantGroups,
      total_datasets: totalDatasets,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting plants list:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get plants list',
      details: error.message
    });
  }
});

// No admin routes needed - datasets are read from folder structure

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Plant Disease Classifier API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📊 Statistics: http://localhost:${PORT}/api/stats`);
  console.log(`🧠 ML Service: ${mlServiceType} mode`);
  console.log(`🎯 Real ML: ${mlServiceType !== 'fallback' ? 'YES' : 'NO'}`);
  
  // Initialize system
  await initializeSystem();
});

module.exports = app; 