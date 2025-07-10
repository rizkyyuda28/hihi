const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sequelize, testConnection } = require('./config/database');

// Import models
const Plant = require('./models/Plant');
const Disease = require('./models/Disease');
const TrainingDataset = require('./models/TrainingDataset');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Database Associations
Plant.hasMany(Disease, { foreignKey: 'plant_id', as: 'diseases' });
Disease.belongsTo(Plant, { foreignKey: 'plant_id', as: 'plant' });
Disease.hasMany(TrainingDataset, { foreignKey: 'disease_id', as: 'datasets' });
TrainingDataset.belongsTo(Disease, { foreignKey: 'disease_id', as: 'disease' });

// Mock ML Service dengan data dari database
const mlService = {
  predict: async (imagePath) => {
    try {
      // Get diseases from database
      const diseases = await Disease.findAll({
        where: { is_active: true },
        include: [{ model: Plant, as: 'plant' }]
      });
      
      if (diseases.length === 0) {
        throw new Error('No diseases found in database');
      }
      
      // Generate random prediction from database
      const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
      const confidence = (Math.random() * 0.4 + 0.6); // 60-100% confidence
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        predictions: [{
          className: randomDisease.model_class_name,
          probability: confidence,
          disease: randomDisease
        }],
        topPrediction: {
          className: randomDisease.model_class_name,
          probability: confidence,
          disease: randomDisease
        }
      };
    } catch (error) {
      console.error('ML Service error:', error);
      // Fallback to static prediction
      const fallbackClasses = [
        'Corn_(maize)___healthy',
        'Potato___healthy', 
        'Tomato___healthy'
      ];
      const randomClass = fallbackClasses[Math.floor(Math.random() * fallbackClasses.length)];
      return {
        predictions: [{ className: randomClass, probability: 0.85 }],
        topPrediction: { className: randomClass, probability: 0.85 }
      };
    }
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Plant Disease Classifier API - PostgreSQL Version',
    status: 'running',
    database: 'PostgreSQL',
    endpoints: {
      prediction: 'POST /api/predict/predict',
      health: 'GET /api/health',
      plants: 'GET /api/plants',
      diseases: 'GET /api/diseases'
    }
  });
});

app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'backend-postgres',
    database: {
      connected: dbConnected,
      type: 'PostgreSQL'
    }
  });
});

// Get all plants
app.get('/api/plants', async (req, res) => {
  try {
    const plants = await Plant.findAll({
      where: { is_active: true },
      include: [{ 
        model: Disease, 
        as: 'diseases',
        where: { is_active: true },
        required: false
      }]
    });
    res.json({ success: true, data: plants });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all diseases
app.get('/api/diseases', async (req, res) => {
  try {
    const diseases = await Disease.findAll({
      where: { is_active: true },
      include: [{ model: Plant, as: 'plant' }]
    });
    res.json({ success: true, data: diseases });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
    
    // Get prediction from ML service
    const prediction = await mlService.predict(req.file.path);
    
    // Parse result from database or fallback
    let result;
    if (prediction.topPrediction.disease) {
      const disease = prediction.topPrediction.disease;
      result = {
        plant: disease.plant.name,
        disease: disease.name,
        confidence: Math.round(prediction.topPrediction.probability * 100),
        isHealthy: disease.is_healthy,
        recommendation: disease.treatment || "Konsultasikan dengan ahli pertanian.",
        symptoms: disease.symptoms,
        prevention: disease.prevention,
        severity: disease.severity_level
      };
    } else {
      // Fallback parsing
      const parseClassName = (className) => {
        const parts = className.split('___');
        if (parts.length >= 2) {
          const plant = parts[0].replace(/[()]/g, '').replace(/_/g, ' ');
          const disease = parts[1].replace(/_/g, ' ');
          return { plant, disease, isHealthy: disease.toLowerCase().includes('healthy') };
        }
        return { plant: 'Unknown', disease: className.replace(/_/g, ' '), isHealthy: false };
      };
      
      const parsed = parseClassName(prediction.topPrediction.className);
      result = {
        plant: parsed.plant,
        disease: parsed.disease,
        confidence: Math.round(prediction.topPrediction.probability * 100),
        isHealthy: parsed.isHealthy,
        recommendation: parsed.isHealthy ? 
          "Tanaman terlihat sehat! Lanjutkan perawatan yang baik." :
          "Konsultasikan dengan ahli pertanian untuk penanganan yang tepat."
      };
    }

    // Clean up uploaded file
    setTimeout(() => {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }, 5000);

    res.json({
      success: true,
      prediction: {
        ...result,
        timestamp: new Date().toISOString()
      },
      metadata: {
        filename: req.file.originalname,
        fileSize: req.file.size,
        processingTime: '1.0s'
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

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.log('⚠️ Starting without database connection...');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Plant Disease Classifier API running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log('🧠 ML Service: Database + Fallback mode');
      console.log('🗄️ Database: PostgreSQL');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 