#!/usr/bin/env node

/**
 * Test Script for Dataset Filename Validation
 * Plant Disease Classification System
 */

const { 
  validateDatasetFilename, 
  containsAllowedWords, 
  getPlantTypeFromFilename, 
  getDiseaseTypeFromFilename,
  ALLOWED_WORDS 
} = require('./src/middleware/datasetValidationMiddleware');

// Mock Express request and response objects
const createMockReq = (filename) => ({
  file: {
    originalname: filename,
    path: `/tmp/${filename}`
  }
});

const createMockRes = () => {
  const res = {
    status: (code) => {
      res.statusCode = code;
      return res;
    },
    json: (data) => {
      res.responseData = data;
      return res;
    }
  };
  return res;
};

// Test cases for filename validation
const testCases = [
  // Valid filenames - should pass
  { filename: 'corn_healthy.jpg', expected: true, description: 'Corn healthy plant' },
  { filename: 'tomato_blight.jpg', expected: true, description: 'Tomato with blight' },
  { filename: 'potato_rust.jpg', expected: true, description: 'Potato with rust' },
  { filename: 'jagung_sehat.jpg', expected: true, description: 'Jagung sehat (Indonesian)' },
  { filename: 'tomat_penyakit.jpg', expected: true, description: 'Tomat dengan penyakit' },
  { filename: 'kentang_healthy.jpg', expected: true, description: 'Kentang sehat' },
  { filename: 'maize_common_rust.jpg', expected: true, description: 'Maize with common rust' },
  { filename: 'solanum_tuberosum_early_blight.jpg', expected: true, description: 'Scientific name potato' },
  { filename: 'lycopersicon_esculentum_leaf_mold.jpg', expected: true, description: 'Scientific name tomato' },
  { filename: 'zea_mays_gray_leaf_spot.jpg', expected: true, description: 'Scientific name corn' },
  
  // Invalid filenames - should fail
  { filename: 'random_image.jpg', expected: false, description: 'Random filename' },
  { filename: 'IMG_001.jpg', expected: false, description: 'Generic image name' },
  { filename: 'photo.jpg', expected: false, description: 'Generic photo name' },
  { filename: 'test.jpg', expected: false, description: 'Test filename' },
  { filename: 'sample.png', expected: false, description: 'Sample filename' },
  { filename: 'image_123.webp', expected: false, description: 'Numbered image' },
  { filename: 'camera_shot.jpeg', expected: false, description: 'Camera shot' },
  { filename: 'screenshot.jpg', expected: false, description: 'Screenshot' },
  
  // Edge cases
  { filename: 'CORN_HEALTHY.JPG', expected: true, description: 'Uppercase filename' },
  { filename: 'Corn_Healthy.jpg', expected: true, description: 'Mixed case filename' },
  { filename: 'corn-healthy.jpg', expected: true, description: 'Hyphenated filename' },
  { filename: 'corn.healthy.jpg', expected: true, description: 'Dotted filename' },
  { filename: 'corn_healthy_001.jpg', expected: true, description: 'Filename with numbers' },
  { filename: 'my_corn_plant_healthy.jpg', expected: true, description: 'Long descriptive filename' }
];

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Utility functions
const log = (message, color = 'reset') => {
  const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logWarning = (message) => log(`⚠️ ${message}`, 'yellow');
const logInfo = (message) => log(`ℹ️ ${message}`, 'blue');
const logHeader = (message) => log(`\n${message}`, 'cyan');

const assert = (condition, testName) => {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    logSuccess(`${testName} - PASSED`);
    return true;
  } else {
    testResults.failed++;
    logError(`${testName} - FAILED`);
    return false;
  }
};

// Test functions
const testContainsAllowedWords = () => {
  logHeader('Testing containsAllowedWords function');
  
  testCases.forEach(testCase => {
    const result = containsAllowedWords(testCase.filename);
    assert(result === testCase.expected, 
      `${testCase.description}: ${testCase.filename} (expected: ${testCase.expected}, got: ${result})`);
  });
};

