@echo off
REM Check Login Files Script
REM Plant Disease Classification System

echo ========================================
echo Check Login Files
echo ========================================
echo.
echo This script will check if all required files
echo for the login system are present and correct.
echo.

REM Required files list
set FILES[0]=src\routes\authRoutes.js
set FILES[1]=src\models\User.js
set FILES[2]=src\middleware\authMiddleware.js
set FILES[3]=src\middleware\guestDetectionLimit.js
set FILES[4]=src\routes\detectionHistoryRoutes.js
set FILES[5]=src\models\DetectionHistory.js
set FILES[6]=src\models\GuestDetectionLimit.js
set FILES[7]=src\config\database.js
set FILES[8]=src\app.js
set FILES[9]=setup-login-system.sql
set FILES[10]=setup-login-system.bat
set FILES[11]=test-login-system.js
set FILES[12]=test-login-system.bat
set FILES[13]=complete-login-setup.bat
set FILES[14]=LOGIN_SYSTEM_README.md

REM Check each file
set MISSING_FILES=0
set TOTAL_FILES=15

echo [INFO] Checking required files...
echo.

for /L %%i in (0,1,14) do (
    set "FILE=!FILES[%%i]!"
    if exist "!FILE!" (
        echo ✅ !FILE! - Found
    ) else (
        echo ❌ !FILE! - Missing
        set /a MISSING_FILES+=1
    )
)

echo.
echo ========================================
echo File Check Summary
echo ========================================
echo.
echo Total files checked: %TOTAL_FILES%
echo Missing files: %MISSING_FILES%
echo.

if %MISSING_FILES% equ 0 (
    echo 🎉 All required files are present!
    echo ✅ Login system is ready to use
    echo.
    echo [INFO] Next steps:
    echo   1. Run complete-login-setup.bat
    echo   2. Restart your backend
    echo   3. Test the login system
) else (
    echo ⚠️ Some files are missing!
    echo ❌ Please check the missing files above
    echo.
    echo [INFO] Missing files need to be created or restored
)

echo.
pause
