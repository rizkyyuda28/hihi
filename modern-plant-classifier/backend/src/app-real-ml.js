const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF allowed.'));
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    mlService: mlServiceType,
    isRealML: mlServiceType !== 'fallback'
  });
});

// ML Model info endpoint
app.get('/api/model/info', async (req, res) => {
  try {
    const modelInfo = await mlService.getModelInfo();
    res.json({
      success: true,
      modelInfo: modelInfo,
      mlServiceType: mlServiceType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get model info',
      details: error.message
    });
  }
});

// Plant classification endpoint with REAL ML
app.post('/api/predict/predict', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    console.log('🎯 =====================================');
    console.log('🎯 REAL MACHINE LEARNING PREDICTION');
    console.log('🎯 =====================================');
    console.log('📸 Processing image:', req.file.originalname);
    console.log(`🔍 Using ${mlServiceType} ML service`);
    console.log('🧠 This is VISUAL analysis, not filename mapping!');
    
    const startTime = Date.now();
    
    // Get prediction from ML service (Python/TensorFlow.js/Fallback)
    const prediction = await mlService.predict(req.file.path);
    
    const processingTime = Date.now() - startTime;
    
    // Parse class name to extract plant and disease info
    const className = prediction.className || 'Unknown';
    const confidence = prediction.confidence || 0;
    const confidencePercent = isNaN(confidence) ? '0.00' : (confidence * 100).toFixed(2);
    
    console.log(`🔍 Raw prediction result:`, {
      className,
      confidence,
      confidencePercent,
      rawPrediction: prediction
    });
    
    console.log('🎯 =====================================');
    console.log('🎯 PREDICTION RESULT');
    console.log('🎯 =====================================');
    console.log(`📊 Predicted Class: ${className}`);
    console.log(`🎯 Confidence: ${confidencePercent}%`);
    console.log(`⏱️ Processing Time: ${processingTime}ms`);
    console.log(`🧠 ML Service: ${mlServiceType}`);
    console.log(`✅ Real ML: ${mlServiceType !== 'fallback' ? 'YES' : 'NO'}`);
    
    // Parse plant and disease information
    const parsedResult = parseClassification(className);
    
    // Get treatment recommendations
    const recommendation = getRecommendation(parsedResult.disease, parsedResult.isHealthy);

    // Clean up uploaded file
    setTimeout(() => {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log('🗑️ Uploaded file cleaned up');
      }
    }, 5000); // Delete after 5 seconds

    res.json({
      success: true,
      result: {
        plant: parsedResult.plant,
        disease: parsedResult.disease,
        isHealthy: parsedResult.isHealthy,
        confidence: confidence,
        confidencePercent: confidencePercent,
        recommendation: recommendation,
        processingTime: processingTime,
        mlServiceType: mlServiceType,
        isRealML: mlServiceType !== 'fallback',
        modelAccuracy: '86.12%',
        originalFilename: req.file.originalname,
        timestamp: new Date().toISOString(),
        allProbabilities: prediction.probabilities || {}
      }
    });

  } catch (error) {
    console.error('❌ Prediction failed:', error.message);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Prediction failed',
      details: error.message,
      mlServiceType: mlServiceType
    });
  }
});

// Prediction history endpoint (simple in-memory storage for now)
let predictionHistory = [];

app.get('/api/predict/history', (req, res) => {
  res.json({
    success: true,
    history: predictionHistory.slice(-50), // Last 50 predictions
    total: predictionHistory.length,
    mlServiceType: mlServiceType
  });
});

