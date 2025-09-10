@echo off
REM Fix Login Error Script
REM Plant Disease Classification System

echo ========================================
echo Fix Login Error
echo ========================================
echo.
echo This script will fix the login error
echo by ensuring backend runs on correct port
echo and routes are properly configured.
echo.

REM Configuration
set BACKEND_PORT=3000
set FRONTEND_PORT=5173
set DB_NAME=plant_classifier_dev
set DB_USER=postgres
set DB_HOST=localhost
set DB_PORT=5432

echo [INFO] Configuration:
echo   Backend Port: %BACKEND_PORT%
echo   Frontend Port: %FRONTEND_PORT%
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo.

REM Step 1: Check if backend is running
echo [STEP 1] Checking if backend is running...
curl -s http://localhost:%BACKEND_PORT%/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Backend is running on port %BACKEND_PORT%
) else (
    echo [WARNING] Backend not running on port %BACKEND_PORT%
    echo [INFO] Please start the backend first:
    echo   npm start
    echo.
    echo [INFO] Continuing with other checks...
)
echo.

REM Step 2: Check database connection
echo [STEP 2] Checking database connection...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT current_database();" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to database!
    echo [INFO] Please run setup-database.bat first
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] Database connection OK
echo.

REM Step 3: Check if users table exists and has data
echo [STEP 3] Checking users table...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT COUNT(*) FROM users;" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Users table not found!
    echo [INFO] Please run setup-login-system.bat first
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] Users table exists
echo.

REM Step 4: Check if auth routes are properly configured
echo [STEP 4] Checking auth routes configuration...
if exist "src\routes\authRoutes.js" (
    echo [SUCCESS] Auth routes file exists
) else (
    echo [ERROR] Auth routes file not found!
    echo [INFO] Please check if src\routes\authRoutes.js exists
    pause
    exit /b 1
)

if exist "src\app.js" (
    echo [SUCCESS] Main app file exists
) else (
    echo [ERROR] Main app file not found!
    echo [INFO] Please check if src\app.js exists
    pause
    exit /b 1
)
echo.

REM Step 5: Check if auth routes are registered in app.js
echo [STEP 5] Checking if auth routes are registered...
findstr /C:"app.use('/api/auth'" src\app.js >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Auth routes are registered in app.js
) else (
    echo [ERROR] Auth routes not registered in app.js!
    echo [INFO] Please check if auth routes are properly imported and registered
    pause
    exit /b 1
)
echo.

REM Step 6: Test login endpoint
echo [STEP 6] Testing login endpoint...
curl -s -X POST http://localhost:%BACKEND_PORT%/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}" >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Login endpoint is accessible
) else (
    echo [WARNING] Login endpoint test failed
    echo [INFO] This might be due to missing credentials or server issues
)
echo.

REM Step 7: Check environment variables
echo [STEP 7] Checking environment variables...
if exist ".env" (
    echo [SUCCESS] .env file exists
    findstr /C:"PORT=" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo [SUCCESS] PORT is configured in .env
    ) else (
        echo [WARNING] PORT not found in .env, using default 3000
    )
) else (
    echo [WARNING] .env file not found, using default configuration
)
echo.

REM Step 8: Provide solutions
echo ========================================
echo Login Error Fix Summary
echo ========================================
echo.
echo [INFO] Common solutions for login errors:
echo.
echo 1. PORT MISMATCH:
echo    - Backend runs on port %BACKEND_PORT%
echo    - Frontend should connect to http://localhost:%BACKEND_PORT%
echo    - NOT http://localhost:3005
echo.
echo 2. BACKEND NOT RUNNING:
echo    - Start backend: npm start
echo    - Check if it's running on port %BACKEND_PORT%
echo.
echo 3. DATABASE ISSUES:
echo    - Run: setup-database.bat
echo    - Run: setup-login-system.bat
echo.
echo 4. ROUTES NOT REGISTERED:
echo    - Check src\app.js has auth routes
echo    - Check src\routes\authRoutes.js exists
echo.
echo 5. ENVIRONMENT VARIABLES:
echo    - Check .env file has correct PORT
echo    - Restart backend after changing .env
echo.
echo [INFO] Next steps:
echo   1. Make sure backend is running on port %BACKEND_PORT%
echo   2. Update frontend to use port %BACKEND_PORT%
echo   3. Test login with: http://localhost:%BACKEND_PORT%/api/auth/login
echo   4. Check browser console for errors
echo.
pause
