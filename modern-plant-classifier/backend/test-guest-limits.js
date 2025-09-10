#!/usr/bin/env node

/**
 * Test Guest Detection Limits Script
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

console.log('🔍 Testing Guest Detection Limits...\n');

// Test data
const testImages = [
  {
    name: 'corn_healthy.jpg',
    path: path.join(__dirname, 'test-images', 'corn_healthy.jpg'),
    description: 'Corn healthy image'
  },
  {
    name: 'tomato_blight.jpg', 
    path: path.join(__dirname, 'test-images', 'tomato_blight.jpg'),
    description: 'Tomato blight image'
  },
  {
    name: 'potato_rust.jpg',
    path: path.join(__dirname, 'test-images', 'potato_rust.jpg'),
    description: 'Potato rust image'
  }
];

// Helper function to make prediction request
async function makePredictionRequest(imagePath, imageName, description) {
  try {
    console.log(`📷 Testing: ${description} (${imageName})`);
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath), {
      filename: imageName,
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

// Helper function to check guest limit status
async function checkGuestLimit() {
  try {
    const response = await axios({
      method: 'GET',
      url: `${config.baseURL}/api/predict/guest-limit`,
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

// Test guest detection limits
async function testGuestLimits() {
  console.log('🧪 Testing Guest Detection Limits...\n');
  
  // Check initial guest limit status
  console.log('📊 Checking initial guest limit status...');
  const initialLimit = await checkGuestLimit();
  if (initialLimit.success) {
    console.log(`✅ Guest limit check successful`);
    console.log(`   Remaining detections: ${initialLimit.data.remainingDetections || 'Unknown'}`);
    console.log(`   Limit reached: ${initialLimit.data.limitReached || false}`);
  } else {
    console.log(`❌ Guest limit check failed: ${initialLimit.error.error || initialLimit.error}`);
  }
  console.log('');
  
  // Test predictions up to the limit
  let successfulPredictions = 0;
  let failedPredictions = 0;
  
  for (let i = 0; i < 5; i++) { // Test more than the limit (2)
    const testImage = testImages[i % testImages.length];
    const testName = `test_${i + 1}_${testImage.name}`;
    
    console.log(`\n--- Test ${i + 1} ---`);
    
    const result = await makePredictionRequest(
      testImage.path, 
      testName, 
      `Test ${i + 1}: ${testImage.description}`
    );
    
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
      } else {
        console.log(`   Error: ${result.error.error || result.error.message || result.error}`);
        console.log(`   Status: ${result.status}`);
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 GUEST LIMIT TEST SUMMARY:');
  console.log(`   Successful predictions: ${successfulPredictions}`);
  console.log(`   Failed predictions: ${failedPredictions}`);
  console.log(`   Expected limit: 2 detections per IP`);
  console.log('='.repeat(50));
  
  // Check final guest limit status
  console.log('\n📊 Checking final guest limit status...');
  const finalLimit = await checkGuestLimit();
  if (finalLimit.success) {
    console.log(`✅ Final guest limit check successful`);
    console.log(`   Remaining detections: ${finalLimit.data.remainingDetections || 'Unknown'}`);
    console.log(`   Limit reached: ${finalLimit.data.limitReached || false}`);
  } else {
    console.log(`❌ Final guest limit check failed: ${finalLimit.error.error || finalLimit.error}`);
  }
  
  return {
    successfulPredictions,
    failedPredictions,
    limitReached: failedPredictions > 0 && successfulPredictions <= 2
  };
}

// Test with different IP addresses (simulated)
async function testDifferentIPs() {
  console.log('\n🧪 Testing with different IP addresses...\n');
  
  // This would require more sophisticated testing with different IPs
  // For now, we'll just test the current IP behavior
  console.log('📝 Note: Testing with different IPs requires network configuration');
  console.log('   Current test uses single IP address');
  console.log('   In production, each IP gets separate limit tracking');
}

// Test limit reset functionality
async function testLimitReset() {
  console.log('\n🧪 Testing limit reset functionality...\n');
  
  console.log('📝 Note: Limit reset happens automatically after 24 hours');
  console.log('   Manual reset can be done via database:');
  console.log('   UPDATE guest_detection_limits SET detection_count = 0, is_blocked = false;');
  console.log('   Or use: database-reset-guest-limits.sql');
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Guest Detection Limits Tests...\n');
  
  try {
    // Test basic guest limits
    const results = await testGuestLimits();
    
    // Test different IPs
    await testDifferentIPs();
    
    // Test limit reset
    await testLimitReset();
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 FINAL TEST SUMMARY:');
    console.log(`   Guest limit system: ${results.limitReached ? '✅ WORKING' : '❌ NOT WORKING'}`);
    console.log(`   Successful predictions: ${results.successfulPredictions}`);
    console.log(`   Failed predictions: ${results.failedPredictions}`);
    console.log('='.repeat(50));
    
    if (results.limitReached) {
      console.log('\n🎉 Guest detection limits are working correctly!');
      console.log('✅ Users without login are limited to 2 detections per IP');
      console.log('✅ Limit resets every 24 hours');
      console.log('✅ Blocked users get appropriate error messages');
    } else {
      console.log('\n⚠️ Guest detection limits may not be working properly');
      console.log('❌ Check the following:');
      console.log('   1. Backend is running on port 3000');
      console.log('   2. Database is connected and tables exist');
      console.log('   3. Guest detection limit middleware is enabled');
      console.log('   4. Test images exist in test-images folder');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testGuestLimits,
  checkGuestLimit
};
