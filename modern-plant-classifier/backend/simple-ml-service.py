#!/usr/bin/env python3
"""
Simple ML Service for Plant Disease Classification
Fallback service that provides mock predictions
"""

import json
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Mock class names based on the dataset
CLASS_NAMES = {
    "0": "Corn Cercospora leaf spot",
    "1": "Corn Common rust", 
    "2": "Corn Northern Leaf Blight",
    "3": "Corn healthy",
    "4": "Potato Early blight",
    "5": "Potato Late blight",
    "6": "Potato healthy",
    "7": "Tomato Bacterial spot",
    "8": "Tomato Early blight",
    "9": "Tomato Late blight",
    "10": "Tomato Leaf Mold",
    "11": "Tomato Septoria leaf spot",
    "12": "Tomato Spider mites",
    "13": "Tomato Target Spot",
    "14": "Tomato Yellow Leaf Curl Virus",
    "15": "Tomato mosaic virus",
    "16": "Tomato healthy"
}

def get_mock_prediction():
    """Generate a mock prediction"""
    # Randomly select a class
    class_idx = str(random.randint(0, len(CLASS_NAMES) - 1))
    predicted_class = CLASS_NAMES[class_idx]
    
    # Parse plant and disease
    if 'healthy' in predicted_class.lower():
        plant_type = predicted_class.split(' ')[0]
        disease_name = 'Healthy'
        status = 'healthy'
    else:
        parts = predicted_class.split(' ', 1)
        plant_type = parts[0]
        disease_name = parts[1] if len(parts) > 1 else 'Unknown'
        status = 'diseased'
    
    # Generate confidence (higher for healthy plants)
    if status == 'healthy':
        confidence = 0.85 + random.random() * 0.1  # 0.85-0.95
    else:
        confidence = 0.70 + random.random() * 0.25  # 0.70-0.95
    
    # Generate top 3 predictions
    top_predictions = []
    used_classes = {class_idx}
    
    # Add the main prediction
    top_predictions.append({
        'class': predicted_class,
        'confidence': confidence
    })
    
    # Add 2 more random predictions
    for _ in range(2):
        while True:
            idx = str(random.randint(0, len(CLASS_NAMES) - 1))
            if idx not in used_classes:
                used_classes.add(idx)
                top_predictions.append({
                    'class': CLASS_NAMES[idx],
                    'confidence': random.random() * 0.3  # Lower confidence
                })
                break
    
    return {
        'plant': plant_type,
        'disease': disease_name,
        'confidence': confidence,
        'status': status,
        'full_class': predicted_class,
        'top_predictions': top_predictions
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'service': 'Simple ML Service (Mock)',
        'model_loaded': True,
        'classes_count': len(CLASS_NAMES)
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict plant disease endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'No image data provided'
            }), 400
        
        # Generate mock prediction
        prediction = get_mock_prediction()
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'top_predictions': prediction['top_predictions'],
            'model_info': {
                'total_classes': len(CLASS_NAMES),
                'model_accuracy': 'Mock Mode'
            }
        })
        
    except Exception as e:
        logger.error(f"Error in predict endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/classes', methods=['GET'])
def get_classes():
    """Get available classes"""
    return jsonify({
        'success': True,
        'classes': CLASS_NAMES,
        'count': len(CLASS_NAMES)
    })

if __name__ == '__main__':
    logger.info("Starting Simple ML Service (Mock Mode)...")
    logger.info(f"Available classes: {len(CLASS_NAMES)}")
    try:
        app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
    except Exception as e:
        logger.error(f"Error starting server: {e}")
        print(f"Error: {e}")
