@echo off
REM Database Setup Script for Plant Disease Classification System
REM PostgreSQL Database - Windows Batch File

echo ========================================
echo Plant Disease Classification Database Setup
echo ========================================
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
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d postgres -c "SELECT version();" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to PostgreSQL!
    echo Please make sure PostgreSQL is running and accessible.
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] PostgreSQL connection OK
echo.

REM Step 1: Create database
echo [STEP 1] Creating database %DB_NAME%...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d postgres -f "create-database.sql"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create database!
    pause
    exit /b 1
)
echo [SUCCESS] Database %DB_NAME% created
echo.

REM Step 2: Setup tables and data
echo [STEP 2] Setting up tables and sample data...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -f "fresh-database-setup.sql"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to setup tables and data!
    pause
    exit /b 1
)
echo [SUCCESS] Tables and data setup completed
echo.

REM Step 3: Verification
echo [STEP 3] Verifying database setup...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT 'Verification Complete' as status; SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
if %errorlevel% neq 0 (
    echo [ERROR] Verification failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Database Setup Completed Successfully!
echo ========================================
echo.
echo [INFO] Database: %DB_NAME%
echo [INFO] Admin User: admin/admin123
echo [INFO] Regular User: user1/user123
echo.
echo [INFO] You can now start the backend application
echo [INFO] The system will automatically connect to the database
echo.
pause
