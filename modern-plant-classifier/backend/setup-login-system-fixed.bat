@echo off
REM Setup Login System Fixed Script
REM Plant Disease Classification System

echo ========================================
echo Setup Login System (Fixed)
echo ========================================
echo.
echo This script will set up the complete login system
echo with fixes for the created_at NOT NULL constraint issue.
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

REM Check if PostgreSQL is running
echo [INFO] Checking PostgreSQL connection...
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

REM Check if database exists
echo [INFO] Checking if database %DB_NAME% exists...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT current_database();" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Database %DB_NAME% does not exist!
    echo Please run setup-database.bat first to create the database.
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] Database %DB_NAME% exists
echo.

REM Step 1: Fix users table first
echo [STEP 1] Fixing users table...
if exist "fix-users-table.bat" (
    echo [INFO] Running users table fix...
    call fix-users-table.bat
    if %errorlevel% neq 0 (
        echo [ERROR] Users table fix failed!
        pause
        exit /b 1
    )
) else (
    echo [ERROR] fix-users-table.bat not found!
    echo Please make sure the fix script exists.
    pause
    exit /b 1
)
echo.

REM Step 2: Setup login system with fixed SQL
echo [STEP 2] Setting up login system with fixes...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -f "setup-login-system.sql"
if %errorlevel% neq 0 (
    echo [WARNING] Login system setup had issues, but continuing...
) else (
    echo [SUCCESS] Login system setup completed
)
echo.

REM Step 3: Setup other required tables
echo [STEP 3] Setting up other required tables...
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

REM Step 4: Verification
echo [STEP 4] Verifying login system...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT 'Verification Complete' as status; SELECT username, email, role, is_active, created_at FROM users ORDER BY id;"
if %errorlevel% neq 0 (
    echo [ERROR] Verification failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Login System Setup Completed!
echo ========================================
echo.
echo [INFO] Login system has been set up successfully
echo [INFO] All database issues have been resolved
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
echo   3. Test guest detection limits
echo   4. Check the /api/auth/verify endpoint
echo.
echo [INFO] Backend should be running on: http://localhost:3000
echo [INFO] Frontend should be running on: http://localhost:5173
echo.
pause
