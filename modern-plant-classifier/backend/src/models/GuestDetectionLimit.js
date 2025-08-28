const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GuestDetectionLimit = sequelize.define('GuestDetectionLimit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  detectionCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  lastDetectionAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  blockedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'guest_detection_limits',
  timestamps: true,
  indexes: [
    {
      fields: ['ipAddress']
    },
    {
      fields: ['isBlocked']
    }
  ]
});

module.exports = GuestDetectionLimit;
