const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testAllImages() {
  console.log('🚀 FINAL COMPREHENSIVE TEST');
  console.log('=' .repeat(50));
  
  const tests = [
    { 
      file: '../RS_Rust 2730_flipLR.JPG', 
      expected: 'rust',
      description: 'Rust Disease Test'
    },
    { 
      file: '../0a8a68ee-f587-4dea-beec-79d02e7d3fa4___RS_Early.B 8461.JPG', 
      expected: 'early',
      description: 'Early Blight Test'
    },
    { 
      file: '../kentang.JPG', 
      expected: 'potato',
      description: 'Potato Test'
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`\n🧪 ${test.description}`);
      console.log(`   File: ${test.file}`);
      
      if (!fs.existsSync(test.file)) {
        console.log('   ❌ File not found');
        continue;
      }
      
      const formData = new FormData();
      formData.append('image', fs.createReadStream(test.file));
      
      const response = await axios.post('http://localhost:3001/api/predict', formData, {
        headers: formData.getHeaders(),
        timeout: 10000
      });
      
      const pred = response.data.prediction;
      console.log(`   Plant: ${pred.plant}`);
      console.log(`   Disease: ${pred.disease}`);
      console.log(`   Full Class: ${pred.full_class}`);
      console.log(`   Confidence: ${pred.confidencePercentage}%`);
      
      // Check if prediction matches expected
      const isCorrect = pred.full_class.toLowerCase().includes(test.expected) || 
                       pred.disease.toLowerCase().includes(test.expected);
      
      if (isCorrect) {
        console.log(`   ✅ SUCCESS: Correctly identified as ${test.expected}`);
      } else {
        console.log(`   ❌ FAILED: Expected ${test.expected}, got ${pred.full_class}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎯 Test completed!');
}

testAllImages();
