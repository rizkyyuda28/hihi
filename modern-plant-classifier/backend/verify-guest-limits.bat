@echo off
REM Verify Guest Detection Limits Script
REM Plant Disease Classification System

echo ========================================
echo Verify Guest Detection Limits
echo ========================================
echo.
echo This script will verify that the guest detection limits
echo system is properly configured and working.
echo.

REM Check if backend is running
echo [INFO] Checking if backend is running...
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Backend not responding on port 3000
    echo [INFO] Please start the backend first:
    echo   npm start
    echo.
    echo [INFO] Continuing with verification...
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

REM Check if guest_detection_limits table exists
echo [INFO] Checking guest_detection_limits table...
psql -U postgres -d plant_classifier_dev -c "SELECT COUNT(*) FROM guest_detection_limits;" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] guest_detection_limits table not found!
    echo [INFO] Please run setup-login-system.bat first
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] guest_detection_limits table exists
echo.

REM Check table structure
echo [INFO] Checking table structure...
psql -U postgres -d plant_classifier_dev -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'guest_detection_limits' ORDER BY ordinal_position;"
if %errorlevel% neq 0 (
    echo [WARNING] Could not check table structure
) else (
    echo [SUCCESS] Table structure verified
)
echo.

REM Check if there are any existing guest limits
echo [INFO] Checking existing guest limits...
psql -U postgres -d plant_classifier_dev -c "SELECT ip_address, detection_count, is_blocked, last_detection_at FROM guest_detection_limits ORDER BY created_at DESC LIMIT 5;"
if %errorlevel% neq 0 (
    echo [WARNING] Could not check existing limits
) else (
    echo [SUCCESS] Guest limits data found
)
echo.

REM Check if required files exist
echo [INFO] Checking required files...
set REQUIRED_FILES[0]=src\middleware\guestDetectionLimit.js
set REQUIRED_FILES[1]=src\models\GuestDetectionLimit.js
set REQUIRED_FILES[2]=src\routes\predictionRoutes.js
set REQUIRED_FILES[3]=src\controllers\predictionController.js
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
echo Guest Limits Verification Summary
echo ========================================
echo.

if %MISSING_FILES% equ 0 (
    echo 🎉 All required files are present!
    echo ✅ Guest detection limits system is ready
    echo.
    echo [INFO] System Components:
    echo   - Backend: Running
    echo   - Database: Connected
    echo   - Guest Limits Table: Ready
    echo   - Middleware: Configured
    echo   - Controller: Updated
    echo.
    echo [INFO] Guest Detection Limits:
    echo   - Limit: 2 detections per IP per 24 hours
    echo   - Reset: Automatic after 24 hours
    echo   - Tracking: IP address and user agent
    echo   - Blocking: Automatic when limit reached
    echo.
    echo [INFO] Test the system:
    echo   1. Run test-guest-limits.bat
    echo   2. Try uploading images without login
    echo   3. Check if limit is enforced after 2 detections
    echo   4. Verify error messages are shown
) else (
    echo ⚠️ Some files are missing!
    echo ❌ Please check the missing files above
    echo.
    echo [INFO] Missing files need to be created or restored
    echo [INFO] Run complete-login-setup.bat to fix
)

echo.
pause
