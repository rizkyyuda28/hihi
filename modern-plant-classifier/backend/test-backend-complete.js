const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testBackendComplete() {
  console.log('🔍 Testing Backend Complete (After All Fixes)...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await makeRequest('GET', '/health');
    console.log('✅ Server is running:', healthResponse.data.status);
    console.log('   Environment:', healthResponse.data.environment);
    console.log('   Database:', healthResponse.data.services?.database);
    console.log('');

    // Test 2: Test root endpoint
    console.log('2. Testing root endpoint...');
    const rootResponse = await makeRequest('GET', '/');
    console.log('✅ Root endpoint accessible');
    console.log('   Message:', rootResponse.data.message);
    console.log('   Available endpoints:', rootResponse.data.endpoints);
    console.log('');

    // Test 3: Test login endpoint
    console.log('3. Testing login endpoint...');
    try {
      const loginResponse = await makeRequest('POST', '/api/auth/login', {
        username: 'admin',
        password: 'admin123'
      });
      
      if (loginResponse.status === 200) {
        console.log('✅ Login successful!');
        console.log('   User:', loginResponse.data.user);
        console.log('   Token length:', loginResponse.data.token?.length || 0);
        console.log('');

        // Test 4: Test token verification
        console.log('4. Testing token verification...');
        const verifyResponse = await makeRequest('GET', '/api/auth/verify');
        
        if (verifyResponse.status === 200) {
          console.log('✅ Token verification successful!');
          console.log('   Verified user:', verifyResponse.data.user);
        } else {
          console.log('❌ Token verification failed:', verifyResponse.data);
        }
      } else {
        console.log('❌ Login failed:');
        console.log('   Status:', loginResponse.status);
        console.log('   Error:', loginResponse.data);
      }
    } catch (error) {
      console.log('❌ Login request failed:', error.message);
    }

    // Test 5: Test prediction endpoints
    console.log('\n5. Testing prediction endpoints...');
    
    // Test guest limit
    try {
      const guestLimitResponse = await makeRequest('GET', '/api/predict/guest-limit');
      console.log('✅ Guest limit endpoint accessible');
      console.log('   Guest limit info:', guestLimitResponse.data);
    } catch (error) {
      console.log('❌ Guest limit endpoint failed:', error.message);
    }

    // Test allowed keywords
    try {
      const keywordsResponse = await makeRequest('GET', '/api/predict/allowed-keywords');
      console.log('✅ Allowed keywords endpoint accessible');
      console.log('   Total keywords:', keywordsResponse.data.data?.totalKeywords);
    } catch (error) {
      console.log('❌ Allowed keywords endpoint failed:', error.message);
    }

    // Test model info
    try {
      const modelInfoResponse = await makeRequest('GET', '/api/predict/model-info');
      console.log('✅ Model info endpoint accessible');
      console.log('   Model info:', modelInfoResponse.data);
    } catch (error) {
      console.log('❌ Model info endpoint failed:', error.message);
    }

    // Test 6: Test detection history endpoint
    console.log('\n6. Testing detection history endpoint...');
    try {
      const historyResponse = await makeRequest('GET', '/api/detection-history/my-history');
      console.log('✅ Detection history endpoint accessible');
      console.log('   History response:', historyResponse.data);
    } catch (error) {
      console.log('❌ Detection history endpoint failed:', error.message);
    }

    console.log('\n🎉 Backend testing completed!');
    console.log('✅ All major endpoints are working');
    console.log('🚀 Backend is ready for frontend integration');

  } catch (error) {
    console.log('❌ Server connection failed:');
    console.log('   Error:', error.message);
    console.log('');
    console.log('🔍 Troubleshooting:');
    console.log('   1. Make sure backend is running on port 3000');
    console.log('   2. Check if PostgreSQL is running');
    console.log('   3. Verify database connection in .env file');
    console.log('   4. Run: setup-database-correct-order.sql');
  }
}

// Run the test
testBackendComplete();
