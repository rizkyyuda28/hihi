const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testRustPrediction() {
  try {
    console.log('🧪 Testing Rust Disease Prediction...');
    
    // Test with RS_Rust 2730_flipLR.JPG
    const imagePath = '../RS_Rust 2730_flipLR.JPG';
    
    if (!fs.existsSync(imagePath)) {
      console.log('❌ Image file not found:', imagePath);
      return;
    }
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    
    console.log('📤 Sending prediction request for:', imagePath);
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
      
      // Check if it's a rust disease
      if (pred.disease.toLowerCase().includes('rust')) {
        console.log('\n🎉 SUCCESS: Correctly identified as RUST disease!');
      } else {
        console.log('\n⚠️  WARNING: Not identified as rust disease');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testRustPrediction();
