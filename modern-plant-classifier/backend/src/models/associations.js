const User = require('./User');
const PredictionHistory = require('./PredictionHistory');
const Plant = require('./Plant');
const Disease = require('./Disease');
const Dataset = require('./Dataset');

// Define associations
User.hasMany(PredictionHistory, {
  foreignKey: 'user_id',
  as: 'predictions'
});

PredictionHistory.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'User'
});

module.exports = {
  User,
  PredictionHistory,
  Plant,
  Disease,
  Dataset
};
