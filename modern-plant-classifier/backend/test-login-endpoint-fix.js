const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testLoginEndpoint() {
  console.log('🔍 Testing Login Endpoint...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running:', healthResponse.data.status);
    console.log('   Port:', healthResponse.data.services?.frontend);
    console.log('   Environment:', healthResponse.data.environment);
    console.log('');

    // Test 2: Check if auth endpoint exists
    console.log('2. Testing auth endpoint availability...');
    try {
      const authResponse = await axios.get(`${BASE_URL}/api/auth`);
      console.log('✅ Auth endpoint accessible');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Auth endpoint not found - this is the problem!');
        console.log('   Expected: /api/auth/login');
        console.log('   Available endpoints:', error.response.data);
        return;
      }
    }
    console.log('');

    // Test 3: Test login with admin credentials
    console.log('3. Testing login with admin credentials...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      console.log('✅ Login successful!');
      console.log('   User:', loginResponse.data.user);
      console.log('   Token length:', loginResponse.data.token?.length || 0);
      console.log('');

      // Test 4: Test token verification
      console.log('4. Testing token verification...');
      const verifyResponse = await axios.get(`${BASE_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      
      console.log('✅ Token verification successful!');
      console.log('   Verified user:', verifyResponse.data.user);
      console.log('');

    } catch (error) {
      console.log('❌ Login failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data);
      console.log('   Message:', error.message);
      console.log('');

      // Check if it's a database issue
      if (error.response?.status === 500) {
        console.log('🔍 This might be a database connection issue.');
        console.log('   Make sure PostgreSQL is running and database exists.');
        console.log('   Run: setup-database-correct-order.sql');
      }
    }

    // Test 5: Test with user credentials
    console.log('5. Testing login with user credentials...');
    try {
      const userLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'user',
        password: 'user123'
      });
      
      console.log('✅ User login successful!');
      console.log('   User:', userLoginResponse.data.user);
    } catch (error) {
      console.log('❌ User login failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data);
    }

  } catch (error) {
    console.log('❌ Server connection failed:');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
    console.log('');
    console.log('🔍 Troubleshooting:');
    console.log('   1. Make sure backend is running on port 3000');
    console.log('   2. Check if PostgreSQL is running');
    console.log('   3. Verify database connection in .env file');
    console.log('   4. Run: setup-database-correct-order.sql');
  }
}

// Run the test
testLoginEndpoint();
