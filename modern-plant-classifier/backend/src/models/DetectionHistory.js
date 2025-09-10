const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetectionHistory = sequelize.define('DetectionHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // null untuk guest user
    references: {
      model: 'users',
      key: 'id'
    }
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_file_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  original_image_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prediction_result: {
    type: DataTypes.JSON,
    allowNull: false
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  plant_class: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_guest: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  session_id: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'detection_history',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['ip_address']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = DetectionHistory;