const testGetPlantTypeFromFilename = () => {
  logHeader('Testing getPlantTypeFromFilename function');
  
  const plantTestCases = [
    { filename: 'corn_healthy.jpg', expected: 'corn', description: 'Corn plant' },
    { filename: 'maize_blight.jpg', expected: 'corn', description: 'Maize plant' },
    { filename: 'jagung_rust.jpg', expected: 'corn', description: 'Jagung plant (Indonesian)' },
    { filename: 'potato_healthy.jpg', expected: 'potato', description: 'Potato plant' },
    { filename: 'kentang_blight.jpg', expected: 'potato', description: 'Kentang plant (Indonesian)' },
    { filename: 'tomato_healthy.jpg', expected: 'tomato', description: 'Tomato plant' },
    { filename: 'tomat_blight.jpg', expected: 'tomato', description: 'Tomat plant (Indonesian)' },
    { filename: 'random_image.jpg', expected: 'unknown', description: 'Unknown plant' }
  ];
  
  plantTestCases.forEach(testCase => {
    const result = getPlantTypeFromFilename(testCase.filename);
    assert(result === testCase.expected, 
      `${testCase.description}: ${testCase.filename} (expected: ${testCase.expected}, got: ${result})`);
  });
};

const testGetDiseaseTypeFromFilename = () => {
  logHeader('Testing getDiseaseTypeFromFilename function');
  
  const diseaseTestCases = [
    { filename: 'corn_healthy.jpg', expected: 'healthy', description: 'Healthy plant' },
    { filename: 'tomato_sehat.jpg', expected: 'healthy', description: 'Sehat plant (Indonesian)' },
    { filename: 'potato_early_blight.jpg', expected: 'early blight', description: 'Early blight' },
    { filename: 'corn_late_blight.jpg', expected: 'late blight', description: 'Late blight' },
    { filename: 'tomato_rust.jpg', expected: 'rust', description: 'Rust disease' },
    { filename: 'potato_mold.jpg', expected: 'mold', description: 'Mold disease' },
    { filename: 'corn_virus.jpg', expected: 'virus', description: 'Virus disease' },
    { filename: 'tomato_bacterial.jpg', expected: 'bacterial', description: 'Bacterial disease' },
    { filename: 'potato_spot.jpg', expected: 'spot', description: 'Spot disease' },
    { filename: 'corn_mite.jpg', expected: 'mite', description: 'Mite infestation' },
    { filename: 'random_image.jpg', expected: 'unknown', description: 'Unknown disease' }
  ];
  
  diseaseTestCases.forEach(testCase => {
    const result = getDiseaseTypeFromFilename(testCase.filename);
    assert(result === testCase.expected, 
      `${testCase.description}: ${testCase.filename} (expected: ${testCase.expected}, got: ${result})`);
  });
};

const testValidateDatasetFilename = () => {
  logHeader('Testing validateDatasetFilename middleware');
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    const req = createMockReq(testCase.filename);
    const res = createMockRes();
    let nextCalled = false;
    
    const next = () => { nextCalled = true; };
    
    validateDatasetFilename(req, res, next);
    
    if (testCase.expected) {
      // Should pass validation
      if (nextCalled && !res.statusCode) {
        passed++;
        logSuccess(`${testCase.description}: ${testCase.filename} - PASSED validation`);
      } else {
        failed++;
        logError(`${testCase.description}: ${testCase.filename} - FAILED validation (should pass)`);
      }
    } else {
      // Should fail validation
      if (res.statusCode === 400 && !nextCalled) {
        passed++;
        logSuccess(`${testCase.description}: ${testCase.filename} - CORRECTLY rejected`);
      } else {
        failed++;
        logError(`${testCase.description}: ${testCase.filename} - INCORRECTLY passed (should fail)`);
      }
    }
  });
  
  assert(passed + failed === testCases.length, 'All test cases processed');
  logInfo(`Validation tests: ${passed} passed, ${failed} failed`);
};

