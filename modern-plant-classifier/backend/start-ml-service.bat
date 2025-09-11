@echo off
echo Starting ML Service...
echo.

cd /d "%~dp0"

echo Installing Python dependencies...
pip install -r requirements-ml.txt

echo.
echo Starting ML Service on port 5000...
python ml-service.py

pause
