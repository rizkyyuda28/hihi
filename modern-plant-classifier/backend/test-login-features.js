#!/usr/bin/env node

/**
 * Test Script for Login Features & Guest Detection Limits
 * Plant Disease Classification System
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseURL: 'http://localhost:3000',
  testImagePath: path.join(__dirname, '../test-images/sample-plant.jpg'),
  adminCredentials: {
    username: 'admin',
    password: 'admin123'
  },
  userCredentials: {
    username: 'user1',
    password: 'user123'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logWarning = (message) => log(`⚠️ ${message}`, 'yellow');
const logInfo = (message) => log(`ℹ️ ${message}`, 'blue');
const logHeader = (message) => log(`\n${colors.bright}${message}${colors.reset}`, 'cyan');

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

const assert = (condition, testName) => {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    logSuccess(`${testName} - PASSED`);
    return true;
  } else {
    testResults.failed++;
    logError(`${testName} - FAILED`);
    return false;
  }
};

// Test functions
const testHealthCheck = async () => {
  logHeader('Testing Health Check');
  
  try {
    const response = await axios.get(`${config.baseURL}/health`);
    return assert(response.status === 200, 'Health check endpoint');
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
};

const testGuestDetectionLimit = async () => {
  logHeader('Testing Guest Detection Limit');
  
  try {
    // Check initial limit
    const limitResponse = await axios.get(`${config.baseURL}/api/predict/guest-limit`);
    const initialLimit = limitResponse.data.data;
    
    logInfo(`Initial limit: ${initialLimit.remainingDetections}/${initialLimit.totalLimit}`);
    
    // Test first detection (should work)
    const formData1 = new FormData();
    formData1.append('image', fs.createReadStream(config.testImagePath));
    
    const detection1 = await axios.post(`${config.baseURL}/api/predict/predict`, formData1, {
      headers: formData1.getHeaders()
    });
    
    assert(detection1.status === 200, 'First guest detection');
    
    // Check limit after first detection
    const limitAfter1 = await axios.get(`${config.baseURL}/api/predict/guest-limit`);
    logInfo(`Limit after 1st detection: ${limitAfter1.data.data.remainingDetections}/${limitAfter1.data.data.totalLimit}`);
    
    // Test second detection (should work)
    const formData2 = new FormData();
    formData2.append('image', fs.createReadStream(config.testImagePath));
    
    const detection2 = await axios.post(`${config.baseURL}/api/predict/predict`, formData2, {
      headers: formData2.getHeaders()
    });
    
    assert(detection2.status === 200, 'Second guest detection');
    
    // Check limit after second detection
    const limitAfter2 = await axios.get(`${config.baseURL}/api/predict/guest-limit`);
    logInfo(`Limit after 2nd detection: ${limitAfter2.data.data.remainingDetections}/${limitAfter2.data.data.totalLimit}`);
    
    // Test third detection (should fail)
    const formData3 = new FormData();
    formData3.append('image', fs.createReadStream(config.testImagePath));
    
    try {
      await axios.post(`${config.baseURL}/api/predict/predict`, formData3, {
        headers: formData3.getHeaders()
      });
      return assert(false, 'Third guest detection should fail');
    } catch (error) {
      return assert(error.response.status === 429, 'Third guest detection blocked');
    }
    
  } catch (error) {
    logError(`Guest detection limit test failed: ${error.message}`);
    return false;
  }
};

const testUserAuthentication = async () => {
  logHeader('Testing User Authentication');
  
  try {
    // Test user registration
    const registerResponse = await axios.post(`${config.baseURL}/api/auth/register`, {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass123'
    });
    
    assert(registerResponse.status === 201, 'User registration');
    
    // Test user login
    const loginResponse = await axios.post(`${config.baseURL}/api/auth/login`, {
      username: 'testuser',
      password: 'testpass123'
    });
    
    assert(loginResponse.status === 200, 'User login');
    assert(loginResponse.data.token, 'JWT token received');
    
    const token = loginResponse.data.token;
    
    // Test authenticated detection (should work without limits)
    const formData = new FormData();
    formData.append('image', fs.createReadStream(config.testImagePath));
    
    const authDetection = await axios.post(`${config.baseURL}/api/predict/predict`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    assert(authDetection.status === 200, 'Authenticated detection');
    
    // Test detection history access
    const historyResponse = await axios.get(`${config.baseURL}/api/detection-history/my-history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    assert(historyResponse.status === 200, 'Detection history access');
    assert(historyResponse.data.data.detections.length > 0, 'Detection history has data');
    
    return true;
    
  } catch (error) {
    logError(`User authentication test failed: ${error.message}`);
    return false;
  }
};

const testAdminAccess = async () => {
  logHeader('Testing Admin Access');
  
  try {
    // Test admin login
    const loginResponse = await axios.post(`${config.baseURL}/api/auth/login`, config.adminCredentials);
    
    assert(loginResponse.status === 200, 'Admin login');
    assert(loginResponse.data.token, 'Admin JWT token received');
    
    const token = loginResponse.data.token;
    
    // Test admin endpoints
    const adminResponse = await axios.get(`${config.baseURL}/api/admin/plants`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    assert(adminResponse.status === 200, 'Admin plants access');
    
    return true;
    
  } catch (error) {
    logError(`Admin access test failed: ${error.message}`);
    return false;
  }
};

const testDetectionHistory = async () => {
  logHeader('Testing Detection History');
  
  try {
    // Login as regular user
    const loginResponse = await axios.post(`${config.baseURL}/api/auth/login`, config.userCredentials);
    const token = loginResponse.data.token;
    
    // Get detection history
    const historyResponse = await axios.get(`${config.baseURL}/api/detection-history/my-history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    assert(historyResponse.status === 200, 'Get detection history');
    
    // Test search functionality
    const searchResponse = await axios.get(`${config.baseURL}/api/detection-history/search?query=corn`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    assert(searchResponse.status === 200, 'Search detection history');
    
    // Test statistics
    const statsResponse = await axios.get(`${config.baseURL}/api/detection-history/stats/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    assert(statsResponse.status === 200, 'Get detection statistics');
    
    return true;
    
  } catch (error) {
    logError(`Detection history test failed: ${error.message}`);
    return false;
  }
};

const testErrorHandling = async () => {
  logHeader('Testing Error Handling');
  
  try {
    // Test invalid token
    try {
      await axios.get(`${config.baseURL}/api/detection-history/my-history`, {
        headers: {
          'Authorization': 'Bearer invalid_token'
        }
      });
      return assert(false, 'Invalid token should be rejected');
    } catch (error) {
      assert(error.response.status === 401, 'Invalid token rejected');
    }
    
    // Test expired token (if we had one)
    // This would require a token that's actually expired
    
    // Test unauthorized access
    try {
      await axios.get(`${config.baseURL}/api/detection-history/my-history`);
      return assert(false, 'Unauthorized access should be rejected');
    } catch (error) {
      assert(error.response.status === 401, 'Unauthorized access rejected');
    }
    
    return true;
    
  } catch (error) {
    logError(`Error handling test failed: ${error.message}`);
    return false;
  }
};

// Main test runner
const runTests = async () => {
  logHeader('🚀 Starting Login Features & Guest Detection Limits Tests');
  logInfo(`Base URL: ${config.baseURL}`);
  logInfo(`Test Image: ${config.testImagePath}`);
  
  const tests = [
    testHealthCheck,
    testGuestDetectionLimit,
    testUserAuthentication,
    testAdminAccess,
    testDetectionHistory,
    testErrorHandling
  ];
  
  for (const test of tests) {
    try {
      await test();
    } catch (error) {
      logError(`Test execution error: ${error.message}`);
      testResults.failed++;
      testResults.total++;
    }
  }
  
  // Print results
  logHeader('📊 Test Results Summary');
  logInfo(`Total Tests: ${testResults.total}`);
  logSuccess(`Passed: ${testResults.passed}`);
  logError(`Failed: ${testResults.failed}`);
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  if (testResults.failed === 0) {
    logSuccess(`Success Rate: ${successRate}% - All tests passed! 🎉`);
  } else {
    logWarning(`Success Rate: ${successRate}% - Some tests failed`);
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed === 0 ? 0 : 1);
};

// Handle script execution
if (require.main === module) {
  // Check if test image exists
  if (!fs.existsSync(config.testImagePath)) {
    logWarning(`Test image not found: ${config.testImagePath}`);
    logInfo('Please place a test image in the test-images folder or update the path in config');
    logInfo('You can use any JPG/PNG image for testing');
  }
  
  // Check if server is running
  axios.get(`${config.baseURL}/health`)
    .then(() => {
      logSuccess('Server is running, starting tests...');
      runTests();
    })
    .catch(() => {
      logError(`Server is not running at ${config.baseURL}`);
      logInfo('Please start the backend server first: npm start');
      process.exit(1);
    });
}

module.exports = {
  runTests,
  testResults,
  config
};
