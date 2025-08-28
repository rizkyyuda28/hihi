@echo off
REM Verify Sequelize Configuration Script
REM Plant Disease Classification System

echo ========================================
echo Verify Sequelize Configuration
echo ========================================
echo.

echo [INFO] This script will verify your Sequelize configuration
echo [INFO] and check if the database table structure is correct.
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

REM Check if verify script exists
if not exist "verify-sequelize-config.js" (
    echo [ERROR] verify-sequelize-config.js not found!
    echo Please make sure you're in the correct directory.
    echo.
    pause
    exit /b 1
)

echo [INFO] Running Sequelize configuration verification...
echo.

REM Run the verification script
node verify-sequelize-config.js

echo.
echo [INFO] Verification completed.
echo [INFO] Check the output above for any issues.
echo.

pause
