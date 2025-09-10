@echo off
REM Test Guest Detection Limits Script
REM Plant Disease Classification System

echo ========================================
echo Test Guest Detection Limits
echo ========================================
echo.
echo This script will test the guest detection limits
echo to ensure users without login are limited to 2 detections per IP.
echo.

REM Check if Node.js is available
echo [INFO] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js and try again.
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] Node.js found
echo.

REM Check if axios is available
echo [INFO] Checking axios dependency...
node -e "require('axios')" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] axios not found, installing...
    npm install axios
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install axios!
        echo Please run: npm install axios
        echo.
        pause
        exit /b 1
    )
)
echo [SUCCESS] axios available
echo.

REM Check if form-data is available
echo [INFO] Checking form-data dependency...
node -e "require('form-data')" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] form-data not found, installing...
    npm install form-data
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install form-data!
        echo Please run: npm install form-data
        echo.
        pause
        exit /b 1
    )
)
echo [SUCCESS] form-data available
echo.

REM Check if backend is running
echo [INFO] Checking if backend is running...
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Backend not responding on port 3000
    echo Please make sure the backend is running:
    echo   npm start
    echo.
    echo [INFO] Continuing with tests anyway...
    echo.
)

REM Create test images directory if it doesn't exist
if not exist "test-images" (
    echo [INFO] Creating test-images directory...
    mkdir test-images
    echo [INFO] Please add test images to test-images folder
    echo [INFO] Required images:
    echo   - corn_healthy.jpg
    echo   - tomato_blight.jpg
    echo   - potato_rust.jpg
    echo.
)

REM Run the test script
echo [INFO] Running guest detection limits tests...
echo.

node test-guest-limits.js

echo.
echo [INFO] Test completed.
echo [INFO] Check the output above for test results.
echo.

pause
