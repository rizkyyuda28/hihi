const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');
const User = require('./src/models/User');

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin password...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Find admin user
    const admin = await User.findOne({
      where: {
        email: 'admin@plantdisease.com'
      }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found');
    
    // Update password to admin123
    admin.password = 'admin123';
    await admin.save();
    
    console.log('✅ Admin password updated to admin123');
    
    // Test the new password
    const isValid = await admin.validatePassword('admin123');
    console.log('🔐 Password validation test:', isValid ? '✅ SUCCESS' : '❌ FAILED');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixAdminPassword();


