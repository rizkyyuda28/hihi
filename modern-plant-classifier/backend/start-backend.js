// Load environment variables
require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');
const { User, PredictionHistory } = require('./src/models/associations');

// Ensure associations are loaded
require('./src/models/associations');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const mlService = require('./src/services/realMLService');
const { authenticateUser } = require('./src/middleware/auth');

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
      token: `jwt_token_${user.id}_${user.username}`, // Mock token with user ID and username
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

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt - Full request body:', req.body);
    
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const { Op } = require('sequelize');
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username or email already exists'
      });
    }

    // Create new user
    const newUser = await User.create({
      username: username,
      email: email,
      password: password,
      role: 'user', // Default role is 'user'
      isActive: true
    });

    console.log('✅ User registered successfully:', newUser.username);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Extract user ID and username from token (mock implementation)
    if (token && token.startsWith('jwt_token_')) {
      const tokenParts = token.split('_');
      if (tokenParts.length >= 4) {
        const userId = parseInt(tokenParts[2]);
        const username = tokenParts[3];
        
        // Verify user exists and is active
        const user = await User.findOne({
          where: { 
            id: userId, 
            username: username,
            isActive: true 
          }
        });
        
        if (user) {
          res.json({
            success: true,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role
            }
          });
        } else {
          res.status(401).json({
            success: false,
            error: 'User not found or inactive'
          });
        }
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid token format'
        });
      }
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

// Admin endpoints
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Update user endpoint
app.put('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, isActive } = req.body;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if username or email already exists (excluding current user)
    const { Op } = require('sequelize');
    const existingUser = await User.findOne({
      where: {
        [Op.and]: [
          { id: { [Op.ne]: id } },
          {
            [Op.or]: [
              { username: username },
              { email: email }
            ]
          }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username or email already exists'
      });
    }

    // Update user
    await user.update({
      username: username || user.username,
      email: email || user.email,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// Delete user endpoint
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent deleting admin user
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete admin user'
      });
    }

    // Delete user
    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

app.get('/api/admin/analyses', async (req, res) => {
  try {
    // Get analyses with user data
    const analyses = await PredictionHistory.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'prediction', 'confidence', 'image_path', 'disease_name', 'status', 'user_id', 'createdAt']
    });

    console.log('✅ Found analyses:', analyses.length);

    // Get user data separately - include all users for better mapping
    const userIds = [...new Set(analyses.map(a => a.user_id).filter(id => id !== null))];
    console.log('🔍 User IDs found:', userIds);
    
    let users = [];
    if (userIds.length > 0) {
      users = await User.findAll({
        where: { id: userIds },
        attributes: ['id', 'username', 'email']
      });
    }

    // Create user lookup map
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user;
    });

    // Transform data to match frontend expectations
    const transformedAnalyses = analyses.map(analysis => {
      console.log('🔍 Analysis user_id:', analysis.user_id, 'userMap:', userMap);
      
      // Always provide user data - either real user or guest
      const userData = (analysis.user_id && userMap[analysis.user_id]) 
        ? userMap[analysis.user_id] 
        : {
            username: 'Guest User',
            email: 'guest@example.com'
          };
      
      return {
        id: analysis.id,
        result: {
          class: analysis.disease_name || analysis.prediction,
          status: analysis.status
        },
        confidence: analysis.confidence,
        imagePath: analysis.image_path,
        createdAt: analysis.createdAt,
        User: userData
      };
    });

    res.json({
      success: true,
      analyses: transformedAnalyses
    });
  } catch (error) {
    console.error('❌ Error fetching analyses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analyses'
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
app.post('/api/predict', authenticateUser, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Get user ID from authenticated user
    const userId = req.user ? req.user.id : null;

    console.log('🔍 Processing prediction for image:', req.file.filename, 'User ID:', userId);

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
        user_id: userId, // User ID from token
        image_path: req.file.filename,
        prediction: `${prediction.plant} - ${prediction.disease}`,
        confidence: confidencePercentage,
        status: prediction.status,
        plant_type: prediction.plant,
        disease_name: prediction.disease,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });
      console.log('✅ Prediction saved to database with user_id:', userId);
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
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database tables synced successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
});
