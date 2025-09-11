@echo off
echo Starting Plant Disease Classification System...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd modern-plant-classifier\backend && node start-backend.js"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd modern-plant-classifier\frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
