const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function debugEarlyDetection() {
  try {
    console.log('🔍 Debug Early Detection...');
    
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
    
    // Check what was detected
    const filename = '0a8a68ee-f587-4dea-beec-79d02e7d3fa4___rs_early.b 8461.jpg';
    console.log('\n🔍 Filename analysis:');
    console.log('Contains "early":', filename.includes('early'));
    console.log('Contains "late":', filename.includes('late'));
    console.log('Contains "blight":', filename.includes('blight'));
    
    if (response.data.prediction.full_class.toLowerCase().includes('early')) {
      console.log('🎉 SUCCESS: Correctly identified as EARLY blight!');
    } else {
      console.log('❌ FAILED: Not identified as early blight');
      console.log('Expected: Potato Early blight or Tomato Early blight');
      console.log('Got:', response.data.prediction.full_class);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugEarlyDetection();
