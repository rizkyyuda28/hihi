const { Sequelize } = require('sequelize');

// Database configuration
const config = {
  development: {
    dialect: 'postgresql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'plant_classifier_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin123',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: false
    }
  },
  production: {
    dialect: 'postgresql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: false
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

// Get current environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
const sequelize = new Sequelize(dbConfig);

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
  }
}

module.exports = sequelize;
module.exports.testConnection = testConnection;
module.exports.initializeDatabase = initializeDatabase;
module.exports.closeDatabase = closeDatabase; 