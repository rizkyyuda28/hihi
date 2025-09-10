const axios = require('axios');

async function testCompleteLoginFlow() {
  try {
    console.log('🧪 Testing complete login flow...');
    
    // Test 1: Login
    console.log('\n1️⃣ Testing login...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login response:', {
      status: loginResponse.status,
      success: loginResponse.data.success,
      hasToken: !!loginResponse.data.token,
      hasUser: !!loginResponse.data.user
    });
    
    if (!loginResponse.data.token) {
      console.log('❌ No token in response!');
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('🔑 Token received:', token);
    
    // Test 2: Verify token
    console.log('\n2️⃣ Testing token verification...');
    const verifyResponse = await axios.get('http://localhost:3000/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Verify response:', {
      status: verifyResponse.status,
      success: verifyResponse.data.success,
      hasUser: !!verifyResponse.data.user
    });
    
    // Test 3: Simulate frontend behavior
    console.log('\n3️⃣ Simulating frontend behavior...');
    
    // This is how frontend should handle the response
    const responseData = loginResponse.data;
    
    if (responseData.token) {
      console.log('✅ Frontend would save token to localStorage');
      console.log('✅ Frontend would set user:', responseData.user);
      console.log('✅ Frontend would redirect to /dashboard');
      console.log('🎉 LOGIN FLOW COMPLETE!');
    } else {
      console.log('❌ Frontend would show error: No token received');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCompleteLoginFlow();

