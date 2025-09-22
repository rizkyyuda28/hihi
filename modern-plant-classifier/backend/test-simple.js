console.log('Testing basic Node.js...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

try {
  const express = require('express');
  console.log('Express loaded successfully');
} catch (error) {
  console.error('Express error:', error.message);
}

try {
  const sequelize = require('sequelize');
  console.log('Sequelize loaded successfully');
} catch (error) {
  console.error('Sequelize error:', error.message);
}
