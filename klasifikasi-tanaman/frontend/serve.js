/**
 * Simple Static Server for Frontend Demo
 * Serves the modern plant disease classification frontend
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// CORS for API calls to backend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('🎨 Frontend Demo Server Started!');
  console.log(`🌐 Open your browser: http://localhost:${PORT}`);
  console.log('📱 Frontend: Modern HTML5 + JavaScript');
  console.log('🔗 Backend API: http://localhost:3000');
  console.log('✅ Full-stack modern plant disease classification demo ready!');
}); 