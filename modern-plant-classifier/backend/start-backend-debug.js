const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Backend with Debug Mode...\n');

// Set environment variables for debugging
process.env.NODE_ENV = 'development';
process.env.DEBUG = 'true';
process.env.VERBOSE_LOGGING = 'true';

// Start the backend
const backend = spawn('node', ['src/app.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    DEBUG: 'true',
    VERBOSE_LOGGING: 'true'
  }
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
  process.exit(1);
});

backend.on('exit', (code) => {
  console.log(`\n🔄 Backend exited with code ${code}`);
  if (code !== 0) {
    console.log('❌ Backend failed to start properly');
    console.log('🔍 Check the error messages above');
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down backend...');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Shutting down backend...');
  backend.kill('SIGTERM');
  process.exit(0);
});

console.log('✅ Backend started successfully!');
console.log('📡 Server should be running on http://localhost:3000');
console.log('🔍 Check the logs above for any errors');
console.log('⏹️  Press Ctrl+C to stop the server\n');
