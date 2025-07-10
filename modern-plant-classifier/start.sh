#!/bin/bash

echo "🌱 Starting Modern Plant Disease Classification System"
echo ""

echo "⚡ Starting Backend (Node.js + Express)..."
cd backend
npm run dev &
BACKEND_PID=$!

sleep 3

echo "🌐 Starting Frontend (React + Vite)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ System is starting up!"
echo "📡 Backend will run on: http://localhost:3000"
echo "🌐 Frontend will run on: http://localhost:5173"
echo ""
echo "📝 Note: If TensorFlow.js installation failed, the system will use"
echo "   fallback mode with mock predictions for demonstration."
echo ""
echo "🔧 To install TensorFlow.js properly:"
echo "   npm install (should work on Linux/Mac)"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 