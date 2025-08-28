@echo off
REM Fix Predictions Table Script V2 for Plant Disease Classification System
REM PostgreSQL Database - Windows Batch File - Sequelize underscored: true

echo ========================================
echo Fix Predictions Table V2 - Plant Disease Classification
echo ========================================
echo.
echo This script fixes the predictions table for Sequelize underscored: true
echo Column names will be: image_filename, predicted_class, plant_type, is_real_ml
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

REM Step 1: Fix predictions table
echo [STEP 1] Fixing predictions table structure for Sequelize underscored: true...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -f "fix-predictions-table-v2.sql"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to fix predictions table!
    pause
    exit /b 1
)
echo [SUCCESS] Predictions table fixed for Sequelize underscored: true
echo.

REM Step 2: Verification
echo [STEP 2] Verifying table structure...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT 'Verification Complete' as status; SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'predictions'; SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'predictions' ORDER BY ordinal_position;"
if %errorlevel% neq 0 (
    echo [ERROR] Verification failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Predictions Table Fixed Successfully V2!
echo ========================================
echo.
echo [INFO] Table structure now matches Sequelize model with underscored: true
echo [INFO] Column names: image_filename, predicted_class, plant_type, is_real_ml
echo [INFO] All required indexes created
echo [INFO] Sample data inserted for testing
echo.
echo [INFO] Sequelize config updated: underscored: true
echo [INFO] You can now start the backend application
echo [INFO] The system will connect to the database without column name errors
echo.
pause
