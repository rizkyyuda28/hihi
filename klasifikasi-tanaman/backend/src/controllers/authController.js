/**
 * Authentication Controller
 * Handles user authentication, registration, and session management
 */

const { validationResult } = require('express-validator');
const { 
  login, 
  register, 
  getAllUsers 
} = require('../middleware/authMiddleware');
const { 
  asyncHandler, 
  AppError, 
  validationErrorHandler 
} = require('../middleware/errorMiddleware');

/**
 * Login controller
 * POST /api/auth/login
 */
const loginController = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const { username, password, rememberMe = false } = req.body;

  try {
    // Attempt login
    const result = await login(username, password);

    // Set session if remember me is checked
    if (rememberMe) {
      req.session.user = result.user;
      req.session.rememberMe = true;
    }

    // Log successful login
    console.log(`✅ User logged in: ${username} from IP: ${req.ip}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token,
        expiresIn: result.expiresIn
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Log failed login attempt
    console.log(`❌ Failed login attempt: ${username} from IP: ${req.ip} - ${error.message}`);
    
    throw new AppError(
      'Invalid username or password',
      401,
      'INVALID_CREDENTIALS'
    );
  }
});

/**
 * Register controller
 * POST /api/auth/register
 */
const registerController = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  const { username, password, confirmPassword } = req.body;

  try {
    // Attempt registration
    const result = await register({ username, password, confirmPassword });

    // Set session for new user
    req.session.user = result.user;

    // Log successful registration
    console.log(`✅ New user registered: ${username} from IP: ${req.ip}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: result.user,
        token: result.token
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Log failed registration attempt
    console.log(`❌ Failed registration attempt: ${username} from IP: ${req.ip} - ${error.message}`);
    
    // Determine appropriate error response
    let statusCode = 400;
    let code = 'REGISTRATION_FAILED';
    
    if (error.message.includes('already exists')) {
      statusCode = 409;
      code = 'USERNAME_EXISTS';
    }
    
    throw new AppError(error.message, statusCode, code);
  }
});

/**
 * Logout controller
 * POST /api/auth/logout
 */
const logoutController = asyncHandler(async (req, res) => {
  const username = req.user ? req.user.username : 'unknown';

  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Session destruction error:', err);
    }
  });

  // Log successful logout
  console.log(`✅ User logged out: ${username} from IP: ${req.ip}`);

  res.status(200).json({
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString()
  });
});

/**
 * Get current user profile
 * GET /api/auth/profile
 */
const getProfileController = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: req.user
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Refresh token controller
 * POST /api/auth/refresh
 */
const refreshTokenController = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { generateToken } = require('../middleware/authMiddleware');
  const newToken = generateToken(req.user);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      token: newToken,
      expiresIn: '24h'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Check authentication status
 * GET /api/auth/status
 */
const statusController = asyncHandler(async (req, res) => {
  const isAuthenticated = !!(req.user || (req.session && req.session.user));
  
  res.status(200).json({
    success: true,
    data: {
      authenticated: isAuthenticated,
      user: req.user || req.session?.user || null,
      sessionActive: !!(req.session && req.session.user)
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Get all users (admin only)
 * GET /api/auth/users
 */
const getUsersController = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new AppError('Admin access required', 403, 'ADMIN_REQUIRED');
  }

  const users = getAllUsers();

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users,
      count: users.length
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Change password controller
 * POST /api/auth/change-password
 */
const changePasswordController = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationErrorHandler(errors.array());
  }

  if (!req.user) {
    throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
  }

  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  // Validate new password
  if (newPassword !== confirmNewPassword) {
    throw new AppError('New passwords do not match', 400, 'PASSWORD_MISMATCH');
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters long', 400, 'PASSWORD_TOO_SHORT');
  }

  // This is a simplified implementation
  // In a real app, you'd validate current password and update in database
  console.log(`🔐 Password change request for user: ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  loginController,
  registerController,
  logoutController,
  getProfileController,
  refreshTokenController,
  statusController,
  getUsersController,
  changePasswordController
}; 