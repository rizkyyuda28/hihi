@echo off
echo ==========================================
echo  REAL MACHINE LEARNING PLANT CLASSIFIER
echo ==========================================
echo.

echo [1/3] Checking Python availability...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

echo.
echo [2/3] Starting Backend (Real ML)...
echo Backend URL: http://localhost:3007/api
start cmd /c "cd backend && node src/app-real-ml.js"

echo.
echo [3/3] Starting Frontend...
echo Frontend URL: http://localhost:3002
start cmd /c "cd frontend && npm run dev"

echo.
echo ==========================================
echo  SERVICES STARTING...
echo ==========================================
echo Backend: http://localhost:3007/api/health
echo Frontend: http://localhost:3002
echo.
echo Wait 10 seconds then test:
timeout /t 10 /nobreak

echo.
echo Testing backend connection...
curl -X GET http://localhost:3007/api/health
echo.

echo ==========================================
echo  READY TO TEST!
echo ==========================================
echo 1. Open: http://localhost:3002
echo 2. Upload image
echo 3. Check browser console for debug info
echo.
pause 