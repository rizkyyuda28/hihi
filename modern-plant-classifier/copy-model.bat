@echo off
echo Copying TensorFlow.js model to standalone app...

REM Create tfjs_model directory in backend
mkdir "backend\tfjs_model" 2>nul

REM Copy model files
copy "..\tfjs_model\*" "backend\tfjs_model\"

echo Model copied successfully!
echo You can now move modern-plant-classifier to any location.
pause 