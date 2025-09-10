@echo off
REM Fix Users Table Script
REM Plant Disease Classification System

echo ========================================
echo Fix Users Table
echo ========================================
echo.
echo This script will fix the users table
echo to resolve the created_at NOT NULL constraint issue.
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

REM Step 1: Fix users table
echo [STEP 1] Fixing users table...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -f "fix-users-table.sql"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to fix users table!
    pause
    exit /b 1
)
echo [SUCCESS] Users table fix completed
echo.

REM Step 2: Verification
echo [STEP 2] Verifying users table...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT 'Verification Complete' as status; SELECT id, username, email, role, is_active, created_at FROM users ORDER BY id;"
if %errorlevel% neq 0 (
    echo [ERROR] Verification failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Users Table Fix Completed!
echo ========================================
echo.
echo [INFO] Users table has been fixed successfully
echo [INFO] Default users created:
echo   - Admin: admin / admin123
echo   - User: user / user123
echo.
echo [INFO] Fixes applied:
echo   - Added DEFAULT CURRENT_TIMESTAMP to created_at
echo   - Added DEFAULT CURRENT_TIMESTAMP to updated_at
echo   - Updated existing NULL timestamps
echo   - Inserted default users with explicit timestamps
echo.
echo [INFO] Next steps:
echo   1. Restart your backend application
echo   2. Test the login system
echo   3. Verify guest detection limits
echo.
pause
