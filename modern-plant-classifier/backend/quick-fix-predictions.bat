@echo off
REM Quick Fix Predictions Table Script
REM Plant Disease Classification System

echo ========================================
echo Quick Fix Predictions Table
echo ========================================
echo.
echo This script will quickly fix the predictions table
echo by adding missing columns without dropping the table.
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

REM Step 1: Quick fix predictions table
echo [STEP 1] Applying quick fix to predictions table...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -f "quick-fix-predictions.sql"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to apply quick fix!
    pause
    exit /b 1
)
echo [SUCCESS] Quick fix applied successfully
echo.

REM Step 2: Verification
echo [STEP 2] Verifying table structure...
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -c "SELECT 'Verification Complete' as status; SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'predictions' ORDER BY ordinal_position;"
if %errorlevel% neq 0 (
    echo [ERROR] Verification failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Quick Fix Completed Successfully!
echo ========================================
echo.
echo [INFO] Missing columns have been added
echo [INFO] Table structure should now work with Sequelize
echo [INFO] Critical columns added:
echo   - is_real_ml (BOOLEAN)
echo   - image_filename (VARCHAR)
echo   - predicted_class (VARCHAR)
echo   - plant_type (VARCHAR)
echo   - disease_type (VARCHAR)
echo.
echo [INFO] Next steps:
echo   1. Restart your backend application
echo   2. Try the prediction again
echo   3. The column error should be resolved
echo.
pause
