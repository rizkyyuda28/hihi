const Plant = require('../models/Plant');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs').promises;

// Plant disease data based on klasifikasi-tanaman model
const plantDiseaseData = {
  0: {
    name: 'Corn Cercospora leaf spot',
    scientificName: 'Cercospora zeae-maydis',
    description: 'Cercospora leaf spot is a fungal disease that affects corn plants, causing significant yield loss if not managed properly.',
    symptoms: 'Small grayish spots on leaves that develop into large rectangular lesions with gray centers and dark brown borders. The spots may coalesce, causing large areas of leaf tissue to die.',
    treatment: 'Apply fungicides containing strobilurin or triazole compounds. Remove infected plant debris and improve air circulation around plants.',
    prevention: 'Use resistant varieties, rotate crops with non-host plants, and maintain proper plant spacing for good air circulation.',
    severity: 'Medium',
    imageUrl: '/images/corn-cercospora.jpg'
  },
  1: {
    name: 'Corn Common rust',
    scientificName: 'Puccinia sorghi',
    description: 'Common rust is a widespread fungal disease of corn caused by Puccinia sorghi, characterized by reddish-brown pustules.',
    symptoms: 'Small, reddish-brown pustules (uredinia) scattered on both leaf surfaces. Pustules may rupture and release orange-brown spores.',
    treatment: 'Apply fungicides such as mancozeb or chlorothalonil. Remove volunteer corn plants and infected debris.',
    prevention: 'Plant resistant varieties, ensure proper crop rotation, and maintain field sanitation.',
    severity: 'Low',
    imageUrl: '/images/corn-rust.jpg'
  },
  2: {
    name: 'Corn Northern Leaf Blight',
    scientificName: 'Exserohilum turcicum',
    description: 'Northern leaf blight is a destructive foliar disease of corn caused by the fungus Exserohilum turcicum.',
    symptoms: 'Large, elliptical, gray-green to tan lesions with dark borders on lower leaves. Lesions can extend across the entire leaf width.',
    treatment: 'Use fungicides containing strobilurin or triazole. Remove infected plant material and practice crop rotation.',
    prevention: 'Plant resistant varieties, avoid overhead irrigation, and maintain proper plant spacing.',
    severity: 'High',
    imageUrl: '/images/corn-northern-blight.jpg'
  },
  3: {
    name: 'Corn healthy',
    scientificName: 'Zea mays',
    description: 'Healthy corn plants showing no signs of disease or pest damage.',
    symptoms: 'Green, vigorous leaves with no spots, lesions, or discoloration. Plants exhibit normal growth and development.',
    treatment: 'No treatment needed. Continue monitoring and maintain good cultural practices.',
    prevention: 'Continue proper fertilization, irrigation, and pest monitoring to maintain plant health.',
    severity: 'Low',
    imageUrl: '/images/corn-healthy.jpg'
  },
  4: {
    name: 'Potato Early blight',
    scientificName: 'Alternaria solani',
    description: 'Early blight is a common fungal disease of potato and tomato plants caused by Alternaria solani.',
    symptoms: 'Dark brown spots with concentric rings on older leaves. Spots may have a target-like appearance with yellow halos.',
    treatment: 'Apply copper-based fungicides or chlorothalonil. Remove infected plant debris and improve air circulation.',
    prevention: 'Use resistant varieties, rotate crops, and avoid overhead watering.',
    severity: 'Medium',
    imageUrl: '/images/potato-early-blight.jpg'
  },
  5: {
    name: 'Potato Late blight',
    scientificName: 'Phytophthora infestans',
    description: 'Late blight is a devastating disease caused by the water mold Phytophthora infestans, historically responsible for the Irish Potato Famine.',
    symptoms: 'Water-soaked spots on leaves that quickly turn brown or black. White fuzzy growth may appear on leaf undersides in humid conditions.',
    treatment: 'Apply systemic fungicides containing metalaxyl or mancozeb. Remove infected plants immediately.',
    prevention: 'Use certified disease-free seed, ensure good drainage, and apply preventive fungicide sprays.',
    severity: 'Critical',
    imageUrl: '/images/potato-late-blight.jpg'
  },
  6: {
    name: 'Potato healthy',
    scientificName: 'Solanum tuberosum',
    description: 'Healthy potato plants showing vigorous growth and no disease symptoms.',
    symptoms: 'Green, healthy foliage with no spots, lesions, or discoloration. Plants show normal growth and tuber development.',
    treatment: 'No treatment needed. Continue regular monitoring and maintenance.',
    prevention: 'Maintain good cultural practices including proper nutrition, watering, and pest monitoring.',
    severity: 'Low',
    imageUrl: '/images/potato-healthy.jpg'
  },
  7: {
    name: 'Tomato Bacterial spot',
    scientificName: 'Xanthomonas campestris pv. vesicatoria',
    description: 'Bacterial spot is a serious disease affecting tomatoes and peppers, caused by several Xanthomonas species.',
    symptoms: 'Small, dark brown spots with yellow halos on leaves. Fruit may develop raised, corky spots.',
    treatment: 'Apply copper-based bactericides. Remove infected plants and avoid overhead watering.',
    prevention: 'Use disease-free seeds, practice crop rotation, and ensure good air circulation.',
    severity: 'High',
    imageUrl: '/images/tomato-bacterial-spot.jpg'
  },
  8: {
    name: 'Tomato Early blight',
    scientificName: 'Alternaria solani',
    description: 'Early blight affects tomato plants, causing leaf spots and reducing yield if not properly managed.',
    symptoms: 'Brown spots with concentric rings on older leaves. Spots may have target-like appearance with yellow borders.',
    treatment: 'Apply fungicides containing copper or chlorothalonil. Remove infected lower leaves and improve air circulation.',
    prevention: 'Use resistant varieties, mulch around plants, and avoid overhead irrigation.',
    severity: 'Medium',
    imageUrl: '/images/tomato-early-blight.jpg'
  },
  9: {
    name: 'Tomato Late blight',
    scientificName: 'Phytophthora infestans',
    description: 'Late blight is a serious disease that can quickly destroy tomato crops under favorable conditions.',
    symptoms: 'Large, dark brown to black lesions on leaves, stems, and fruit. White fungal growth may appear on leaf undersides.',
    treatment: 'Apply systemic fungicides containing metalaxyl. Remove infected plants and improve ventilation.',
    prevention: 'Use resistant varieties, avoid overhead watering, and apply preventive fungicide treatments.',
    severity: 'Critical',
    imageUrl: '/images/tomato-late-blight.jpg'
  },
  10: {
    name: 'Tomato Leaf Mold',
    scientificName: 'Cladosporium fulvum',
    description: 'Leaf mold is a fungal disease that primarily affects greenhouse-grown tomatoes.',
    symptoms: 'Yellow spots on upper leaf surfaces with olive-green to brown fuzzy growth on undersides.',
    treatment: 'Improve ventilation, reduce humidity, and apply fungicides if necessary.',
    prevention: 'Ensure good air circulation, avoid overhead watering, and maintain proper spacing.',
    severity: 'Medium',
    imageUrl: '/images/tomato-leaf-mold.jpg'
  },
  11: {
    name: 'Tomato Septoria leaf spot',
    scientificName: 'Septoria lycopersici',
    description: 'Septoria leaf spot is a common fungal disease that affects tomato foliage.',
    symptoms: 'Small, circular spots with gray centers and dark brown borders on lower leaves. Black specks (pycnidia) may be visible in spot centers.',
    treatment: 'Apply copper-based fungicides or chlorothalonil. Remove infected lower leaves and improve air circulation.',
    prevention: 'Use mulch to prevent soil splash, avoid overhead watering, and practice crop rotation.',
    severity: 'Medium',
    imageUrl: '/images/tomato-septoria.jpg'
  },
  12: {
    name: 'Tomato Spider mites',
    scientificName: 'Tetranychus urticae',
    description: 'Two-spotted spider mites are tiny arachnids that feed on plant fluids, causing stippling and leaf damage.',
    symptoms: 'Fine stippling or speckling on leaves, webbing on undersides of leaves, and eventual yellowing and dropping of leaves.',
    treatment: 'Apply miticides or use predatory mites for biological control. Increase humidity around plants.',
    prevention: 'Maintain adequate soil moisture, avoid over-fertilizing with nitrogen, and encourage beneficial insects.',
    severity: 'Medium',
    imageUrl: '/images/tomato-spider-mites.jpg'
  },
  13: {
    name: 'Tomato Target Spot',
    scientificName: 'Corynespora cassiicola',
    description: 'Target spot is a fungal disease that affects tomato leaves, stems, and fruit.',
    symptoms: 'Brown spots with concentric rings giving a target-like appearance. Spots may have yellow halos and can coalesce.',
    treatment: 'Apply fungicides containing strobilurin or copper compounds. Remove infected plant debris.',
    prevention: 'Ensure good air circulation, avoid overhead irrigation, and practice crop rotation.',
    severity: 'Medium',
    imageUrl: '/images/tomato-target-spot.jpg'
  },
  14: {
    name: 'Tomato Yellow Leaf Curl Virus',
    scientificName: 'Begomovirus',
    description: 'TYLCV is a viral disease transmitted by whiteflies that causes severe stunting and yield loss.',
    symptoms: 'Upward curling and yellowing of leaves, stunted growth, and reduced fruit production.',
    treatment: 'No cure available. Remove infected plants and control whitefly vectors.',
    prevention: 'Use resistant varieties, control whiteflies with insecticides or sticky traps, and use reflective mulches.',
    severity: 'Critical',
    imageUrl: '/images/tomato-ylcv.jpg'
  },
  15: {
    name: 'Tomato mosaic virus',
    scientificName: 'Tobamovirus',
    description: 'Tomato mosaic virus causes mottling and distortion of tomato leaves and can reduce yield.',
    symptoms: 'Light and dark green mottled pattern on leaves, leaf distortion, and stunted growth.',
    treatment: 'No treatment available. Remove infected plants and disinfect tools.',
    prevention: 'Use certified virus-free seeds, avoid tobacco use around plants, and practice good sanitation.',
    severity: 'High',
    imageUrl: '/images/tomato-mosaic.jpg'
  },
  16: {
    name: 'Tomato healthy',
    scientificName: 'Solanum lycopersicum',
    description: 'Healthy tomato plants exhibiting normal growth and no disease symptoms.',
    symptoms: 'Green, vigorous foliage with no spots, yellowing, or distortion. Plants show normal flowering and fruit development.',
    treatment: 'No treatment needed. Continue regular monitoring and good cultural practices.',
    prevention: 'Maintain proper nutrition, watering, and pest monitoring to preserve plant health.',
    severity: 'Low',
    imageUrl: '/images/tomato-healthy.jpg'
  }
};

