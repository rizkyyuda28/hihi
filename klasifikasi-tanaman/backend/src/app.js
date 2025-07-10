/**
 * Main Application File
 * Plant Disease Classification Backend with Node.js + TensorFlow.js
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const session = require('express-session');
const path = require('path');

// Import configuration
const config = require('../config');

// Import services
const mlService = require('./services/mlService');

// Import middleware
const { 
  notFoundHandler, 
  globalErrorHandler, 
  gracefulShutdown 
} = require('./middleware/errorMiddleware');
const { generalLimiter } = require('./middleware/rateLimitMiddleware');
const { uploadErrorHandler } = require('./middleware/uploadMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

/**
 * Create Express application
 */
const app = express();

/**
 * Trust proxy (important for rate limiting and IP detection)
 */
app.set('trust proxy', 1);

/**
 * Security middleware
 */
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

/**
 * CORS configuration
 */
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
}));

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Compression middleware
 */
app.use(compression());

/**
 * Logging middleware
 */
if (config.isDevelopment()) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/**
 * Session configuration
 */
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.isProduction(), // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'plantClassifierSession'
}));

/**
 * General rate limiting
 */
app.use(generalLimiter);

/**
 * Request ID middleware for tracking
 */
app.use((req, res, next) => {
  req.requestId = require('crypto').randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

/**
 * Health check endpoint (before routes)
 */
app.get('/health', async (req, res) => {
  try {
    const mlHealth = await mlService.healthCheck();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        ml: mlHealth
      }
    };

    const statusCode = mlHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/predict', predictionRoutes);

/**
 * Root endpoint with API information
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Plant Disease Classification API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
    endpoints: {
      authentication: '/api/auth',
      prediction: '/api/predict'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * API documentation endpoint
 */
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Plant Disease Classification API Documentation',
    version: '1.0.0',
    description: 'AI-powered plant disease classification using TensorFlow.js',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      authentication: {
        'POST /auth/login': 'Login user',
        'POST /auth/register': 'Register new user',
        'POST /auth/logout': 'Logout user',
        'GET /auth/profile': 'Get user profile',
        'GET /auth/status': 'Check auth status'
      },
      prediction: {
        'POST /predict': 'Predict plant disease from image',
        'GET /predict/history': 'Get prediction history',
        'GET /predict/:id': 'Get specific prediction',
        'GET /predict/model/info': 'Get model information',
        'GET /predict/service/health': 'ML service health check'
      }
    },
    supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFileSize: '10MB',
    rateLimit: {
      general: '100 requests per 15 minutes',
      prediction: '10 requests per minute',
      upload: '5 uploads per minute',
      auth: '5 attempts per 15 minutes'
    }
  });
});

/**
 * Upload error handling middleware
 */
app.use(uploadErrorHandler);

/**
 * 404 handler
 */
app.use(notFoundHandler);

/**
 * Global error handler
 */
app.use(globalErrorHandler);

/**
 * Initialize ML service and start server
 */
async function startServer() {
  try {
    console.log('🚀 Initializing Plant Disease Classification Server...');
    
    // Initialize ML service
    console.log('🤖 Loading machine learning model...');
    await mlService.initialize();
    console.log('✅ ML service initialized successfully');
    
    // Start HTTP server
    const server = app.listen(config.PORT, config.HOST, () => {
      console.log(`🌐 Server running on http://${config.HOST}:${config.PORT}`);
      console.log(`📚 API Documentation: http://${config.HOST}:${config.PORT}/api/docs`);
      console.log(`🔧 Health Check: http://${config.HOST}:${config.PORT}/health`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
      console.log('✅ Server is ready to accept connections');
    });

    // Set up graceful shutdown
    gracefulShutdown(server);
    
    // Handle server errors
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

/**
 * Start server if this file is run directly
 */
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer }; 