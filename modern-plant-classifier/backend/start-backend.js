// Load environment variables
require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const PredictionHistory = require('./src/models/PredictionHistory');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const mlService = require('./src/services/realMLService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002', 'http://127.0.0.1:5173'],
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
    console.log('🔐 Login attempt - Full request body:', req.body);
    console.log('🔐 Headers:', req.headers);
    
    // Handle potential double nesting from frontend
    let credentials = req.body;
    if (credentials.username && typeof credentials.username === 'object') {
      // If username is an object, it means we have double nesting
      credentials = credentials.username;
    }
    
    const { username, password } = credentials;

    if (!username || !password) {
      console.log('❌ Missing credentials:', { username, password });
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
      console.log('❌ User not found or inactive');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    console.log('✅ Login successful for user:', user.username);

    // Return success response with token (as expected by frontend)
    res.json({
      success: true,
      message: 'Login successful',
      token: 'jwt_token_' + Date.now(), // Mock token for now
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

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
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // For now, just validate that token exists (mock validation)
    if (token && token.startsWith('jwt_token_')) {
      // Mock user data - in real app, decode JWT and get user from DB
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

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// ML Service status endpoint
app.get('/api/ml/status', async (req, res) => {
  try {
    const status = await mlService.healthCheck();
    res.json({
      success: true,
      ml_service: status
    });
  } catch (error) {
    res.json({
      success: false,
      error: 'Failed to check ML service status'
    });
  }
});

// Get available classes endpoint
app.get('/api/ml/classes', async (req, res) => {
  try {
    const classes = await mlService.getAvailableClasses();
    res.json(classes);
  } catch (error) {
    res.json({
      success: false,
      error: 'Failed to get classes'
    });
  }
});

// Real prediction endpoint with ML integration
app.post('/api/predict', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    console.log('🔍 Processing prediction for image:', req.file.filename);

    // Get ML prediction
    const mlResult = await mlService.predict(req.file.path);
    
    if (!mlResult.success) {
      return res.status(500).json({
        success: false,
        error: mlResult.error || 'Prediction failed'
      });
    }

    const prediction = mlResult.prediction;
    const confidence = prediction.confidence;
    const confidencePercentage = Math.round(confidence * 100);

    // Get detailed recommendations from ML service
    const recommendations = prediction.recommendations || [];
    const severityLevel = prediction.severityLevel || 'Medium';

    // Save prediction to database
    try {
      await PredictionHistory.create({
        user_id: null, // Guest user
        image_path: req.file.filename,
        prediction: `${prediction.plant} - ${prediction.disease}`,
        confidence: confidencePercentage,
        status: prediction.status,
        plant_type: prediction.plant,
        disease_name: prediction.disease,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });
      console.log('✅ Prediction saved to database');
    } catch (dbError) {
      console.error('❌ Error saving prediction to database:', dbError);
      // Continue even if database save fails
    }

    // Prepare response
    const response = {
      success: true,
      prediction: {
        plant: prediction.plant,
        disease: prediction.disease,
        confidence: confidence,
        confidencePercentage: confidencePercentage,
        status: prediction.status,
        recommendations: recommendations,
        severityLevel: severityLevel,
        full_class: prediction.full_class
      },
      image: req.file.filename,
      model_info: {
        service: mlResult.fallback ? 'Fallback' : 'Real ML Service',
        accuracy: mlResult.model_info?.accuracy || '86.12%',
        total_classes: mlResult.model_info?.total_classes || 17
      }
    };

    // Add top predictions if available
    if (mlResult.top_predictions) {
      response.top_predictions = mlResult.top_predictions;
    }

    console.log('✅ Prediction completed:', {
      plant: prediction.plant,
      disease: prediction.disease,
      confidence: confidencePercentage + '%',
      service: response.model_info.service
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Prediction error:', error);
    res.status(500).json({
      success: false,
      error: 'Prediction failed: ' + error.message
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Plant Disease Classifier Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`🧠 Prediction endpoint: http://localhost:${PORT}/api/predict`);
  console.log(`🗄️ Database: SQLite`);
  
  // Test database connection and sync models
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync all models to create tables
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
});
