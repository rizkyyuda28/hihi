const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: false
  }
});

// Import models
const User = require('./src/models/User');
const PredictionHistory = require('./src/models/PredictionHistory');
const Plant = require('./src/models/Plant');
const Disease = require('./src/models/Disease');
const Dataset = require('./src/models/Dataset');

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created');
    
    // Create default admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@plantdisease.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    console.log('✅ Admin user created:', adminUser.username);
    
    // Create sample plants
    const plants = [
      { name: 'Tomato', scientific_name: 'Solanum lycopersicum', description: 'Common garden tomato' },
      { name: 'Potato', scientific_name: 'Solanum tuberosum', description: 'Edible tuber crop' },
      { name: 'Corn', scientific_name: 'Zea mays', description: 'Cereal grain crop' },
      { name: 'Apple', scientific_name: 'Malus domestica', description: 'Deciduous fruit tree' },
      { name: 'Grape', scientific_name: 'Vitis vinifera', description: 'Vine fruit crop' }
    ];
    
    for (const plant of plants) {
      await Plant.create(plant);
    }
    console.log('✅ Sample plants created');
    
    // Create sample diseases
    const diseases = [
      { name: 'Healthy', description: 'Plant is healthy with no disease symptoms' },
      { name: 'Bacterial Spot', description: 'Bacterial infection causing spots on leaves' },
      { name: 'Early Blight', description: 'Fungal disease causing early leaf blight' },
      { name: 'Late Blight', description: 'Fungal disease causing late blight' },
      { name: 'Leaf Mold', description: 'Fungal disease causing leaf mold' },
      { name: 'Septoria Leaf Spot', description: 'Fungal disease causing leaf spots' },
      { name: 'Spider Mites', description: 'Pest infestation causing damage' },
      { name: 'Target Spot', description: 'Fungal disease causing target-shaped spots' },
      { name: 'Yellow Leaf Curl Virus', description: 'Viral disease causing leaf curling' },
      { name: 'Mosaic Virus', description: 'Viral disease causing mosaic patterns' }
    ];
    
    for (const disease of diseases) {
      await Disease.create(disease);
    }
    console.log('✅ Sample diseases created');
    
    console.log('🎉 Database setup completed successfully!');
    console.log('📝 Default admin credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;
