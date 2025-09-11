#!/bin/bash
echo "Starting ML Service..."
echo

cd "$(dirname "$0")"

echo "Installing Python dependencies..."
pip install -r requirements-ml.txt

echo
echo "Starting ML Service on port 5000..."
python3 ml-service.py
