const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function debugTest() {
  try {
    console.log('🔍 Debug Test - Testing rust detection...');
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream('../RS_Rust 2730_flipLR.JPG'));
    
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
    
    // Check if it's correctly identified as rust
    if (response.data.prediction.full_class.toLowerCase().includes('rust')) {
      console.log('🎉 SUCCESS: Correctly identified as RUST disease!');
    } else {
      console.log('❌ FAILED: Not identified as rust disease');
      console.log('Expected: Corn Common rust');
      console.log('Got:', response.data.prediction.full_class);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

debugTest();
