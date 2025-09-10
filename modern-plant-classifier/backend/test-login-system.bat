@echo off
REM Test Login System Script
REM Plant Disease Classification System

echo ========================================
echo Test Login System
echo ========================================
echo.
echo This script will test the login system
echo to ensure all authentication features work correctly.
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

REM Run the test script
echo [INFO] Running login system tests...
echo.

node test-login-system.js

echo.
echo [INFO] Test completed.
echo [INFO] Check the output above for test results.
echo.

pause
