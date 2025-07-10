/**
 * Simplified Plant Disease Classification Backend
 * Basic version without ML dependencies for testing
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const session = require('express-session');

// Import configuration
const config = require('../config');

// Create Express application
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.isDevelopment()) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Session configuration
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.isProduction(),
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'plantClassifierSession'
}));

// Request ID middleware
app.use((req, res, next) => {
  req.requestId = require('crypto').randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
    version: '1.0.0-simple',
    message: 'Basic backend running without ML dependencies'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Plant Disease Classification API (Simple Version)',
    version: '1.0.0-simple',
    status: 'Backend is running',
    note: 'This is a simplified version without ML dependencies',
    endpoints: {
      health: '/health',
      documentation: '/api/docs'
    },
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Plant Disease Classification API Documentation (Simple)',
    version: '1.0.0-simple',
    description: 'Simplified backend without ML dependencies',
    status: 'Under development',
    message: 'Full ML functionality will be added once dependencies are resolved',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    timestamp: new Date().toISOString()
  });
});

// Test auth endpoint
app.post('/api/auth/test-login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple test authentication
  if (username === 'admin' && password === 'password') {
    res.json({
      success: true,
      message: 'Test login successful',
      user: { username: 'admin', role: 'admin' },
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: 'Test login failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Test prediction endpoint (mock)
app.post('/api/predict/test', (req, res) => {
  res.json({
    success: true,
    message: 'Mock prediction endpoint',
    data: {
      predictionId: require('crypto').randomUUID(),
      result: {
        disease: 'Tomato healthy',
        confidence: 0.95,
        confidencePercentage: 95.0,
        note: 'This is a mock prediction - actual ML service not yet available'
      },
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error occurred:', error);
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    ...(config.isDevelopment() && { stack: error.stack })
  });
});

// Start server function
async function startServer() {
  try {
    console.log('🚀 Starting Plant Disease Classification Server (Simple Version)...');
    
    const server = app.listen(config.PORT, config.HOST, () => {
      console.log(`🌐 Server running on http://${config.HOST}:${config.PORT}`);
      console.log(`📚 API Documentation: http://${config.HOST}:${config.PORT}/api/docs`);
      console.log(`🔧 Health Check: http://${config.HOST}:${config.PORT}/health`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
      console.log(`⚠️  Note: This is a simplified version without ML dependencies`);
      console.log('✅ Server is ready to accept connections');
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${config.PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
      }
    });

    return server;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer }; 