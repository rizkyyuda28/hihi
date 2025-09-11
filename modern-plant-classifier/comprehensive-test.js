const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testPrediction(imagePath, expectedDisease) {
  try {
    console.log(`\n🧪 Testing: ${imagePath}`);
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    
    const response = await axios.post('http://localhost:3001/api/predict', formData, {
      headers: formData.getHeaders(),
      timeout: 10000
    });
    
    const pred = response.data.prediction;
    console.log(`   Plant: ${pred.plant}`);
    console.log(`   Disease: ${pred.disease}`);
    console.log(`   Full Class: ${pred.full_class}`);
    console.log(`   Confidence: ${pred.confidencePercentage}%`);
    console.log(`   Severity: ${pred.severityLevel}`);
    
    // Check if disease is correctly identified
    const isCorrect = pred.full_class.toLowerCase().includes(expectedDisease.toLowerCase()) || 
                     pred.disease.toLowerCase().includes(expectedDisease.toLowerCase());
    
    if (isCorrect) {
      console.log(`   ✅ SUCCESS: Correctly identified as ${expectedDisease}`);
    } else {
      console.log(`   ❌ FAILED: Expected ${expectedDisease}, got ${pred.full_class}`);
    }
    
    return isCorrect;
    
  } catch (error) {
    console.error(`   ❌ Error testing ${imagePath}:`, error.message);
    return false;
  }
}

async function runComprehensiveTest() {
  console.log('🚀 COMPREHENSIVE PLANT DISEASE DETECTION TEST');
  console.log('=' .repeat(60));
  
  const tests = [
    { file: '../RS_Rust 2730_flipLR.JPG', expected: 'rust' },
    { file: '../0a8a68ee-f587-4dea-beec-79d02e7d3fa4___RS_Early.B 8461.JPG', expected: 'blight' },
    { file: '../kentang.JPG', expected: 'potato' },
    { file: '../potato.JPG', expected: 'potato' },
    { file: '../ppj.JPG', expected: 'tomato' }
  ];
  
  let passed = 0;
  let total = 0;
  
  for (const test of tests) {
    if (fs.existsSync(test.file)) {
      const success = await testPrediction(test.file, test.expected);
      if (success) passed++;
      total++;
    } else {
      console.log(`\n⚠️  File not found: ${test.file}`);
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`📊 TEST RESULTS: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! System is working perfectly!');
  } else {
    console.log('⚠️  Some tests failed. Check the results above.');
  }
}

runComprehensiveTest();
