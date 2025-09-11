@echo off
echo ========================================
echo Plant Disease Classification System
echo ========================================
echo.

echo [1/3] Installing dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Setting up database...
cd ../backend
call node setup-database.js
if %errorlevel% neq 0 (
    echo Database setup completed (may already exist)
)

echo.
echo [3/4] Starting ML Service...
echo Starting ML Service on port 5000...
start "ML Service" cmd /k "cd /d %~dp0backend && start-ml-service.bat"

echo Waiting 3 seconds for ML service to start...
timeout /t 3 /nobreak > nul

echo [4/4] Starting servers...
echo.
echo Starting Backend Server on port 3001...
start "Backend Server" cmd /k "cd /d %~dp0backend && node start-backend.js"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server on port 5173...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo System is starting up...
echo ========================================
echo ML Service: http://localhost:5000
echo Backend:    http://localhost:3001
echo Frontend:   http://localhost:5173
echo.
echo Default Admin Login:
echo Username: admin
echo Password: admin123
echo.
echo Press any key to exit this launcher...
pause > nul
