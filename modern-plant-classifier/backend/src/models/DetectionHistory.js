const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetectionHistory = sequelize.define('DetectionHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null untuk guest user
    references: {
      model: 'users',
      key: 'id'
    }
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageFileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalImageName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  predictionResult: {
    type: DataTypes.JSON,
    allowNull: false
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  plantClass: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isGuest: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'detection_history',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['ipAddress']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = DetectionHistory;
