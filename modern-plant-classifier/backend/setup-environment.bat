@echo off
REM Setup Environment Variables Script
REM Plant Disease Classification System

echo ========================================
echo Setup Environment Variables
echo ========================================
echo.
echo This script will create and configure
echo the environment variables for the login system.
echo.

REM Check if .env file exists
if exist ".env" (
    echo [INFO] .env file already exists
    echo [INFO] Backing up existing .env to .env.backup
    copy .env .env.backup >nul 2>&1
    echo [SUCCESS] Backup created
) else (
    echo [INFO] .env file not found, creating new one
)

echo.
echo [INFO] Creating .env file with login system configuration...
echo.

REM Create .env file
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
echo DB_NAME=plant_classifier_dev
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
echo.
echo # Production Configuration (uncomment for production)
echo # NODE_ENV=production
echo # SESSION_SECRET=your-production-session-secret
echo # JWT_SECRET=your-production-jwt-secret
echo # DB_PASSWORD=your-production-db-password
echo # DEBUG=false
echo # VERBOSE_LOGGING=false
) > .env

echo [SUCCESS] .env file created successfully
echo.

REM Check if config.env exists
if exist "config.env" (
    echo [INFO] config.env file found
    echo [INFO] You can also use config.env as a reference
) else (
    echo [INFO] config.env file not found
    echo [INFO] Using default configuration
)

echo.
echo ========================================
echo Environment Setup Complete
echo ========================================
echo.
echo [INFO] Environment variables have been configured
echo [INFO] Default values set for development
echo.
echo [INFO] Important variables:
echo   - NODE_ENV: development
echo   - PORT: 3000
echo   - DB_NAME: plant_classifier_dev
echo   - DB_USER: postgres
echo   - DB_PASSWORD: admin123
echo   - JWT_SECRET: your-super-secret-jwt-key-change-this-in-production
echo   - SESSION_SECRET: your-super-secret-session-key-change-this-in-production
echo.
echo [WARNING] Security Notes:
echo   - Change JWT_SECRET in production
echo   - Change SESSION_SECRET in production
echo   - Use strong passwords in production
echo   - Enable HTTPS in production
echo.
echo [INFO] Next steps:
echo   1. Review the .env file
echo   2. Modify values if needed
echo   3. Run complete-login-setup.bat
echo   4. Restart your backend
echo.
pause
