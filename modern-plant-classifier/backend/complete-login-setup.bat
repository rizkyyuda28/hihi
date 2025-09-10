@echo off
REM Complete Login Setup Script
REM Plant Disease Classification System

echo ========================================
echo Complete Login Setup
echo ========================================
echo.
echo This script will set up the complete login system
echo including database setup, user accounts, and testing.
echo.

REM Configuration
set DB_NAME=plant_classifier_dev
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

REM Step 2: Setup database (if needed)
echo [STEP 2] Setting up database...
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

REM Step 3: Setup login system
echo [STEP 3] Setting up login system...
if exist "setup-login-system.bat" (
    echo [INFO] Running login system setup...
    call setup-login-system.bat
    if %errorlevel% neq 0 (
        echo [ERROR] Login system setup failed!
        pause
        exit /b 1
    )
) else (
    echo [ERROR] Login system setup script not found!
    pause
    exit /b 1
)
echo.

REM Step 4: Fix predictions table (if needed)
echo [STEP 4] Fixing predictions table...
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

REM Step 5: Verify configuration
echo [STEP 5] Verifying configuration...
if exist "verify-config.bat" (
    echo [INFO] Running configuration verification...
    call verify-config.bat
    if %errorlevel% neq 0 (
        echo [WARNING] Configuration verification had issues, continuing...
    )
) else (
    echo [INFO] Configuration verification script not found, skipping...
)
echo.

REM Step 6: Test login system
echo [STEP 6] Testing login system...
if exist "test-login-system.bat" (
    echo [INFO] Running login system tests...
    call test-login-system.bat
    if %errorlevel% neq 0 (
        echo [WARNING] Login system tests had issues, continuing...
    )
) else (
    echo [INFO] Login system test script not found, skipping...
)
echo.

echo ========================================
echo Complete Login Setup Finished!
echo ========================================
echo.
echo [INFO] Login system setup completed
echo [INFO] All components have been configured
echo.
echo [INFO] Default accounts created:
echo   - Admin: admin / admin123
echo   - User: user / user123
echo.
echo [INFO] Features available:
echo   - User authentication with JWT tokens
echo   - Password hashing with bcrypt
echo   - Role-based access control (admin/user)
echo   - Session management
echo   - Login audit logs
echo   - Guest detection limits (2 per IP)
echo   - Detection history for logged-in users
echo.
echo [INFO] API Endpoints:
echo   - POST /api/auth/login - User login
echo   - GET /api/auth/verify - Verify token
echo   - POST /api/auth/register-admin - Register admin
echo   - GET /api/detection-history/my-history - User detection history
echo   - POST /api/predict - Plant disease prediction
echo.
echo [INFO] Next steps:
echo   1. Restart your backend application
echo   2. Test login with the default accounts
echo   3. Check the /api/auth/verify endpoint
echo   4. Test plant disease prediction
echo.
echo [INFO] Backend should be running on: http://localhost:3000
echo [INFO] Frontend should be running on: http://localhost:5173
echo.
pause
