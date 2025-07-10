const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Prediction = sequelize.define('Prediction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  imageFilename: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Original filename of uploaded image'
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Stored path of uploaded image'
  },
  predictedClass: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Predicted disease class from ML model'
  },
  predictedClassId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Class ID from ML model'
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Confidence score (0.0 to 1.0)'
  },
  plantType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Detected plant type (Corn, Potato, Tomato)'
  },
  diseaseType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Detected disease type'
  },
  isHealthy: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    default: false,
    comment: 'Whether plant is detected as healthy'
  },
  processingTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ML processing time in milliseconds'
  },
  modelUsed: {
    type: DataTypes.STRING,
    allowNull: false,
    default: 'klasifikasi-tanaman-v1',
    comment: 'ML model version used'
  },
  modelAccuracy: {
    type: DataTypes.STRING,
    allowNull: false,
    default: '86.12%',
    comment: 'Model accuracy percentage'
  },
  allProbabilities: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'All class probabilities from ML model'
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'User agent of the request'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'IP address of the request'
  },
  isRealML: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    default: true,
    comment: 'Whether this is real ML prediction or fallback'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional metadata like file size, image dimensions, etc.'
  }
}, {
  tableName: 'predictions',
  timestamps: true,
  indexes: [
    {
      fields: ['predicted_class']
    },
    {
      fields: ['plant_type']
    },
    {
      fields: ['is_healthy']
    },
    {
      fields: ['confidence']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['is_real_ml']
    }
  ]
});

// Instance methods
Prediction.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Format confidence as percentage
  values.confidencePercentage = (values.confidence * 100).toFixed(2) + '%';
  
  // Parse plant and disease from predicted class
  if (values.predictedClass) {
    const parts = values.predictedClass.split('___');
    if (parts.length >= 2) {
      values.plantType = parts[0].replace(/[()]/g, '').replace(/_/g, ' ');
      values.diseaseType = parts[1].replace(/_/g, ' ');
      values.isHealthy = values.diseaseType.toLowerCase().includes('healthy');
    }
  }
  
  return values;
};

// Class methods
Prediction.getStatistics = async function() {
  try {
    const stats = await this.findAll({
      attributes: [
        'plant_type',
        'is_healthy',
        'is_real_ml',
        [sequelize.fn('COUNT', '*'), 'count'],
        [sequelize.fn('AVG', sequelize.col('confidence')), 'avgConfidence']
      ],
      group: ['plant_type', 'is_healthy', 'is_real_ml'],
      raw: true
    });
    
    return stats;
  } catch (error) {
    throw new Error(`Failed to get statistics: ${error.message}`);
  }
};

Prediction.getRecentPredictions = async function(limit = 50) {
  try {
    return await this.findAll({
      order: [['created_at', 'DESC']],
      limit: limit
    });
  } catch (error) {
    throw new Error(`Failed to get recent predictions: ${error.message}`);
  }
};

module.exports = Prediction; 