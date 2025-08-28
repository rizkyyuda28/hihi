const { sequelize } = require('./src/config/database');
const Dataset = require('./src/models/Dataset');

async function seedDatasets() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sample datasets
    const sampleDatasets = [
      {
        name: 'Corn___healthy',
        display_name: 'Jagung Sehat',
        plant_type: 'Corn',
        disease_type: 'healthy',
        folder_path: 'klasifikasi-tanaman/Dataset tanaman/Corn___healthy',
        description: 'Daun jagung yang sehat tanpa penyakit',
        image_count: 2321,
        is_healthy: true,
        created_by: 1,
        metadata: { source: 'sample' }
      },
      {
        name: 'Corn___Cercospora_leaf_spot_Gray_leaf_spot',
        display_name: 'Jagung Cercospora Leaf Spot',
        plant_type: 'Corn',
        disease_type: 'Cercospora leaf spot Gray leaf spot',
        folder_path: 'klasifikasi-tanaman/Dataset tanaman/Corn___Cercospora_leaf_spot_Gray_leaf_spot',
        description: 'Jagung dengan penyakit bercak daun Cercospora',
        image_count: 2049,
        is_healthy: false,
        created_by: 1,
        metadata: { source: 'sample' }
      },
      {
        name: 'Corn___Common_rust',
        display_name: 'Jagung Common Rust',
        plant_type: 'Corn',
        disease_type: 'Common rust',
        folder_path: 'klasifikasi-tanaman/Dataset tanaman/Corn___Common_rust',
        description: 'Jagung dengan penyakit karat',
        image_count: 2381,
        is_healthy: false,
        created_by: 1,
        metadata: { source: 'sample' }
      },
      {
        name: 'Corn___Northern_Leaf_Blight',
        display_name: 'Jagung Northern Leaf Blight',
        plant_type: 'Corn',
        disease_type: 'Northern Leaf Blight',
        folder_path: 'klasifikasi-tanaman/Dataset tanaman/Corn___Northern_Leaf_Blight',
        description: 'Jagung dengan penyakit hawar daun utara',
        image_count: 2382,
        is_healthy: false,
        created_by: 1,
        metadata: { source: 'sample' }
      },
      {
        name: 'Potato___healthy',
        display_name: 'Kentang Sehat',
        plant_type: 'Potato',
        disease_type: 'healthy',
        folder_path: 'klasifikasi-tanaman/Dataset tanaman/Potato___healthy',
        description: 'Daun kentang yang sehat',
        image_count: 2277,
        is_healthy: true,
        created_by: 1,
        metadata: { source: 'sample' }
      },
      {
        name: 'Potato___Early_blight',
        display_name: 'Kentang Early Blight',
        plant_type: 'Potato',
        disease_type: 'Early blight',
        folder_path: 'klasifikasi-tanaman/Dataset tanaman/Potato___Early_blight',
        description: 'Kentang dengan penyakit hawar dini',
        image_count: 2421,
        is_healthy: false,
        created_by: 1,
        metadata: { source: 'sample' }
      },
      {
        name: 'Potato___Late_blight',
        display_name: 'Kentang Late Blight',
        plant_type: 'Potato',
        disease_type: 'Late blight',
        folder_path: 'klasifikasi-tanaman/Dataset tanaman/Potato___Late_blight',
        description: 'Kentang dengan penyakit hawar lambat',
        image_count: 2421,
        is_healthy: false,
        created_by: 1,
        metadata: { source: 'sample' }
      },
      {
        name: 'Tomato___healthy',
        display_name: 'Tomat Sehat',
        plant_type: 'Tomato',
        disease_type: 'healthy',
        folder_path: 'klasifikasi-tanaman/Dataset tanaman/Tomato___healthy',
        description: 'Daun tomat yang sehat',
        image_count: 2404,
        is_healthy: true,
        created_by: 1,
        metadata: { source: 'sample' }
      },
      {
        name: 'Tomato___Bacterial_spot',
        display_name: 'Tomat Bacterial Spot',
        plant_type: 'Tomato',
        disease_type: 'Bacterial spot',
        folder_path: 'klasifikasi-tanaman/Dataset tanaman/Tomato___Bacterial_spot',
        description: 'Tomat dengan penyakit bercak bakteri',
        image_count: 2124,
        is_healthy: false,
        created_by: 1,
        metadata: { source: 'sample' }
      },
      {
        name: 'Tomato___Early_blight',
        display_name: 'Tomat Early Blight',
        plant_type: 'Tomato',
        disease_type: 'Early blight',
        folder_path: 'klasifikasi-tanaman/Dataset tanaman/Tomato___Early_blight',
        description: 'Tomat dengan penyakit hawar dini',
        image_count: 2397,
        is_healthy: false,
        created_by: 1,
        metadata: { source: 'sample' }
      }
    ];

    // Clear existing datasets
    await Dataset.destroy({ where: {} });
    console.log('🗑️ Cleared existing datasets');

    // Insert sample datasets
    for (const dataset of sampleDatasets) {
      await Dataset.create(dataset);
      console.log(`✅ Created dataset: ${dataset.display_name}`);
    }

    console.log('🎉 Sample datasets seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding datasets:', error);
    process.exit(1);
  }
}

seedDatasets(); 