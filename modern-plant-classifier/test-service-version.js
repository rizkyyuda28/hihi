const axios = require('axios');

async function testServiceVersion() {
  try {
    console.log('🔍 Testing ML Service Version...');
    
    const response = await axios.get('http://localhost:3001/api/ml/status');
    
    console.log('✅ ML Service Status:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testServiceVersion();
