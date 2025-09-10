@echo off
echo Starting Backend Server...

echo.
echo Setting environment variables...
set NODE_ENV=development
set DEBUG=true
set VERBOSE_LOGGING=true

echo.
echo Starting backend on port 3000...
node src/app.js

echo.
echo Backend stopped.
pause
