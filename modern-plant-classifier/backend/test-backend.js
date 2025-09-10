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

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body);
    
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Mock login for testing
    if (username === 'admin' && password === 'admin123') {
      res.json({
        success: true,
        message: 'Login successful',
        token: 'jwt_token_' + Date.now(),
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@plantdisease.com',
          role: 'admin'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Prediction endpoint
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

    // Mock prediction response
    const prediction = {
      plant: 'Corn',
      disease: 'Healthy',
      confidence: 0.95,
      recommendations: 'Plant appears healthy. Continue current care routine.',
      processingTime: 1.2
    };

    res.json({
      success: true,
      result: prediction,
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

// Dashboard stats endpoint
app.get('/api/dashboard/stats', (req, res) => {
  try {
    console.log('📊 Dashboard stats requested');
    
    // Mock stats for testing
    const stats = {
      totalPredictions: 8,
      todayPredictions: 1,
      avgConfidence: 87.1,
      healthyPlants: 4,
      diseasedPlants: 4
    };
    
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

// Recent predictions endpoint
app.get('/api/dashboard/recent-predictions', (req, res) => {
  try {
    console.log('📋 Recent predictions requested');
    
    // Mock recent predictions
    const recentPredictions = [
      {
        id: 1,
        prediction: 'Corn - Healthy',
        confidence: 92.5,
        status: 'healthy',
        plant_type: 'Corn',
        disease_name: null,
        timestamp: '2 minutes ago'
      },
      {
        id: 2,
        prediction: 'Tomato - Late Blight',
        confidence: 88.3,
        status: 'diseased',
        plant_type: 'Tomato',
        disease_name: 'Late Blight',
        timestamp: '1 hour ago'
      }
    ];
    
    res.json({
      success: true,
      data: recentPredictions
    });
    
  } catch (error) {
    console.error('❌ Error fetching recent predictions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent predictions'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`🧠 Prediction: http://localhost:${PORT}/api/predict`);
  console.log(`📊 Dashboard stats: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`📋 Recent predictions: http://localhost:${PORT}/api/dashboard/recent-predictions`);
});
