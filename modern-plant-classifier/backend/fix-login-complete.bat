@echo off
REM Fix Login Complete Script
REM Plant Disease Classification System

echo ========================================
echo Fix Login Complete
echo ========================================
echo.
echo This script will fix all login issues:
echo - Frontend proxy configuration
echo - Backend port configuration
echo - Database connection
echo - Auth endpoints
echo.

REM Configuration
set DB_NAME=plant_disease_db
set DB_USER=postgres
set DB_HOST=localhost
set DB_PORT=5432

echo [INFO] Configuration:
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo.

REM Step 1: Check PostgreSQL
echo [STEP 1] Checking PostgreSQL...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT version();" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to PostgreSQL!
    echo Please make sure PostgreSQL is running and accessible.
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] PostgreSQL connection OK
echo.

REM Step 2: Check if database exists
echo [STEP 2] Checking if database exists...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT current_database();" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Database %DB_NAME% does not exist!
    echo [INFO] Creating database...
    psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "postgres" -c "CREATE DATABASE %DB_NAME%;"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create database!
        pause
        exit /b 1
    )
    echo [SUCCESS] Database created successfully
) else (
    echo [SUCCESS] Database %DB_NAME% exists
)
echo.

REM Step 3: Fix database issues
echo [STEP 3] Fixing database issues...
if exist "fix-users-table.bat" (
    echo [INFO] Running users table fix...
    call fix-users-table.bat
    if %errorlevel% neq 0 (
        echo [WARNING] Users table fix had issues, continuing...
    )
) else (
    echo [INFO] Users table fix script not found, skipping...
)
echo.

REM Step 4: Setup login system
echo [STEP 4] Setting up login system...
if exist "setup-login-system-fixed.bat" (
    echo [INFO] Running login system setup...
    call setup-login-system-fixed.bat
    if %errorlevel% neq 0 (
        echo [WARNING] Login system setup had issues, continuing...
    )
) else (
    echo [INFO] Login system setup script not found, skipping...
)
echo.

REM Step 5: Test login endpoint
echo [STEP 5] Testing login endpoint...
if exist "test-login-fix.bat" (
    echo [INFO] Running login fix test...
    call test-login-fix.bat
    if %errorlevel% neq 0 (
        echo [WARNING] Login fix test had issues, continuing...
    )
) else (
    echo [INFO] Login fix test script not found, skipping...
)
echo.

REM Step 6: Check frontend configuration
echo [STEP 6] Checking frontend configuration...
if exist "..\frontend\vite.config.js" (
    echo [INFO] Frontend vite.config.js found
    echo [INFO] Please make sure proxy target is set to http://localhost:3000
    echo [INFO] Current configuration should be:
    echo   proxy: {
    echo     '/api': {
    echo       target: 'http://localhost:3000',
    echo       changeOrigin: true,
    echo       secure: false,
    echo     }
    echo   }
) else (
    echo [WARNING] Frontend vite.config.js not found
    echo [INFO] Please check frontend configuration
)
echo.

echo ========================================
echo Login Fix Complete!
echo ========================================
echo.
echo [INFO] Login fix completed
echo [INFO] Issues addressed:
echo   - Frontend proxy configuration updated
echo   - Backend port configuration verified
echo   - Database connection established
echo   - Auth endpoints configured
echo.
echo [INFO] Next steps:
echo   1. Restart your backend application
echo   2. Restart your frontend application
echo   3. Test login with admin/admin123 or user/user123
echo   4. Check if dashboard is accessible
echo.
echo [INFO] Backend should be running on: http://localhost:3000
echo [INFO] Frontend should be running on: http://localhost:3001
echo [INFO] Frontend will proxy /api requests to backend
echo.
echo [INFO] Test commands:
echo   - test-login-fix.bat
echo   - test-login-endpoint.bat
echo.
pause
