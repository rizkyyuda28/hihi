/**
 * Authentication Middleware
 * Handles user authentication with sessions and JWT
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../../config');

/**
 * Simple in-memory user store (replace with database in production)
 */
const users = new Map();

// Default admin user
const defaultAdmin = {
  id: 'admin',
  username: 'admin',
  password: bcrypt.hashSync('password', config.BCRYPT_ROUNDS),
  role: 'admin',
  createdAt: new Date().toISOString()
};
users.set('admin', defaultAdmin);

/**
 * Validate user credentials
 * @param {string} username 
 * @param {string} password 
 * @returns {Object|null} User object or null
 */
const validateUser = async (username, password) => {
  const user = users.get(username);
  
  if (!user) {
    return null;
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return null;
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Create a new user
 * @param {Object} userData 
 * @returns {Object} Created user
 */
const createUser = async (userData) => {
  const { username, password, role = 'user' } = userData;
  
  // Check if user already exists
  if (users.has(username)) {
    throw new Error('Username already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
  
  const newUser = {
    id: username, // Simple ID system
    username,
    password: hashedPassword,
    role,
    createdAt: new Date().toISOString()
  };
  
  users.set(username, newUser);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Generate JWT token
 * @param {Object} user 
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };
  
  return jwt.sign(payload, config.JWT_SECRET, { 
    expiresIn: '24h',
    issuer: 'plant-disease-classifier'
  });
};

/**
 * Verify JWT token
 * @param {string} token 
 * @returns {Object|null} Decoded user or null
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Session-based authentication middleware
 */
const requireSession = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  
  return res.status(401).json({
    success: false,
    error: 'Authentication required',
    message: 'Please log in to access this resource',
    code: 'AUTH_REQUIRED'
  });
};

/**
 * JWT-based authentication middleware
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please provide a valid authentication token',
      code: 'AUTH_REQUIRED'
    });
  }
  
  const token = authHeader.slice(7); // Remove 'Bearer ' prefix
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'The provided authentication token is invalid or expired',
      code: 'INVALID_TOKEN'
    });
  }
  
  req.user = decoded;
  next();
};

/**
 * Optional authentication middleware (doesn't require auth but sets user if present)
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    
    if (decoded) {
      req.user = decoded;
    }
  }
  
  // Check session as fallback
  if (!req.user && req.session && req.session.user) {
    req.user = req.session.user;
  }
  
  next();
};

/**
 * Role-based authorization middleware
 * @param {string|string[]} roles - Required role(s)
 */
const requireRole = (roles) => {
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access this resource',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `This resource requires one of the following roles: ${requiredRoles.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  };
};

/**
 * Login function
 * @param {string} username 
 * @param {string} password 
 * @returns {Object} Login result
 */
const login = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }
  
  const user = await validateUser(username, password);
  
  if (!user) {
    throw new Error('Invalid username or password');
  }
  
  const token = generateToken(user);
  
  return {
    success: true,
    user,
    token,
    expiresIn: '24h'
  };
};

/**
 * Register function
 * @param {Object} userData 
 * @returns {Object} Registration result
 */
const register = async (userData) => {
  const { username, password, confirmPassword } = userData;
  
  // Validation
  if (!username || !password) {
    throw new Error('Username and password are required');
  }
  
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  
  if (username.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }
  
  const user = await createUser({ username, password });
  const token = generateToken(user);
  
  return {
    success: true,
    user,
    token,
    message: 'User registered successfully'
  };
};

/**
 * Get all users (admin only)
 */
const getAllUsers = () => {
  return Array.from(users.values()).map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

module.exports = {
  validateUser,
  createUser,
  generateToken,
  verifyToken,
  requireSession,
  requireAuth,
  optionalAuth,
  requireRole,
  login,
  register,
  getAllUsers
}; 