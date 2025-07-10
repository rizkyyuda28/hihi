@echo off
echo 🌱 Starting Modern Plant Disease Classification System
echo.

echo ⚡ Starting Backend (Node.js + Express)...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3

echo 🌐 Starting Frontend (React + Vite)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ System is starting up!
echo 📡 Backend will run on: http://localhost:3000
echo 🌐 Frontend will run on: http://localhost:5173
echo.
echo 📝 Note: If TensorFlow.js installation failed, the system will use
echo    fallback mode with mock predictions for demonstration.
echo.
echo 🔧 To install TensorFlow.js properly on Windows:
echo    1. Install Visual Studio Build Tools
echo    2. Or use WSL (Windows Subsystem for Linux)
echo    3. Or use Docker
echo.
pause 