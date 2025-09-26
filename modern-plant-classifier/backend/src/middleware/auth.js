const User = require('../models/User');

// Mock authentication middleware
// In a real application, this would verify JWT tokens
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.substring(7);
    
    // Mock implementation - in real app, decode JWT to get user ID
    if (token.startsWith('jwt_token_')) {
      // Extract user ID from token (mock implementation)
      // Format: jwt_token_userId_username (but we only use userId for security)
      const tokenParts = token.split('_');
      if (tokenParts.length >= 3) {
        const userId = parseInt(tokenParts[2]);
        
        console.log('🔍 Debug token parsing:', { userId, tokenParts });
        
        // Verify user exists and is active (only check userId for better security)
        console.log('🔍 Debug querying user with ID:', userId);
        const user = await User.findOne({
          where: { 
            id: userId, 
            isActive: true 
          }
        });
        
        console.log('🔍 Debug user query result:', user ? user.dataValues : 'null');
        console.log('🔍 Debug user isActive field:', user ? user.isActive : 'N/A');
        
        if (user) {
          req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          };
        } else {
          req.user = null;
        }
      } else {
        // Fallback to most recent user for backward compatibility
        const recentUser = await User.findOne({
          order: [['createdAt', 'DESC']],
          where: { isActive: true }
        });
        
        if (recentUser) {
          req.user = {
            id: recentUser.id,
            username: recentUser.username,
            email: recentUser.email,
            role: recentUser.role
          };
        } else {
          req.user = null;
        }
      }
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    req.user = null;
    next();
  }
};

// Middleware to require authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  next();
};

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  
  next();
};

module.exports = {
  authenticateUser,
  requireAuth,
  requireAdmin
};
