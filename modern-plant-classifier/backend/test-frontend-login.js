const axios = require('axios');

async function testFrontendLogin() {
  try {
    console.log('🧪 Testing frontend-style login request...');
    
    // Simulate the double nesting that frontend might send
    const credentials = {
      username: {
        username: 'admin',
        password: 'admin123'
      }
    };
    
    console.log('📤 Sending request with double nesting:', JSON.stringify(credentials, null, 2));
    
    const response = await axios.post('http://localhost:3000/api/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFrontendLogin();
