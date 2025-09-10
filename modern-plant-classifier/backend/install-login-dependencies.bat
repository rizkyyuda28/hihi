@echo off
REM Install Login Dependencies Script
REM Plant Disease Classification System

echo ========================================
echo Install Login Dependencies
echo ========================================
echo.
echo This script will install all required dependencies
echo for the login system to work properly.
echo.

REM Check if Node.js is available
echo [INFO] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js and try again.
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] Node.js found
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo Please make sure you're in the correct directory.
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] package.json found
echo.

REM Required dependencies for login system
set DEPENDENCIES[0]=express
set DEPENDENCIES[1]=cors
set DEPENDENCIES[2]=helmet
set DEPENDENCIES[3]=morgan
set DEPENDENCIES[4]=compression
set DEPENDENCIES[5]=express-rate-limit
set DEPENDENCIES[6]=express-session
set DEPENDENCIES[7]=sequelize
set DEPENDENCIES[8]=pg
set DEPENDENCIES[9]=pg-hstore
set DEPENDENCIES[10]=bcryptjs
set DEPENDENCIES[11]=jsonwebtoken
set DEPENDENCIES[12]=multer
set DEPENDENCIES[13]=dotenv
set DEPENDENCIES[14]=axios

echo [INFO] Installing required dependencies...
echo.

REM Install each dependency
for /L %%i in (0,1,14) do (
    set "DEP=!DEPENDENCIES[%%i]!"
    echo Installing !DEP!...
    npm install !DEP! --save
    if %errorlevel% neq 0 (
        echo [WARNING] Failed to install !DEP!
    ) else (
        echo [SUCCESS] !DEP! installed
    )
    echo.
)

echo [INFO] Installing development dependencies...
echo.

REM Development dependencies
set DEV_DEPENDENCIES[0]=nodemon
set DEV_DEPENDENCIES[1]=jest
set DEV_DEPENDENCIES[2]=supertest

for /L %%i in (0,1,2) do (
    set "DEP=!DEV_DEPENDENCIES[%%i]!"
    echo Installing !DEP! (dev dependency)...
    npm install !DEP! --save-dev
    if %errorlevel% neq 0 (
        echo [WARNING] Failed to install !DEP!
    ) else (
        echo [SUCCESS] !DEP! installed
    )
    echo.
)

echo ========================================
echo Dependencies Installation Complete
echo ========================================
echo.
echo [INFO] All required dependencies have been installed
echo [INFO] Login system should now work properly
echo.
echo [INFO] Installed packages:
echo   - express (web framework)
echo   - cors (cross-origin resource sharing)
echo   - helmet (security headers)
echo   - morgan (logging)
echo   - compression (response compression)
echo   - express-rate-limit (rate limiting)
echo   - express-session (session management)
echo   - sequelize (ORM)
echo   - pg (PostgreSQL driver)
echo   - pg-hstore (PostgreSQL hstore support)
echo   - bcryptjs (password hashing)
echo   - jsonwebtoken (JWT tokens)
echo   - multer (file uploads)
echo   - dotenv (environment variables)
echo   - axios (HTTP client)
echo.
echo [INFO] Next steps:
echo   1. Run complete-login-setup.bat
echo   2. Restart your backend
echo   3. Test the login system
echo.
pause