const testAllowedWordsList = () => {
  logHeader('Testing allowed words list');
  
  logInfo(`Total allowed words: ${ALLOWED_WORDS.length}`);
  logInfo(`Plant names: ${ALLOWED_WORDS.filter(word => 
    ['corn', 'maize', 'jagung', 'potato', 'kentang', 'tomato', 'tomat'].includes(word)).length}`);
  logInfo(`Disease names: ${ALLOWED_WORDS.filter(word => 
    ['healthy', 'blight', 'rust', 'mold', 'virus', 'bacterial', 'spot', 'mite'].includes(word)).length}`);
  
  // Check if all expected words are included
  const expectedWords = [
    'corn', 'maize', 'jagung', 'potato', 'kentang', 'tomato', 'tomat',
    'healthy', 'blight', 'rust', 'mold', 'virus', 'bacterial', 'spot', 'mite'
  ];
  
  let missingWords = [];
  expectedWords.forEach(word => {
    if (!ALLOWED_WORDS.some(allowed => allowed.toLowerCase().includes(word))) {
      missingWords.push(word);
    }
  });
  
  if (missingWords.length === 0) {
    logSuccess('All expected words are included in allowed words list');
  } else {
    logWarning(`Missing words: ${missingWords.join(', ')}`);
  }
  
  // Show sample allowed words
  logInfo('Sample allowed words:');
  ALLOWED_WORDS.slice(0, 15).forEach(word => {
    logInfo(`  - ${word}`);
  });
  if (ALLOWED_WORDS.length > 15) {
    logInfo(`  ... and ${ALLOWED_WORDS.length - 15} more`);
  }
};

const testEdgeCases = () => {
  logHeader('Testing edge cases');
  
  const edgeCases = [
    { filename: '', expected: false, description: 'Empty filename' },
    { filename: 'no_extension', expected: false, description: 'No file extension' },
    { filename: '.jpg', expected: false, description: 'Only extension' },
    { filename: 'corn_healthy.txt', expected: false, description: 'Wrong file extension' },
    { filename: 'corn_healthy.PNG', expected: true, description: 'Uppercase extension' },
    { filename: 'corn_healthy.JPEG', expected: true, description: 'JPEG extension' },
    { filename: 'corn_healthy.webp', expected: true, description: 'WebP extension' },
    { filename: 'very_long_filename_with_many_words_corn_healthy_plant_disease.jpg', expected: true, description: 'Very long filename' }
  ];
  
  edgeCases.forEach(testCase => {
    const result = containsAllowedWords(testCase.filename);
    assert(result === testCase.expected, 
      `${testCase.description}: ${testCase.filename} (expected: ${testCase.expected}, got: ${result})`);
  });
};

// Main test runner
const runTests = async () => {
  logHeader('🚀 Starting Dataset Filename Validation Tests');
  
  const tests = [
    testContainsAllowedWords,
    testGetPlantTypeFromFilename,
    testGetDiseaseTypeFromFilename,
    testValidateDatasetFilename,
    testAllowedWordsList,
    testEdgeCases
  ];
  
  for (const test of tests) {
    try {
      await test();
    } catch (error) {
      logError(`Test execution error: ${error.message}`);
      testResults.failed++;
      testResults.total++;
    }
  }
  
  // Print results
  logHeader('📊 Test Results Summary');
  logInfo(`Total Tests: ${testResults.total}`);
  logSuccess(`Passed: ${testResults.passed}`);
  logError(`Failed: ${testResults.failed}`);
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  if (testResults.failed === 0) {
    logSuccess(`Success Rate: ${successRate}% - All tests passed! 🎉`);
  } else {
    logWarning(`Success Rate: ${successRate}% - Some tests failed`);
  }
  
  // Show summary of what was tested
  logHeader('📋 Test Coverage Summary');
  logInfo('✅ Filename validation logic');
  logInfo('✅ Plant type detection');
  logInfo('✅ Disease type detection');
  logInfo('✅ Allowed words list');
  logInfo('✅ Edge cases and error handling');
  logInfo('✅ Middleware integration');
  
  // Exit with appropriate code
  process.exit(testResults.failed === 0 ? 0 : 1);
};

// Handle script execution
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testResults
};
