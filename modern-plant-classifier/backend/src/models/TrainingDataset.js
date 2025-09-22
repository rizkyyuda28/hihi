const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrainingDataset = sequelize.define('TrainingDataset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  disease_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'diseases',
      key: 'id'
    },
    comment: 'ID penyakit yang terkait'
  },
  image_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Path file gambar training'
  },
  image_filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nama file gambar'
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL publik gambar (jika ada)'
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Ukuran file dalam bytes'
  },
  image_width: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Lebar gambar dalam pixel'
  },
  image_height: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tinggi gambar dalam pixel'
  },
  dataset_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'train',
    comment: 'Jenis dataset untuk ML'
  },
  data_source: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Sumber data (contoh: PlantVillage, manual_upload)'
  },
  augmentation_applied: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Daftar augmentasi yang diterapkan'
  },
  quality_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'Skor kualitas gambar 0.00-1.00'
  },
  verification_status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Status verifikasi oleh expert'
  },
  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID user yang memverifikasi'
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Waktu verifikasi'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Catatan tambahan'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Status aktif untuk training'
  }
}, {
  tableName: 'training_datasets',
  comment: 'Dataset gambar untuk training model ML',
  indexes: [
    {
      fields: ['disease_id']
    },
    {
      fields: ['dataset_type']
    },
    {
      fields: ['verification_status']
    },
    {
      fields: ['image_filename'],
      unique: true
    }
  ]
});

module.exports = TrainingDataset; 