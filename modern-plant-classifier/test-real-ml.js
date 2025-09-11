const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testRealML() {
  try {
    console.log('🧪 Testing Real ML Service...');
    
    // Test with kentang.JPG
    const imagePath = 'kentang.JPG';
    
    if (!fs.existsSync(imagePath)) {
      console.log('❌ Image file not found:', imagePath);
      return;
    }
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    
    console.log('📤 Sending prediction request...');
    const response = await axios.post('http://localhost:3001/api/predict', formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('✅ Prediction Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      const pred = response.data.prediction;
      console.log('\n🎯 Prediction Summary:');
      console.log(`   Plant: ${pred.plant}`);
      console.log(`   Disease: ${pred.disease}`);
      console.log(`   Confidence: ${pred.confidencePercentage}%`);
      console.log(`   Status: ${pred.status}`);
      console.log(`   Severity: ${pred.severityLevel}`);
      console.log(`   Full Class: ${pred.full_class}`);
      
      if (pred.recommendations && pred.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        pred.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec}`);
        });
      }
      
      if (response.data.top_predictions) {
        console.log('\n📊 Top Predictions:');
        response.data.top_predictions.forEach((pred, index) => {
          console.log(`   ${index + 1}. ${pred.class} (${Math.round(pred.confidence * 100)}%)`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testRealML();
