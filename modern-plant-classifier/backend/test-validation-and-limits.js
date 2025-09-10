#!/usr/bin/env node

/**
 * Test File Validation and Guest Limits Script
 * Plant Disease Classification System
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseURL: 'http://localhost:3000',
  timeout: 10000
};

console.log('🔍 Testing File Validation and Guest Limits...\n');

// Test files (create dummy files for testing)
const testFiles = [
  {
    name: 'corn_healthy.jpg',
    content: 'dummy image content',
    shouldPass: true,
    description: 'Valid corn healthy image'
  },
  {
    name: 'tomato_blight.jpg',
    content: 'dummy image content',
    shouldPass: true,
    description: 'Valid tomato blight image'
  },
  {
    name: 'potato_rust.jpg',
    content: 'dummy image content',
    shouldPass: true,
    description: 'Valid potato rust image'
  },
  {
    name: 'BackdropK3-3.png',
    content: 'dummy image content',
    shouldPass: false,
    description: 'Invalid event banner image (should be rejected)'
  },
  {
    name: 'random_image.jpg',
    content: 'dummy image content',
    shouldPass: false,
    description: 'Invalid random image (should be rejected)'
  },
  {
    name: 'document.pdf',
    content: 'dummy pdf content',
    shouldPass: false,
    description: 'Invalid file type (should be rejected)'
  }
];

// Create test files directory
const testDir = path.join(__dirname, 'test-files');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

// Create test files
testFiles.forEach(file => {
  const filePath = path.join(testDir, file.name);
  fs.writeFileSync(filePath, file.content);
});

// Helper function to make prediction request
async function makePredictionRequest(filename, description) {
  try {
    console.log(`📷 Testing: ${description} (${filename})`);
    
    const filePath = path.join(testDir, filename);
    const formData = new FormData();
    formData.append('image', fs.createReadStream(filePath), {
      filename: filename,
      contentType: 'image/jpeg'
    });
    
    const response = await axios({
      method: 'POST',
      url: `${config.baseURL}/api/predict`,
      data: formData,
      headers: {
        ...formData.getHeaders(),
        'User-Agent': 'Test-Client/1.0'
      },
      timeout: config.timeout
    });
    
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
}

// Test file validation
async function testFileValidation() {
  console.log('🧪 Testing File Validation...\n');
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const file of testFiles) {
    console.log(`\n--- Testing ${file.name} ---`);
    
    const result = await makePredictionRequest(file.name, file.description);
    
    if (file.shouldPass) {
      if (result.success) {
        console.log(`✅ PASS: ${file.name} correctly allowed`);
        passedTests++;
      } else {
        console.log(`❌ FAIL: ${file.name} incorrectly rejected`);
        console.log(`   Error: ${result.error.error || result.error.message || result.error}`);
        console.log(`   Status: ${result.status}`);
        failedTests++;
      }
    } else {
      if (!result.success && result.status === 400) {
        console.log(`✅ PASS: ${file.name} correctly rejected`);
        console.log(`   Reason: ${result.error.error || result.error.message || result.error}`);
        passedTests++;
      } else if (result.success) {
        console.log(`❌ FAIL: ${file.name} incorrectly allowed`);
        console.log(`   This should have been rejected!`);
        failedTests++;
      } else {
        console.log(`⚠️  UNEXPECTED: ${file.name} failed with status ${result.status}`);
        console.log(`   Error: ${result.error.error || result.error.message || result.error}`);
        failedTests++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 FILE VALIDATION TEST SUMMARY:');
  console.log(`   Passed tests: ${passedTests}`);
  console.log(`   Failed tests: ${failedTests}`);
  console.log(`   Total tests: ${testFiles.length}`);
  console.log('='.repeat(50));
  
  return { passedTests, failedTests, allPassed: passedTests === testFiles.length };
}

// Test guest detection limits
async function testGuestLimits() {
  console.log('\n🧪 Testing Guest Detection Limits...\n');
  
  // Use valid files for guest limit testing
  const validFiles = testFiles.filter(f => f.shouldPass);
  let successfulPredictions = 0;
  let failedPredictions = 0;
  
  // Test up to 5 predictions (more than the limit of 2)
  for (let i = 0; i < 5; i++) {
    const testFile = validFiles[i % validFiles.length];
    const testName = `test_${i + 1}_${testFile.name}`;
    
    console.log(`\n--- Guest Test ${i + 1} ---`);
    
    const result = await makePredictionRequest(testName, `Guest test ${i + 1}: ${testFile.description}`);
    
    if (result.success) {
      successfulPredictions++;
      console.log(`✅ Prediction ${i + 1} successful`);
      console.log(`   Plant: ${result.data.prediction?.plant?.name || 'Unknown'}`);
      console.log(`   Confidence: ${result.data.prediction?.confidence || 'Unknown'}`);
    } else {
      failedPredictions++;
      console.log(`❌ Prediction ${i + 1} failed`);
      
      if (result.status === 429) {
        console.log(`   🚫 Guest limit reached!`);
        console.log(`   Message: ${result.error.message || result.error.error}`);
        console.log(`   Remaining: ${result.error.remainingDetections || 0}`);
        console.log(`   Reset time: ${result.error.resetTime || 'Unknown'}`);
        break; // Stop testing after limit reached
      } else if (result.status === 400) {
        console.log(`   📁 File validation failed`);
        console.log(`   Message: ${result.error.message || result.error.error}`);
      } else {
        console.log(`   Error: ${result.error.error || result.error.message || result.error}`);
        console.log(`   Status: ${result.status}`);
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 GUEST LIMITS TEST SUMMARY:');
  console.log(`   Successful predictions: ${successfulPredictions}`);
  console.log(`   Failed predictions: ${failedPredictions}`);
  console.log(`   Expected limit: 2 detections per IP`);
  console.log(`   Limit working: ${successfulPredictions <= 2 ? '✅ YES' : '❌ NO'}`);
  console.log('='.repeat(50));
  
  return {
    successfulPredictions,
    failedPredictions,
    limitWorking: successfulPredictions <= 2
  };
}

// Test allowed keywords endpoint
async function testAllowedKeywords() {
  console.log('\n🧪 Testing Allowed Keywords Endpoint...\n');
  
  try {
    const response = await axios({
      method: 'GET',
      url: `${config.baseURL}/api/predict/allowed-keywords`,
      timeout: config.timeout
    });
    
    if (response.data.success) {
      console.log('✅ Allowed keywords endpoint working');
      console.log(`   Total keywords: ${response.data.data.totalKeywords}`);
      console.log(`   Plant names: ${response.data.data.plantNames.length}`);
      console.log(`   Disease names: ${response.data.data.diseaseNames.length}`);
      console.log(`   Examples: ${response.data.data.examples.join(', ')}`);
      return true;
    } else {
      console.log('❌ Allowed keywords endpoint failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Allowed keywords endpoint error:', error.message);
    return false;
  }
}

// Clean up test files
function cleanupTestFiles() {
  try {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
      console.log('🧹 Test files cleaned up');
    }
  } catch (error) {
    console.log('⚠️  Failed to clean up test files:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting File Validation and Guest Limits Tests...\n');
  
  try {
    // Test file validation
    const validationResults = await testFileValidation();
    
    // Test guest limits
    const limitResults = await testGuestLimits();
    
    // Test allowed keywords endpoint
    const keywordsOk = await testAllowedKeywords();
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 FINAL TEST SUMMARY:');
    console.log(`   File Validation: ${validationResults.allPassed ? '✅ WORKING' : '❌ NOT WORKING'}`);
    console.log(`   Guest Limits: ${limitResults.limitWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
    console.log(`   Keywords Endpoint: ${keywordsOk ? '✅ WORKING' : '❌ NOT WORKING'}`);
    console.log('='.repeat(50));
    
    if (validationResults.allPassed && limitResults.limitWorking && keywordsOk) {
      console.log('\n🎉 All validation and limit systems are working correctly!');
      console.log('✅ File validation blocks invalid files');
      console.log('✅ Guest limits restrict to 2 detections per IP');
      console.log('✅ Keywords endpoint provides guidance');
    } else {
      console.log('\n⚠️ Some systems are not working properly');
      console.log('❌ Check the errors above for details');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up test files
    cleanupTestFiles();
  }
}

// Handle script execution
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testFileValidation,
  testGuestLimits,
  testAllowedKeywords
};
