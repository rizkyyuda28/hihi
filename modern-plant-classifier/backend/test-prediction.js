const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testPrediction() {
  try {
    console.log('🧪 Testing Plant Disease Prediction...');
    
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test ML status
    console.log('\n2. Testing ML status...');
    try {
      const mlStatusResponse = await axios.get('http://localhost:3001/api/ml/status');
      console.log('✅ ML Status:', mlStatusResponse.data);
    } catch (error) {
      console.log('⚠️ ML Status error:', error.message);
    }
    
    // Test prediction with potato image
    console.log('\n3. Testing prediction...');
    const imagePath = path.join(__dirname, '..', '..', 'potato.JPG');
    
    if (!fs.existsSync(imagePath)) {
      console.log('❌ Image file not found:', imagePath);
      return;
    }
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    
    const predictionResponse = await axios.post('http://localhost:3001/api/predict', formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('✅ Prediction result:');
    console.log(JSON.stringify(predictionResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testPrediction();
