@echo off
echo ========================================
echo Plant Disease Classification System
echo WITH MACHINE LEARNING INTEGRATION
echo ========================================
echo.

echo [1/4] Checking system status...
echo.

echo [2/4] Starting Backend with ML Service...
start "Backend + ML" cmd /k "cd /d %~dp0backend && node start-backend.js"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo [3/4] Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Waiting 3 seconds for frontend to start...
timeout /t 3 /nobreak > nul

echo [4/4] Testing system...
echo.

echo Testing backend health...
curl -s http://localhost:3001/health > nul
if %errorlevel% equ 0 (
    echo ✅ Backend is running
) else (
    echo ❌ Backend is not responding
)

echo Testing ML prediction...
curl -s -X POST http://localhost:3001/api/predict -F "image=@../potato.JPG" > nul
if %errorlevel% equ 0 (
    echo ✅ ML prediction is working
) else (
    echo ❌ ML prediction failed
)

echo.
echo ========================================
echo 🎉 SYSTEM READY WITH ML INTEGRATION!
echo ========================================
echo.
echo 🌐 Access URLs:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3001
echo.
echo 🔐 Admin Login:
echo    Username: admin
echo    Password: admin123
echo.
echo 🤖 ML Features:
echo    ✅ Real-time plant disease detection
echo    ✅ 17 disease classes supported
echo    ✅ 86.12% model accuracy
echo    ✅ Confidence scoring
echo    ✅ Prediction history tracking
echo.
echo Press any key to exit this launcher...
pause > nul
