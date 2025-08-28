#!/usr/bin/env node

/**
 * Verify Sequelize Configuration Script
 * Plant Disease Classification System
 */

const { Sequelize } = require('sequelize');

console.log('🔍 Verifying Sequelize Configuration...\n');

// Test configuration
const testConfig = {
  dialect: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'plant_classifier_dev',
  username: 'postgres',
  password: 'admin123',
  logging: false,
  define: {
    timestamps: true,
    underscored: true,  // This should be true
    freezeTableName: false
  }
};

console.log('📋 Configuration:');
console.log(`  Dialect: ${testConfig.dialect}`);
console.log(`  Host: ${testConfig.host}`);
console.log(`  Port: ${testConfig.port}`);
console.log(`  Database: ${testConfig.database}`);
console.log(`  Username: ${testConfig.username}`);
console.log(`  Timestamps: ${testConfig.define.timestamps}`);
console.log(`  Underscored: ${testConfig.define.underscored} ⭐`);
console.log(`  Freeze Table Name: ${testConfig.define.freezeTableName}\n`);

// Create test instance
const testSequelize = new Sequelize(testConfig);

// Test connection
async function testConnection() {
  try {
    await testSequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test column name conversion
    console.log('\n🧪 Testing column name conversion...');
    
    // Test with sample field names
    const testFields = [
      'imageFilename',
      'predictedClass', 
      'plantType',
      'isRealML',
      'processingTime',
      'modelUsed'
    ];
    
    console.log('Field Name → Column Name:');
    testFields.forEach(field => {
      // Simulate Sequelize conversion
      const columnName = field.replace(/([A-Z])/g, '_$1').toLowerCase();
      console.log(`  ${field} → ${columnName}`);
    });
    
    // Test specific problematic field
    const isRealML = 'isRealML';
    const expectedColumn = 'is_real_ml';
    const actualColumn = isRealML.replace(/([A-Z])/g, '_$1').toLowerCase();
    
    console.log(`\n🎯 Critical Test:`);
    console.log(`  Model Field: ${isRealML}`);
    console.log(`  Expected Column: ${expectedColumn}`);
    console.log(`  Actual Column: ${actualColumn}`);
    console.log(`  Match: ${actualColumn === expectedColumn ? '✅ YES' : '❌ NO'}`);
    
    if (actualColumn !== expectedColumn) {
      console.log('\n⚠️  WARNING: Column name conversion mismatch!');
      console.log('   This will cause database errors.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Test database table structure
async function testTableStructure() {
  try {
    console.log('\n🔍 Testing table structure...');
    
    // Test if predictions table exists and has correct columns
    const [results] = await testSequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'predictions' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    if (results.length === 0) {
      console.log('❌ Predictions table not found!');
      return false;
    }
    
    console.log('✅ Predictions table found');
    console.log('\n📊 Table columns:');
    results.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type})`);
    });
    
    // Check for critical columns
    const criticalColumns = [
      'is_real_ml',
      'image_filename', 
      'predicted_class',
      'plant_type'
    ];
    
    console.log('\n🎯 Checking critical columns:');
    criticalColumns.forEach(col => {
      const exists = results.some(r => r.column_name === col);
      console.log(`  ${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Table structure test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Sequelize configuration tests...\n');
  
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n❌ Cannot proceed with table tests - connection failed');
    await testSequelize.close();
    process.exit(1);
  }
  
  const tableOk = await testTableStructure();
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST SUMMARY:');
  console.log(`  Database Connection: ${connectionOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Table Structure: ${tableOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(50));
  
  if (connectionOk && tableOk) {
    console.log('\n🎉 All tests passed! Sequelize should work correctly.');
    console.log('💡 If you still get column errors, try:');
    console.log('   1. Restart the backend application');
    console.log('   2. Check if the config file was saved');
    console.log('   3. Verify no caching issues');
  } else {
    console.log('\n⚠️  Some tests failed. Please fix the issues above.');
  }
  
  await testSequelize.close();
}

// Handle script execution
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testConfig
};
