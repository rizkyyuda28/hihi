@echo off
REM Setup Login System Script
REM Plant Disease Classification System

echo ========================================
echo Setup Login System
echo ========================================
echo.
echo This script will set up the complete login system
echo including users table, default admin/user accounts,
echo and all necessary database structures.
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

REM Step 1: Setup login system
echo [STEP 1] Setting up login system...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -f "setup-login-system.sql"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to setup login system!
    pause
    exit /b 1
)
echo [SUCCESS] Login system setup completed
echo.

REM Step 2: Verification
echo [STEP 2] Verifying login system...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT 'Verification Complete' as status; SELECT username, email, role, is_active FROM users ORDER BY id;"
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
echo.
echo [INFO] API Endpoints:
echo   - POST /api/auth/login - User login
echo   - GET /api/auth/verify - Verify token
echo   - POST /api/auth/register-admin - Register admin
echo.
echo [INFO] Next steps:
echo   1. Restart your backend application
echo   2. Test login with the default accounts
echo   3. Check the /api/auth/verify endpoint
echo.
pause
