const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Disease = sequelize.define('Disease', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  plant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'plants',
      key: 'id'
    },
    comment: 'ID tanaman yang terkait'
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    comment: 'Nama penyakit'
  },
  scientific_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Nama ilmiah penyakit/patogen'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Deskripsi penyakit'
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Gejala-gejala penyakit'
  },
  causes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Penyebab penyakit'
  },
  treatment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Cara pengobatan'
  },
  prevention: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Cara pencegahan'
  },
  severity_level: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: false,
    defaultValue: 'Medium',
    comment: 'Tingkat keparahan penyakit'
  },
  model_class_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
    comment: 'Nama class di model ML (contoh: Corn_(maize)___Common_rust_)'
  },
  model_class_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Index class di model ML'
  },
  image_samples: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array URL contoh gambar penyakit'
  },
  is_healthy: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Apakah ini kategori sehat'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Status aktif untuk klasifikasi'
  }
}, {
  tableName: 'diseases',
  comment: 'Data penyakit tanaman dan mapping ke model ML'
});

module.exports = Disease; 