const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dataset = sequelize.define('Dataset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nama dataset (contoh: Mango_healthy, Apple_scab)'
  },
  display_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    comment: 'Nama tampilan yang user-friendly'
  },
  plant_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Jenis tanaman (Mango, Apple, etc.)'
  },
  disease_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Jenis penyakit (healthy jika sehat)'
  },
  folder_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Path ke folder dataset di sistem file'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Deskripsi dataset'
  },
  image_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah gambar dalam dataset'
  },
  is_healthy: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Apakah dataset untuk tanaman sehat'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID admin yang membuat dataset'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Status aktif dataset'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Metadata tambahan (tags, classification info, etc.)'
  }
}, {
  tableName: 'datasets',
  timestamps: true,
  comment: 'Dataset training yang dibuat admin'
});

// Static method untuk generate folder name
Dataset.generateFolderName = (plantType, diseaseType) => {
  const cleanPlant = plantType.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanDisease = diseaseType.replace(/[^a-zA-Z0-9]/g, '_');
  return `${cleanPlant}___${cleanDisease}`;
};

// Associations
Dataset.associate = (models) => {
  Dataset.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator'
  });
};

module.exports = Dataset; 