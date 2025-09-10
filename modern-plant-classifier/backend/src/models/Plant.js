const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plant = sequelize.define('Plant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nama tanaman (contoh: Corn, Potato, Tomato)'
  },
  scientific_name: {
    type: DataTypes.STRING(150),
    allowNull: true,
    comment: 'Nama ilmiah tanaman'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Deskripsi umum tanaman'
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL gambar tanaman'
  },
  care_instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Instruksi perawatan umum'
  },
  growing_season: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Musim tanam yang ideal'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Status aktif untuk klasifikasi'
  }
}, {
  tableName: 'plants',
  timestamps: true,
  underscored: true,
  comment: 'Master data tanaman yang dapat diklasifikasi'
});

module.exports = Plant; 