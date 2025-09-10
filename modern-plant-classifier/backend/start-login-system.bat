@echo off
REM Start Login System Script
REM Plant Disease Classification System

echo ========================================
echo Start Login System
echo ========================================
echo.
echo This script will start the complete login system
echo with all necessary components and checks.
echo.

REM Step 1: Check prerequisites
echo [STEP 1] Checking prerequisites...
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js and try again.
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check PostgreSQL
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL not found!
    echo Please install PostgreSQL and try again.
    echo.
    pause
    exit /b 1
)
echo ✅ PostgreSQL found

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo Please run this script from the backend directory.
    echo.
    pause
    exit /b 1
)
echo ✅ Backend directory found

echo.

REM Step 2: Install dependencies
echo [STEP 2] Installing dependencies...
echo.

if exist "node_modules" (
    echo [INFO] node_modules found, skipping installation
) else (
    echo [INFO] Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        echo Please check your internet connection and try again.
        echo.
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed
)
echo.

REM Step 3: Setup environment
echo [STEP 3] Setting up environment...
echo.

if exist ".env" (
    echo [INFO] .env file found
) else (
    echo [INFO] Creating .env file...
    call setup-environment.bat
    if %errorlevel% neq 0 (
        echo [WARNING] Environment setup had issues, continuing...
    )
)
echo.

REM Step 4: Setup database
echo [STEP 4] Setting up database...
echo.

if exist "setup-database.bat" (
    echo [INFO] Running database setup...
    call setup-database.bat
    if %errorlevel% neq 0 (
        echo [WARNING] Database setup had issues, continuing...
    )
) else (
    echo [INFO] Database setup script not found, skipping...
)
echo.

REM Step 5: Setup login system
echo [STEP 5] Setting up login system...
echo.

if exist "setup-login-system.bat" (
    echo [INFO] Running login system setup...
    call setup-login-system.bat
    if %errorlevel% neq 0 (
        echo [WARNING] Login system setup had issues, continuing...
    )
) else (
    echo [INFO] Login system setup script not found, skipping...
)
echo.

REM Step 6: Fix predictions table
echo [STEP 6] Fixing predictions table...
echo.

if exist "quick-fix-predictions.bat" (
    echo [INFO] Running predictions table fix...
    call quick-fix-predictions.bat
    if %errorlevel% neq 0 (
        echo [WARNING] Predictions table fix had issues, continuing...
    )
) else (
    echo [INFO] Predictions table fix script not found, skipping...
)
echo.

REM Step 7: Verify integration
echo [STEP 7] Verifying integration...
echo.

if exist "verify-login-integration.bat" (
    echo [INFO] Running integration verification...
    call verify-login-integration.bat
    if %errorlevel% neq 0 (
        echo [WARNING] Integration verification had issues, continuing...
    )
) else (
    echo [INFO] Integration verification script not found, skipping...
)
echo.

REM Step 8: Start backend
echo [STEP 8] Starting backend...
echo.

echo [INFO] Starting Plant Disease Classification Backend...
echo [INFO] This will start the server with login system enabled
echo.

REM Check if backend is already running
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Backend is already running on port 3000
    echo [INFO] Stopping existing backend...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 >nul
)

echo [INFO] Starting backend server...
echo [INFO] Press Ctrl+C to stop the server
echo.

REM Start the backend
npm start

echo.
echo [INFO] Backend stopped
echo [INFO] Login system setup completed
echo.
pause
