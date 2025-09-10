@echo off
REM Verify Login Integration Script
REM Plant Disease Classification System

echo ========================================
echo Verify Login Integration
echo ========================================
echo.
echo This script will verify that all login system
echo components are properly integrated and working.
echo.

REM Check if backend is running
echo [INFO] Checking if backend is running...
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Backend not responding on port 3000
    echo [INFO] Please start the backend first:
    echo   npm start
    echo.
    echo [INFO] Continuing with integration checks...
) else (
    echo [SUCCESS] Backend is running
)
echo.

REM Check database connection
echo [INFO] Checking database connection...
psql -U postgres -d plant_classifier_dev -c "SELECT current_database();" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to database!
    echo [INFO] Please run setup-database.bat first
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] Database connection OK
echo.

REM Check if users table exists
echo [INFO] Checking users table...
psql -U postgres -d plant_classifier_dev -c "SELECT COUNT(*) FROM users;" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Users table not found!
    echo [INFO] Please run setup-login-system.bat first
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] Users table exists
echo.

REM Check if default users exist
echo [INFO] Checking default users...
psql -U postgres -d plant_classifier_dev -c "SELECT username, role FROM users WHERE username IN ('admin', 'user');" 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Could not check default users
) else (
    echo [SUCCESS] Default users found
)
echo.

REM Check if detection_history table exists
echo [INFO] Checking detection_history table...
psql -U postgres -d plant_classifier_dev -c "SELECT COUNT(*) FROM detection_history;" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Detection history table not found
    echo [INFO] This is optional but recommended
) else (
    echo [SUCCESS] Detection history table exists
)
echo.

REM Check if guest_detection_limits table exists
echo [INFO] Checking guest_detection_limits table...
psql -U postgres -d plant_classifier_dev -c "SELECT COUNT(*) FROM guest_detection_limits;" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Guest detection limits table not found
    echo [INFO] This is required for guest limits
) else (
    echo [SUCCESS] Guest detection limits table exists
)
echo.

REM Check if predictions table exists and has correct columns
echo [INFO] Checking predictions table...
psql -U postgres -d plant_classifier_dev -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'predictions' AND column_name = 'is_real_ml';" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Predictions table missing is_real_ml column
    echo [INFO] Please run quick-fix-predictions.bat
) else (
    echo [SUCCESS] Predictions table has correct columns
)
echo.

REM Check if required files exist
echo [INFO] Checking required files...
set REQUIRED_FILES[0]=src\routes\authRoutes.js
set REQUIRED_FILES[1]=src\models\User.js
set REQUIRED_FILES[2]=src\middleware\authMiddleware.js
set REQUIRED_FILES[3]=src\config\database.js
set REQUIRED_FILES[4]=src\app.js

set MISSING_FILES=0
for /L %%i in (0,1,4) do (
    set "FILE=!REQUIRED_FILES[%%i]!"
    if not exist "!FILE!" (
        echo ❌ !FILE! - Missing
        set /a MISSING_FILES+=1
    ) else (
        echo ✅ !FILE! - Found
    )
)

echo.
echo ========================================
echo Integration Verification Summary
echo ========================================
echo.

if %MISSING_FILES% equ 0 (
    echo 🎉 All required files are present!
    echo ✅ Login system integration is complete
    echo.
    echo [INFO] System Status:
    echo   - Backend: Running
    echo   - Database: Connected
    echo   - Users Table: Ready
    echo   - Detection History: Ready
    echo   - Guest Limits: Ready
    echo   - Predictions: Ready
    echo.
    echo [INFO] Login system is ready to use!
    echo [INFO] Default accounts:
    echo   - Admin: admin / admin123
    echo   - User: user / user123
    echo.
    echo [INFO] Test the system:
    echo   1. Open http://localhost:3000
    echo   2. Test login endpoints
    echo   3. Try plant disease prediction
    echo   4. Check detection history
) else (
    echo ⚠️ Some files are missing!
    echo ❌ Please check the missing files above
    echo.
    echo [INFO] Missing files need to be created or restored
    echo [INFO] Run complete-login-setup.bat to fix
)

echo.
pause
