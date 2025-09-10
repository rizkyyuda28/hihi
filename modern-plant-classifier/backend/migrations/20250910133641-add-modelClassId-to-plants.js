'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Tambahkan kolom modelClassId ke tabel plants
    await queryInterface.addColumn('plants', 'modelClassId', {
      type: Sequelize.INTEGER,
      allowNull: true,     // bisa null kalau tidak selalu ada
    });
  },

  async down (queryInterface, Sequelize) {
    // Hapus kolom modelClassId kalau migration di-rollback
    await queryInterface.removeColumn('plants', 'modelClassId');
  }
};
