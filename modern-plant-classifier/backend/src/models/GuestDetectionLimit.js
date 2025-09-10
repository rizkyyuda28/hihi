const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GuestDetectionLimit = sequelize.define('GuestDetectionLimit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  detection_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  last_detection_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_blocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  blocked_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'guest_detection_limits',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['ip_address']
    },
    {
      fields: ['is_blocked']
    }
  ]
});

module.exports = GuestDetectionLimit;
