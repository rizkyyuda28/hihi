const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testEarlyBlight() {
  try {
    console.log('🔍 Testing Early Blight Detection...');
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream('../0a8a68ee-f587-4dea-beec-79d02e7d3fa4___RS_Early.B 8461.JPG'));
    
    console.log('📤 Sending request...');
    const response = await axios.post('http://localhost:3001/api/predict', formData, {
      headers: formData.getHeaders(),
      timeout: 10000
    });
    
    console.log('✅ Response received:');
    console.log('Plant:', response.data.prediction.plant);
    console.log('Disease:', response.data.prediction.disease);
    console.log('Full Class:', response.data.prediction.full_class);
    console.log('Confidence:', response.data.prediction.confidencePercentage + '%');
    
    // Check if it's correctly identified as early blight
    if (response.data.prediction.full_class.toLowerCase().includes('early blight')) {
      console.log('🎉 SUCCESS: Correctly identified as EARLY BLIGHT!');
    } else {
      console.log('❌ FAILED: Not identified as early blight');
      console.log('Expected: Potato Early blight or Tomato Early blight');
      console.log('Got:', response.data.prediction.full_class);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testEarlyBlight();