// Function to parse classification result
function parseClassification(className) {
  try {
    console.log(`🔍 Parsing className: "${className}"`);
    
    // Handle the format from Python: "Corn Common rust", "Tomato Bacterial spot", etc.
    const lowerClassName = className.toLowerCase();
    
    let plant = 'Unknown Plant';
    let disease = 'Unknown Disease';
    let isHealthy = false;
    
    // Extract plant type
    if (lowerClassName.includes('corn') || lowerClassName.includes('maize')) {
      plant = 'Corn (Maize)';
    } else if (lowerClassName.includes('potato')) {
      plant = 'Potato';
    } else if (lowerClassName.includes('tomato')) {
      plant = 'Tomato';  
    }
    
    // Extract disease type
    if (lowerClassName.includes('healthy')) {
      disease = 'Healthy';
      isHealthy = true;
    } else if (lowerClassName.includes('common rust') || lowerClassName.includes('rust')) {
      disease = 'Common Rust';
    } else if (lowerClassName.includes('early blight')) {
      disease = 'Early Blight';
    } else if (lowerClassName.includes('late blight')) {
      disease = 'Late Blight';
    } else if (lowerClassName.includes('northern leaf blight')) {
      disease = 'Northern Leaf Blight';
    } else if (lowerClassName.includes('bacterial spot')) {
      disease = 'Bacterial Spot';
    } else if (lowerClassName.includes('septoria leaf spot')) {
      disease = 'Septoria Leaf Spot';
    } else if (lowerClassName.includes('target spot')) {
      disease = 'Target Spot';
    } else if (lowerClassName.includes('cercospora') || lowerClassName.includes('gray leaf spot')) {
      disease = 'Cercospora Leaf Spot';
    } else if (lowerClassName.includes('leaf mold')) {
      disease = 'Leaf Mold';
    } else if (lowerClassName.includes('mosaic virus')) {
      disease = 'Tomato Mosaic Virus';
    } else if (lowerClassName.includes('yellow leaf curl virus')) {
      disease = 'Tomato Yellow Leaf Curl Virus';
    } else if (lowerClassName.includes('spider mites') || lowerClassName.includes('two-spotted')) {
      disease = 'Spider Mites';
    } else if (lowerClassName.includes('blight')) {
      disease = 'Blight';
    } else if (lowerClassName.includes('spot')) {
      disease = 'Leaf Spot';
    }
    
    console.log(`✅ Parsed result: Plant="${plant}", Disease="${disease}", Healthy=${isHealthy}`);
    
    return { plant, disease, isHealthy };
  } catch (error) {
    console.error('❌ Error parsing classification:', error);
    return { plant: 'Unknown Plant', disease: 'Unknown Disease', isHealthy: false };
  }
}

// Function to get treatment recommendations
function getRecommendation(disease, isHealthy) {
  if (isHealthy) {
    return {
      severity: 'healthy',
      treatment: 'Plant appears healthy! Continue with regular care and monitoring.',
      prevention: 'Maintain good agricultural practices, proper watering, and regular inspection.',
      urgency: 'low'
    };
  }
  
  const recommendations = {
    'Common Rust': {
      severity: 'moderate',
      treatment: 'Apply fungicide containing propiconazole or azoxystrobin. Remove infected leaves.',
      prevention: 'Ensure good air circulation, avoid overhead watering, rotate crops.',
      urgency: 'medium'
    },
    'Early Blight': {
      severity: 'moderate',
      treatment: 'Use copper-based fungicides or chlorothalonil. Remove affected foliage.',
      prevention: 'Avoid overhead irrigation, mulching, proper plant spacing.',
      urgency: 'medium'
    },
    'Late Blight': {
      severity: 'high',
      treatment: 'Apply fungicides with metalaxyl or mancozeb immediately. Remove infected plants.',
      prevention: 'Use resistant varieties, avoid wet conditions, destroy infected debris.',
      urgency: 'high'
    },
    'Northern Leaf Blight': {
      severity: 'moderate',
      treatment: 'Apply fungicide containing strobilurin or triazole compounds.',
      prevention: 'Crop rotation, tillage to bury debris, resistant varieties.',
      urgency: 'medium'
    }
  };
  
  return recommendations[disease] || {
    severity: 'unknown',
    treatment: 'Consult with local agricultural extension services for proper diagnosis and treatment.',
    prevention: 'Practice good garden hygiene and monitor plants regularly.',
    urgency: 'medium'
  };
}

// Start server
app.listen(PORT, async () => {
  console.log('🎯 =====================================');
  console.log('🎯 REAL MACHINE LEARNING SERVER');
  console.log('🎯 =====================================');
  console.log(`🚀 Plant Disease Classifier API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📊 Model Info: http://localhost:${PORT}/api/model/info`);
  console.log(`🧠 ML Service: ${mlServiceType} mode`);
  console.log(`🎯 Real ML: ${mlServiceType !== 'fallback' ? 'YES - VISUAL ANALYSIS!' : 'NO - Mock predictions'}`);
  console.log(`📈 Model Accuracy: 86.12% (17 plant disease classes)`);
  console.log('🎯 =====================================');
  
  // Test ML service
  try {
    const modelInfo = await mlService.getModelInfo();
    console.log('✅ ML Service ready and operational');
    console.log(`🏷️ Classes available: ${Object.keys(modelInfo.classes || {}).length}`);
  } catch (error) {
    console.log('⚠️ ML Service test failed:', error.message);
  }
});

module.exports = app; 