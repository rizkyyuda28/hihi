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
  console.log('✅ Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Plant Disease Classification API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'SQLite'
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body);
    
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    if (username === 'admin' && password === 'admin123') {
      console.log('✅ Login successful for user:', username);
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
      console.log('❌ Invalid credentials');
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

// Verify token endpoint
app.get('/api/auth/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7);
    
    if (token && token.startsWith('jwt_token_')) {
      res.json({
        success: true,
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
        error: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('❌ Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Token verification failed'
    });
  }
});

// Prediction endpoint with realistic disease detection
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

    // Simulate realistic disease detection based on filename or random
    const filename = req.file.filename.toLowerCase();
    let prediction;

    // Check filename for disease indicators
    if (filename.includes('rust') || filename.includes('spot') || filename.includes('blight')) {
      // Diseased plant prediction
      prediction = {
        plant: {
          name: 'Corn',
          severity: 'High',
          description: 'Corn plant showing signs of rust disease with characteristic reddish-brown spots on leaves',
          symptoms: 'Reddish-brown pustules on leaves, yellowing of foliage, reduced photosynthesis',
          treatment: 'Apply fungicide containing copper or mancozeb. Remove infected leaves. Improve air circulation.',
          prevention: 'Plant resistant varieties, maintain proper spacing, avoid overhead watering, rotate crops',
          scientificName: 'Zea mays'
        },
        disease: 'Common Rust',
        confidence: 0.87,
        recommendations: 'This plant shows clear signs of rust disease. Immediate treatment is recommended to prevent spread.',
        processingTime: 1.2
      };
    } else if (filename.includes('healthy') || filename.includes('normal')) {
      // Healthy plant prediction
      prediction = {
        plant: {
          name: 'Corn',
          severity: 'Low',
          description: 'Healthy corn plant with no visible signs of disease',
          symptoms: 'No visible symptoms of disease',
          treatment: 'Continue current care routine',
          prevention: 'Maintain proper watering and fertilization',
          scientificName: 'Zea mays'
        },
        disease: 'Healthy',
        confidence: 0.92,
        recommendations: 'Plant appears healthy. Continue current care routine.',
        processingTime: 1.1
      };
    } else {
      // Random prediction for other images
      const diseases = [
        {
          plant: {
            name: 'Tomato',
            severity: 'Medium',
            description: 'Tomato plant showing early signs of blight disease',
            symptoms: 'Brown spots on leaves, yellowing, wilting',
            treatment: 'Apply fungicide, remove affected leaves, improve drainage',
            prevention: 'Avoid overhead watering, ensure good air circulation',
            scientificName: 'Solanum lycopersicum'
          },
          disease: 'Early Blight',
          confidence: 0.78,
          recommendations: 'Early intervention recommended to prevent disease spread.',
          processingTime: 1.3
        },
        {
          plant: {
            name: 'Potato',
            severity: 'High',
            description: 'Potato plant infected with late blight disease',
            symptoms: 'Dark lesions on leaves, white mold on underside, rapid wilting',
            treatment: 'Apply copper fungicide immediately, remove infected plants',
            prevention: 'Plant certified disease-free seed, avoid overhead watering',
            scientificName: 'Solanum tuberosum'
          },
          disease: 'Late Blight',
          confidence: 0.91,
          recommendations: 'Urgent treatment required. This disease can spread rapidly.',
          processingTime: 1.4
        }
      ];
      
      prediction = diseases[Math.floor(Math.random() * diseases.length)];
    }

    console.log('✅ Prediction result:', prediction);

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

// Dashboard stats endpoint
app.get('/api/dashboard/stats', (req, res) => {
  try {
    console.log('📊 Dashboard stats requested');
    
    const stats = {
      totalPredictions: 12,
      todayPredictions: 3,
      avgConfidence: 85.2,
      healthyPlants: 5,
      diseasedPlants: 7
    };
    
    console.log('✅ Dashboard stats:', stats);
    
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
    
    const recentPredictions = [
      {
        id: 1,
        prediction: 'Corn - Common Rust',
        confidence: 87.0,
        status: 'diseased',
        plant_type: 'Corn',
        disease_name: 'Common Rust',
        timestamp: '2 minutes ago'
      },
      {
        id: 2,
        prediction: 'Tomato - Early Blight',
        confidence: 78.0,
        status: 'diseased',
        plant_type: 'Tomato',
        disease_name: 'Early Blight',
        timestamp: '1 hour ago'
      },
      {
        id: 3,
        prediction: 'Potato - Healthy',
        confidence: 92.0,
        status: 'healthy',
        plant_type: 'Potato',
        disease_name: null,
        timestamp: '3 hours ago'
      }
    ];
    
    console.log(`✅ Found ${recentPredictions.length} recent predictions`);
    
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
  console.log(`🚀 Realistic Plant Disease Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`🧠 Prediction: http://localhost:${PORT}/api/predict`);
  console.log(`📊 Dashboard stats: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`📋 Recent predictions: http://localhost:${PORT}/api/dashboard/recent-predictions`);
  console.log(`\n🎯 Ready for realistic disease detection!`);
  console.log(`💡 Tip: Use filenames with 'rust', 'spot', or 'blight' for diseased predictions`);
});