// Seed initial data
async function seedInitialData() {
  try {
    console.log('🌱 Seeding initial data...');

    // Create admin user if not exists
    await seedAdminUser();
    
    // Seed plant disease data if not exists
    await seedPlantData();
    
    console.log('✅ Initial data seeding completed');
  } catch (error) {
    console.error('❌ Error seeding initial data:', error);
    throw error;
  }
}

// Seed admin user
async function seedAdminUser() {
  try {
    const existingAdmin = await User.findOne({ 
      where: { email: 'admin@plantdisease.com' } 
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await User.create({
        username: 'admin',
        email: 'admin@plantdisease.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      console.log('✅ Admin user created: admin@plantdisease.com / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

// Seed plant disease data
async function seedPlantData() {
  try {
    const existingPlants = await Plant.count();
    
    if (existingPlants === 0) {
      console.log('🌿 Creating plant disease data from klasifikasi-tanaman model...');
      
      const plants = [];
      
      for (const [modelClassId, data] of Object.entries(plantDiseaseData)) {
        plants.push({
          name: data.name,
          scientificName: data.scientificName,
          description: data.description,
          symptoms: data.symptoms,
          treatment: data.treatment,
          prevention: data.prevention,
          severity: data.severity,
          imageUrl: data.imageUrl,
          modelClassId: parseInt(modelClassId),
          isActive: true
        });
      }
      
      await Plant.bulkCreate(plants);
      console.log(`✅ Created ${plants.length} plant disease records`);
    } else {
      console.log(`ℹ️ Plant data already exists (${existingPlants} records)`);
    }
  } catch (error) {
    console.error('❌ Error seeding plant data:', error);
    throw error;
  }
}

// Update plant data based on model classes
async function updatePlantDataFromModel() {
  try {
    console.log('🔄 Updating plant data to match ML model...');
    
    const mlService = require('../services/mlService');
    const modelClasses = mlService.getClasses();
    
    if (!modelClasses) {
      console.log('⚠️ ML model not loaded, skipping plant data update');
      return;
    }
    
    for (const [classId, className] of Object.entries(modelClasses)) {
      const existingPlant = await Plant.findOne({ 
        where: { modelClassId: parseInt(classId) } 
      });
      
      if (!existingPlant && plantDiseaseData[classId]) {
        const data = plantDiseaseData[classId];
        await Plant.create({
          name: data.name,
          scientificName: data.scientificName,
          description: data.description,
          symptoms: data.symptoms,
          treatment: data.treatment,
          prevention: data.prevention,
          severity: data.severity,
          imageUrl: data.imageUrl,
          modelClassId: parseInt(classId),
          isActive: true
        });
        
        console.log(`✅ Added missing plant: ${data.name}`);
      }
    }
    
    console.log('✅ Plant data synchronized with ML model');
  } catch (error) {
    console.error('❌ Error updating plant data:', error);
    throw error;
  }
}

// Get disease severity statistics
async function getDiseaseStats() {
  try {
    const stats = await Plant.findAll({
      attributes: [
        'severity',
        [Plant.sequelize.fn('COUNT', Plant.sequelize.col('id')), 'count']
      ],
      group: ['severity'],
      where: { isActive: true }
    });
    
    return stats.reduce((acc, stat) => {
      acc[stat.severity] = stat.get('count');
      return acc;
    }, {});
  } catch (error) {
    console.error('❌ Error getting disease stats:', error);
    return {};
  }
}

module.exports = {
  seedInitialData,
  seedAdminUser,
  seedPlantData,
  updatePlantDataFromModel,
  getDiseaseStats,
  plantDiseaseData
}; 