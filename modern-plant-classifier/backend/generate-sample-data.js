const sequelize = require('./src/config/database');
const PredictionHistory = require('./src/models/PredictionHistory');

async function generateSampleData() {
  try {
    console.log('🌱 Generating sample prediction data...');
    
    // Sample prediction data
    const samplePredictions = [
      {
        user_id: null,
        image_path: 'sample-corn-healthy-1.jpg',
        prediction: 'Corn - Healthy',
        confidence: 92.5,
        status: 'healthy',
        plant_type: 'Corn',
        disease_name: null,
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
      },
      {
        user_id: null,
        image_path: 'sample-corn-blight-1.jpg',
        prediction: 'Corn - Northern Leaf Blight',
        confidence: 88.3,
        status: 'diseased',
        plant_type: 'Corn',
        disease_name: 'Northern Leaf Blight',
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      },
      {
        user_id: null,
        image_path: 'sample-potato-blight-1.jpg',
        prediction: 'Potato - Early Blight',
        confidence: 76.8,
        status: 'diseased',
        plant_type: 'Potato',
        disease_name: 'Early Blight',
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        user_id: null,
        image_path: 'sample-tomato-healthy-1.jpg',
        prediction: 'Tomato - Healthy',
        confidence: 94.1,
        status: 'healthy',
        plant_type: 'Tomato',
        disease_name: null,
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        user_id: null,
        image_path: 'sample-tomato-healthy-2.jpg',
        prediction: 'Tomato - Healthy',
        confidence: 89.2,
        status: 'healthy',
        plant_type: 'Tomato',
        disease_name: null,
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        user_id: null,
        image_path: 'sample-corn-rust-1.jpg',
        prediction: 'Corn - Common Rust',
        confidence: 82.7,
        status: 'diseased',
        plant_type: 'Corn',
        disease_name: 'Common Rust',
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        user_id: null,
        image_path: 'sample-potato-healthy-1.jpg',
        prediction: 'Potato - Healthy',
        confidence: 91.3,
        status: 'healthy',
        plant_type: 'Potato',
        disease_name: null,
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        user_id: null,
        image_path: 'sample-tomato-blight-1.jpg',
        prediction: 'Tomato - Late Blight',
        confidence: 85.6,
        status: 'diseased',
        plant_type: 'Tomato',
        disease_name: 'Late Blight',
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      }
    ];
    
    // Clear existing data
    await PredictionHistory.destroy({ where: {} });
    console.log('🗑️ Cleared existing prediction data');
    
    // Insert sample data
    await PredictionHistory.bulkCreate(samplePredictions);
    console.log(`✅ Generated ${samplePredictions.length} sample predictions`);
    
    // Show summary
    const totalPredictions = await PredictionHistory.count();
    const healthyCount = await PredictionHistory.count({ where: { status: 'healthy' } });
    const diseasedCount = await PredictionHistory.count({ where: { status: 'diseased' } });
    
    console.log('\n📊 Sample Data Summary:');
    console.log(`Total Predictions: ${totalPredictions}`);
    console.log(`Healthy Plants: ${healthyCount}`);
    console.log(`Diseased Plants: ${diseasedCount}`);
    console.log(`Health Ratio: ${healthyCount}:${diseasedCount}`);
    
    console.log('\n🎉 Sample data generation completed!');
    console.log('Now you can test the dashboard with real data.');
    
  } catch (error) {
    console.error('❌ Error generating sample data:', error);
  } finally {
    await sequelize.close();
  }
}

generateSampleData();

