const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
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

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Plant Disease Classification API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'SQLite'
  });
});

// Prediction endpoint with correct response format
app.post('/api/predict', upload.single('image'), (req, res) => {
  try {
    console.log('🧠 Prediction request received');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    console.log('📁 File received:', req.file.filename);

    // Response format that matches frontend expectations
    const prediction = {
      plant: {
        name: 'Corn',
        severity: 'Low',
        description: 'Healthy corn plant with no signs of disease',
        symptoms: 'No visible symptoms of disease',
        treatment: 'Continue current care routine',
        prevention: 'Maintain proper watering and fertilization',
        scientificName: 'Zea mays'
      },
      disease: 'Healthy',
      confidence: 0.95,
      recommendations: 'Plant appears healthy. Continue current care routine.',
      processingTime: 1.2
    };

    console.log('📤 Sending response:', {
      success: true,
      prediction: prediction,
      image: req.file.filename
    });

    res.json({
      success: true,
      prediction: prediction,
      image: req.file.filename
    });

  } catch (error) {
    console.error('❌ Prediction error:', error);
    res.status(500).json({
      success: false,
      error: 'Prediction failed'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test Prediction Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🧠 Prediction: http://localhost:${PORT}/api/predict`);
  console.log(`\n🎯 Ready to test prediction response format!`);
});
