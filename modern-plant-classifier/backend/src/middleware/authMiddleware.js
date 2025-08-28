const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid access token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    
    // Cek apakah user masih ada dan aktif
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found or inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is not valid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Token has expired, please login again'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error'
    });
  }
};

const authenticateSession = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        error: 'Session required',
        message: 'Please login to continue'
      });
    }

    const user = await User.findByPk(req.session.userId);
    if (!user || !user.isActive) {
      req.session.destroy();
      return res.status(401).json({
        error: 'Invalid session',
        message: 'User not found or inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Session auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
        const user = await User.findByPk(decoded.userId);
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, lanjutkan sebagai guest
      }
    }

    next();
  } catch (error) {
    // Jika ada error, lanjutkan sebagai guest
    next();
  }
};

module.exports = {
  authenticateToken,
  authenticateSession,
  optionalAuth
}; 