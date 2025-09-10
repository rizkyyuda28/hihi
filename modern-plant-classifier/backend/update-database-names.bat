@echo off
REM Update Database Names Script
REM Plant Disease Classification System

echo ========================================
echo Update Database Names
echo ========================================
echo.
echo This script will update all database names
echo from plant_classifier_dev to plant_disease_db
echo.

REM List of files to update
set FILES[0]=setup-database.bat
set FILES[1]=setup-login-system.bat
set FILES[2]=verify-guest-limits.bat
set FILES[3]=verify-login-integration.bat
set FILES[4]=start-login-system.bat
set FILES[5]=complete-login-setup.bat
set FILES[6]=check-login-files.bat
set FILES[7]=install-login-dependencies.bat
set FILES[8]=setup-environment.bat
set FILES[9]=verify-sequelize-config.js
set FILES[10]=test-login-system.js
set FILES[11]=test-guest-limits.js
set FILES[12]=test-validation-and-limits.js
set FILES[13]=test-login-endpoint.js

echo [INFO] Updating database names in all files...
echo.

set UPDATED_FILES=0
set TOTAL_FILES=14

for /L %%i in (0,1,13) do (
    set "FILE=!FILES[%%i]!"
    if exist "!FILE!" (
        echo [INFO] Updating !FILE!...
        
        REM Use PowerShell to replace text in file
        powershell -Command "(Get-Content '!FILE!') -replace 'plant_classifier_dev', 'plant_disease_db' | Set-Content '!FILE!'"
        
        if %errorlevel% equ 0 (
            echo [SUCCESS] !FILE! updated
            set /a UPDATED_FILES+=1
        ) else (
            echo [WARNING] Failed to update !FILE!
        )
    ) else (
        echo [INFO] !FILE! not found, skipping...
    )
)

echo.
echo ========================================
echo Database Names Update Summary
echo ========================================
echo.
echo Total files processed: %TOTAL_FILES%
echo Files updated: %UPDATED_FILES%
echo.

if %UPDATED_FILES% gtr 0 (
    echo [SUCCESS] Database names updated successfully!
    echo [INFO] All scripts now use plant_disease_db
    echo.
    echo [INFO] Next steps:
    echo   1. Run fix-all-issues.bat
    echo   2. Test all functionality
    echo   3. Verify database connection
) else (
    echo [WARNING] No files were updated!
    echo [INFO] Please check if files exist and try again
)

echo.
pause
