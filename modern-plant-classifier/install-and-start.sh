#!/bin/bash

echo "🌱 Installing and Starting Modern Plant Disease Classification System"
echo ""

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ All dependencies installed!"
echo ""

echo "🚀 Starting the system..."
echo "📡 Backend will run on: http://localhost:3000"
echo "🌐 Frontend will run on: http://localhost:5173"
echo ""

npm start
