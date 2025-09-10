@echo off
REM Update Environment Database Name Script
REM Plant Disease Classification System

echo ========================================
echo Update Environment Database Name
echo ========================================
echo.
echo This script will update the .env file
echo to use the correct database name.
echo.

REM Check if .env file exists
if exist ".env" (
    echo [INFO] .env file found, updating database name...
    
    REM Use PowerShell to replace text in .env file
    powershell -Command "(Get-Content '.env') -replace 'plant_classifier_dev', 'plant_disease_db' | Set-Content '.env'"
    
    if %errorlevel% equ 0 (
        echo [SUCCESS] .env file updated successfully!
        echo [INFO] Database name changed to plant_disease_db
    ) else (
        echo [ERROR] Failed to update .env file!
        pause
        exit /b 1
    )
) else (
    echo [INFO] .env file not found, creating new one...
    
    REM Create .env file with correct database name
    (
    echo # =====================================================
    echo # Plant Disease Classification System
    echo # Environment Configuration
    echo # =====================================================
    echo.
    echo # Server Configuration
    echo NODE_ENV=development
    echo PORT=3000
    echo HOST=localhost
    echo FRONTEND_URL=http://localhost:5173
    echo.
    echo # Session Configuration
    echo SESSION_SECRET=your-super-secret-session-key-change-this-in-production
    echo.
    echo # JWT Configuration
    echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
    echo JWT_EXPIRES_IN=24h
    echo.
    echo # Database Configuration
    echo DB_HOST=localhost
    echo DB_PORT=5432
    echo DB_NAME=plant_disease_db
    echo DB_USER=postgres
    echo DB_PASSWORD=admin123
    echo.
    echo # ML Model Configuration
    echo TFJS_MODEL_PATH=../../klasifikasi-tanaman/tfjs_model/model.json
    echo PYTHON_ML_PATH=../../klasifikasi-tanaman/python_ml_bridge.py
    echo MODEL_ACCURACY=86.12%%
    echo.
    echo # File Upload Configuration
    echo MAX_FILE_SIZE=10485760
    echo ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp
    echo UPLOAD_DIR=uploads
    echo.
    echo # Rate Limiting Configuration
    echo RATE_LIMIT_WINDOW_MS=900000
    echo RATE_LIMIT_MAX_REQUESTS=100
    echo.
    echo # Guest Detection Limits
    echo GUEST_MAX_DETECTIONS=2
    echo GUEST_RESET_HOURS=24
    echo.
    echo # Security Configuration
    echo BCRYPT_ROUNDS=10
    echo TOKEN_EXPIRES_IN=24h
    echo SESSION_MAX_AGE=86400000
    echo.
    echo # Logging Configuration
    echo LOG_LEVEL=info
    echo LOG_FILE=logs/app.log
    echo.
    echo # Development Configuration
    echo DEBUG=true
    echo VERBOSE_LOGGING=true
    echo ENABLE_CORS=true
    ) > .env
    
    echo [SUCCESS] .env file created with correct database name!
)

echo.
echo ========================================
echo Environment Update Complete
echo ========================================
echo.
echo [INFO] Database configuration updated
echo [INFO] All scripts now use plant_disease_db
echo.
echo [INFO] Next steps:
echo   1. Run fix-all-issues.bat
echo   2. Restart your backend application
echo   3. Test all functionality
echo.
pause
