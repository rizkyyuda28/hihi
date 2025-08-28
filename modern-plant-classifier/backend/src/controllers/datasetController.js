const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Dataset = require('../models/Dataset');
const User = require('../models/User');

// Configure multer for dataset uploads
const datasetStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create temporary upload directory
    const tempDir = './temp_uploads';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename for dataset organization
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const uploadDataset = multer({
  storage: datasetStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Create new dataset with multiple images
const createDataset = async (req, res) => {
  try {
    const { plantType, diseaseType, displayName, description, isHealthy } = req.body;
    const userId = 1; // Default admin user ID (no auth required)
    
    if (!plantType || !diseaseType || !displayName) {
      return res.status(400).json({
        success: false,
        error: 'Plant type, disease type, and display name are required'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one image is required'
      });
    }

    // Generate folder name
    const folderName = Dataset.generateFolderName(plantType, diseaseType);
    
    // Define target dataset folder path
    const datasetBasePath = path.join(__dirname, '../../../klasifikasi-tanaman/Dataset tanaman');
    const targetFolderPath = path.join(datasetBasePath, folderName);
    
    // Create dataset folder if it doesn't exist
    if (!fs.existsSync(targetFolderPath)) {
      fs.mkdirSync(targetFolderPath, { recursive: true });
      console.log(`📁 Created dataset folder: ${targetFolderPath}`);
    }

    // Move uploaded files to dataset folder
    const processedFiles = [];
    for (const file of req.files) {
      const targetFilePath = path.join(targetFolderPath, file.originalname);
      
      // Move file from temp to dataset folder
      fs.renameSync(file.path, targetFilePath);
      processedFiles.push({
        filename: file.originalname,
        path: targetFilePath,
        size: file.size
      });
      
      console.log(`📷 Moved image: ${file.originalname} → ${targetFilePath}`);
    }

    // Create dataset record in database
    const dataset = await Dataset.create({
      name: folderName,
      display_name: displayName,
      plant_type: plantType,
      disease_type: diseaseType,
      folder_path: targetFolderPath,
      description: description || '',
      image_count: processedFiles.length,
      is_healthy: isHealthy === 'true' || isHealthy === true,
      created_by: userId,
      metadata: {
        uploadedFiles: processedFiles.map(f => ({
          filename: f.filename,
          size: f.size
        })),
        uploadDate: new Date().toISOString()
      }
    });

    console.log(`✅ Dataset created: ${dataset.name} with ${processedFiles.length} images`);

    res.json({
      success: true,
      message: 'Dataset created successfully',
      dataset: {
        id: dataset.id,
        name: dataset.name,
        displayName: dataset.display_name,
        plantType: dataset.plant_type,
        diseaseType: dataset.disease_type,
        folderPath: dataset.folder_path,
        imageCount: dataset.image_count,
        isHealthy: dataset.is_healthy,
        createdAt: dataset.createdAt
      },
      processedFiles: processedFiles.length
    });

  } catch (error) {
    console.error('❌ Error creating dataset:', error);
    
    // Cleanup uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create dataset',
      details: error.message
    });
  }
};

// Get all datasets
const getDatasets = async (req, res) => {
  try {
    const datasets = await Dataset.findAll({
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      datasets: datasets.map(dataset => ({
        id: dataset.id,
        name: dataset.name,
        displayName: dataset.display_name,
        plantType: dataset.plant_type,
        diseaseType: dataset.disease_type,
        imageCount: dataset.image_count,
        isHealthy: dataset.is_healthy,
        isActive: dataset.is_active,
        createdAt: dataset.createdAt,
        creator: dataset.creator?.username || 'Unknown'
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching datasets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch datasets'
    });
  }
};

// Get dataset statistics
const getDatasetStats = async (req, res) => {
  try {
    const totalDatasets = await Dataset.count();
    const totalImages = await Dataset.sum('image_count') || 0;
    
    const plantTypeStats = await Dataset.findAll({
      attributes: [
        'plant_type',
        [Dataset.sequelize.fn('COUNT', Dataset.sequelize.col('id')), 'dataset_count'],
        [Dataset.sequelize.fn('SUM', Dataset.sequelize.col('image_count')), 'total_images']
      ],
      group: ['plant_type'],
      order: [[Dataset.sequelize.literal('total_images'), 'DESC']]
    });

    const healthyVsDiseased = await Dataset.findAll({
      attributes: [
        'is_healthy',
        [Dataset.sequelize.fn('COUNT', Dataset.sequelize.col('id')), 'count'],
        [Dataset.sequelize.fn('SUM', Dataset.sequelize.col('image_count')), 'images']
      ],
      group: ['is_healthy']
    });

    res.json({
      success: true,
      stats: {
        totalDatasets,
        totalImages,
        plantTypes: plantTypeStats,
        healthyVsDiseased
      }
    });
  } catch (error) {
    console.error('❌ Error fetching dataset stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dataset statistics'
    });
  }
};

// Delete dataset
const deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dataset = await Dataset.findByPk(id);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        error: 'Dataset not found'
      });
    }

    // Delete folder and files (optional - be careful!)
    const deleteFiles = req.query.deleteFiles === 'true';
    if (deleteFiles && fs.existsSync(dataset.folder_path)) {
      fs.rmSync(dataset.folder_path, { recursive: true, force: true });
      console.log(`🗑️ Deleted dataset folder: ${dataset.folder_path}`);
    }

    await dataset.destroy();
    
    res.json({
      success: true,
      message: 'Dataset deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting dataset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete dataset'
    });
  }
};

module.exports = {
  createDataset,
  getDatasets,
  getDatasetStats,
  deleteDataset,
  uploadDataset
}; 