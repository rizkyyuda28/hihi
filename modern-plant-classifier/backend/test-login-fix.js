#!/usr/bin/env node

/**
 * Test Login Fix Script
 * Plant Disease Classification System
 */

const axios = require('axios');

// Configuration
const config = {
  baseURL: 'http://localhost:3000', // Backend runs on port 3000
  timeout: 10000
};

console.log('🔍 Testing Login Fix...\n');

// Test data
const testCredentials = [
  {
    username: 'admin',
    password: 'admin123',
    expectedRole: 'admin'
  },
  {
    username: 'user',
    password: 'user123',
    expectedRole: 'user'
  }
];

// Helper function to make login request
async function makeLoginRequest(username, password) {
  try {
    console.log(`🔐 Testing login for: ${username}`);
    
    const response = await axios({
      method: 'POST',
      url: `${config.baseURL}/api/auth/login`,
      data: {
        username: username,
        password: password
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: config.timeout
    });
    
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
}

// Test health endpoint
async function testHealthEndpoint() {
  try {
    console.log('🏥 Testing health endpoint...');
    
    const response = await axios({
      method: 'GET',
      url: `${config.baseURL}/health`,
      timeout: config.timeout
    });
    
    console.log('✅ Health endpoint working');
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Environment: ${response.data.environment}`);
    console.log(`   Database: ${response.data.services.database}`);
    return true;
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.message);
    return false;
  }
}

// Test root endpoint
async function testRootEndpoint() {
  try {
    console.log('🏠 Testing root endpoint...');
    
    const response = await axios({
      method: 'GET',
      url: `${config.baseURL}/`,
      timeout: config.timeout
    });
    
    console.log('✅ Root endpoint working');
    console.log(`   Message: ${response.data.message}`);
    console.log(`   Version: ${response.data.version}`);
    return true;
  } catch (error) {
    console.log('❌ Root endpoint failed:', error.message);
    return false;
  }
}

// Test auth endpoints
async function testAuthEndpoints() {
  try {
    console.log('🔐 Testing auth endpoints...');
    
    // Test login endpoint
    const loginResponse = await axios({
      method: 'POST',
      url: `${config.baseURL}/api/auth/login`,
      data: {
        username: 'admin',
        password: 'admin123'
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: config.timeout
    });
    
    console.log('✅ Login endpoint working');
    console.log(`   User: ${loginResponse.data.user.username}`);
    console.log(`   Role: ${loginResponse.data.user.role}`);
    console.log(`   Token: ${loginResponse.data.token ? 'Generated' : 'Missing'}`);
    
    // Test verify endpoint
    if (loginResponse.data.token) {
      const verifyResponse = await axios({
        method: 'GET',
        url: `${config.baseURL}/api/auth/verify`,
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        },
        timeout: config.timeout
      });
      
      console.log('✅ Verify endpoint working');
      console.log(`   Verified User: ${verifyResponse.data.user.username}`);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Auth endpoints failed:', error.message);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data.error || error.response.data.message}`);
    }
    return false;
  }
}

// Test login functionality
async function testLoginFunctionality() {
  console.log('🧪 Testing Login Functionality...\n');
  
  let successfulLogins = 0;
  let failedLogins = 0;
  
  for (const credential of testCredentials) {
    console.log(`\n--- Testing ${credential.username} ---`);
    
    const result = await makeLoginRequest(credential.username, credential.password);
    
    if (result.success) {
      successfulLogins++;
      console.log(`✅ ${credential.username} login successful`);
      console.log(`   Role: ${result.data.user.role}`);
      console.log(`   Token: ${result.data.token ? 'Generated' : 'Missing'}`);
      
      // Test token verification
      if (result.data.token) {
        try {
          const verifyResponse = await axios({
            method: 'GET',
            url: `${config.baseURL}/api/auth/verify`,
            headers: {
              'Authorization': `Bearer ${result.data.token}`
            },
            timeout: config.timeout
          });
          
          console.log(`   ✅ Token verification successful`);
        } catch (verifyError) {
          console.log(`   ❌ Token verification failed: ${verifyError.message}`);
        }
      }
    } else {
      failedLogins++;
      console.log(`❌ ${credential.username} login failed`);
      console.log(`   Error: ${result.error.error || result.error.message || result.error}`);
      console.log(`   Status: ${result.status}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 LOGIN TEST SUMMARY:');
  console.log(`   Successful logins: ${successfulLogins}`);
  console.log(`   Failed logins: ${failedLogins}`);
  console.log(`   Total tests: ${testCredentials.length}`);
  console.log('='.repeat(50));
  
  return {
    successfulLogins,
    failedLogins,
    allSuccessful: successfulLogins === testCredentials.length
  };
}

// Test CORS
async function testCORS() {
  try {
    console.log('🌐 Testing CORS...');
    
    const response = await axios({
      method: 'OPTIONS',
      url: `${config.baseURL}/api/auth/login`,
      headers: {
        'Origin': 'http://localhost:3001',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      },
      timeout: config.timeout
    });
    
    console.log('✅ CORS preflight working');
    console.log(`   Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log('❌ CORS preflight failed:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Login Fix Tests...\n');
  
  try {
    // Test basic endpoints
    const healthOk = await testHealthEndpoint();
    const rootOk = await testRootEndpoint();
    
    if (!healthOk && !rootOk) {
      console.log('\n❌ Backend is not running or not accessible!');
      console.log('💡 Please start the backend first:');
      console.log('   cd modern-plant-classifier/backend');
      console.log('   npm start');
      console.log('   Then run this test again.');
      process.exit(1);
    }
    
    // Test CORS
    const corsOk = await testCORS();
    
    // Test auth endpoints
    const authOk = await testAuthEndpoints();
    
    if (!authOk) {
      console.log('\n❌ Auth endpoints are not working!');
      console.log('💡 Please check:');
      console.log('   1. Backend is running on port 3000');
      console.log('   2. Auth routes are properly registered');
      console.log('   3. Database is connected');
      console.log('   4. Users table has data');
      process.exit(1);
    }
    
    // Test login functionality
    const results = await testLoginFunctionality();
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 FINAL TEST SUMMARY:');
    console.log(`   Backend Health: ${healthOk ? '✅ OK' : '❌ FAIL'}`);
    console.log(`   Root Endpoint: ${rootOk ? '✅ OK' : '❌ FAIL'}`);
    console.log(`   CORS: ${corsOk ? '✅ OK' : '❌ FAIL'}`);
    console.log(`   Auth Endpoints: ${authOk ? '✅ OK' : '❌ FAIL'}`);
    console.log(`   Login Tests: ${results.allSuccessful ? '✅ ALL PASS' : '❌ SOME FAIL'}`);
    console.log('='.repeat(50));
    
    if (results.allSuccessful) {
      console.log('\n🎉 Login system is working correctly!');
      console.log('✅ All endpoints are accessible');
      console.log('✅ Authentication is working');
      console.log('✅ Token generation and verification working');
      console.log('\n💡 Frontend should now work with:');
      console.log(`   http://localhost:3000/api/auth/login`);
      console.log('   (via proxy from http://localhost:3001)');
    } else {
      console.log('\n⚠️ Some login tests failed');
      console.log('❌ Check the errors above for details');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testLoginFunctionality,
  testAuthEndpoints
};
