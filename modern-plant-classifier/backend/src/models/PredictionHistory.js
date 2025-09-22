const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PredictionHistory = sequelize.define('PredictionHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null for guest users
    references: {
      model: 'users',
      key: 'id'
    }
  },
  image_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prediction: {
    type: DataTypes.STRING,
    allowNull: false
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  plant_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  disease_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'prediction_histories',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = PredictionHistory;

