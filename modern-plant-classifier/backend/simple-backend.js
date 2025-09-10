const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login request:', req.body);
  
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    console.log('✅ Login successful');
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
    console.log('❌ Login failed');
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', (req, res) => {
  console.log('🔍 Token verification requested');
  res.json({
    success: true,
    user: {
      id: 1,
      username: 'admin',
      email: 'admin@plantdisease.com',
      role: 'admin'
    }
  });
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', (req, res) => {
  console.log('📊 Dashboard stats requested');
  res.json({
    success: true,
    data: {
      totalPredictions: 8,
      todayPredictions: 1,
      avgConfidence: 87.1,
      healthyPlants: 4,
      diseasedPlants: 4
    }
  });
});

// Recent predictions endpoint
app.get('/api/dashboard/recent-predictions', (req, res) => {
  console.log('📋 Recent predictions requested');
  res.json({
    success: true,
    data: [
      {
        id: 1,
        prediction: 'Corn - Healthy',
        confidence: 92.5,
        status: 'healthy',
        timestamp: '2 minutes ago'
      }
    ]
  });
});

// Prediction endpoint
app.post('/api/predict', (req, res) => {
  console.log('🧠 Prediction request received');
  res.json({
    success: true,
    prediction: {
      plant: {
        name: 'Corn',
        severity: 'Low',
        description: 'Healthy corn plant',
        symptoms: 'No symptoms',
        treatment: 'Continue care',
        prevention: 'Maintain watering',
        scientificName: 'Zea mays'
      },
      disease: 'Healthy',
      confidence: 0.95,
      recommendations: 'Plant is healthy',
      processingTime: 1.2
    },
    image: 'test-image.jpg'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Backend running on port ${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`🧠 Prediction: http://localhost:${PORT}/api/predict`);
  console.log(`\n🎯 Ready to test!`);
});
