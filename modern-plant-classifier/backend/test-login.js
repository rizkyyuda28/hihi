const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');
const User = require('./src/models/User');

async function testLogin() {
  try {
    console.log('🔍 Testing login functionality...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Find admin user
    const user = await User.findOne({
      where: {
        email: 'admin@plantdisease.com'
      }
    });
    
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive
    });
    
    // Test password validation
    const testPassword = 'admin123';
    const isValidPassword = await user.validatePassword(testPassword);
    
    console.log('🔐 Password validation result:', isValidPassword);
    
    if (isValidPassword) {
      console.log('✅ Login should work!');
    } else {
      console.log('❌ Password validation failed');
      
      // Let's check what's in the database
      console.log('🔍 Checking stored password hash...');
      console.log('Stored hash:', user.password);
      
      // Test direct bcrypt comparison
      const directTest = await bcrypt.compare(testPassword, user.password);
      console.log('Direct bcrypt test:', directTest);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testLogin();

