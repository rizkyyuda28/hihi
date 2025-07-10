#!/bin/bash

echo "🔄 Copying TensorFlow.js model to standalone app..."

# Create tfjs_model directory in backend
mkdir -p "backend/tfjs_model"

# Copy model files
cp -r "../tfjs_model/"* "backend/tfjs_model/"

echo "✅ Model copied successfully!"
echo "📦 You can now move modern-plant-classifier to any location."
echo ""
echo "Next steps:"
echo "1. Create backend/.env file (copy from backend/env.example)"
echo "2. Run: cd backend && npm install && npm run dev"
echo "3. Run: cd frontend && npm install && npm run dev" 