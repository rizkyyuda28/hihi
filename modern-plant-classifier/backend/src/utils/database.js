const { Sequelize } = require('sequelize');
const path = require('path');

// Database configuration
const config = {
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || path.join(__dirname, '../../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // SQLite specific options
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  
  // Define options
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: false
  }
};

// Create Sequelize instance
const sequelize = new Sequelize(config);

// Test connection function
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
}

// Initialize database
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await testConnection();
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Close database connection
async function closeDatabase() {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
    throw error;
  }
}

module.exports = sequelize;
module.exports.testConnection = testConnection;
module.exports.initializeDatabase = initializeDatabase;
module.exports.closeDatabase = closeDatabase; 