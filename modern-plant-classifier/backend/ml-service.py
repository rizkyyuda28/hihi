#!/usr/bin/env python3
"""
Machine Learning Service for Plant Disease Classification
This service runs as a separate Python process and communicates with Node.js backend
"""

import os
import sys
import json
import base64
import io
import numpy as np
from PIL import Image
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables for model
model = None
class_names = None
model_loaded = False

def load_model():
    """Load the TensorFlow model and class names"""
    global model, class_names, model_loaded
    
    try:
        # Path to the model files
        model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'klasifikasi-tanaman', 'tfjs_model')
        
        # Load class names
        classes_file = os.path.join(model_path, 'classes.json')
        with open(classes_file, 'r') as f:
            class_names = json.load(f)
        
        # Convert TensorFlow.js model to Keras format
        # For now, we'll use the original Keras model
        keras_model_path = os.path.join(model_path, '..', 'model-massive_16-80.51.h5')
        
        if os.path.exists(keras_model_path):
            model = tf.keras.models.load_model(keras_model_path)
            model_loaded = True
            logger.info(f"Model loaded successfully from {keras_model_path}")
            logger.info(f"Model input shape: {model.input_shape}")
            logger.info(f"Model output shape: {model.output_shape}")
            logger.info(f"Number of classes: {len(class_names)}")
        else:
            logger.error(f"Model file not found: {keras_model_path}")
            return False
            
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False
    
    return True

def preprocess_image(image_data, target_size=(224, 224)):
    """Preprocess image for model prediction"""
    try:
        # Decode base64 image
        if isinstance(image_data, str):
            # Remove data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
        else:
            image_bytes = image_data
        
        # Open image with PIL
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image
        image = image.resize(target_size)
        
        # Convert to numpy array and normalize
        image_array = np.array(image) / 255.0
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
        
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        return None

def predict_disease(image_data):
    """Predict plant disease from image"""
    global model, class_names, model_loaded
    
    if not model_loaded:
        return {
            'success': False,
            'error': 'Model not loaded'
        }
    
    try:
        # Preprocess image
        processed_image = preprocess_image(image_data)
        if processed_image is None:
            return {
                'success': False,
                'error': 'Failed to preprocess image'
            }
        
        # Make prediction
        predictions = model.predict(processed_image, verbose=0)
        prediction_scores = predictions[0]
        
        # Get top prediction
        predicted_class_idx = np.argmax(prediction_scores)
        confidence = float(prediction_scores[predicted_class_idx])
        
        # Get class name
        predicted_class = class_names[str(predicted_class_idx)]
        
        # Parse plant and disease from class name
        if 'healthy' in predicted_class.lower():
            plant_type = predicted_class.split(' ')[0]
            disease_name = 'Healthy'
            status = 'healthy'
        else:
            parts = predicted_class.split(' ', 1)
            plant_type = parts[0]
            disease_name = parts[1] if len(parts) > 1 else 'Unknown'
            status = 'diseased'
        
        # Get top 3 predictions
        top_indices = np.argsort(prediction_scores)[::-1][:3]
        top_predictions = []
        for idx in top_indices:
            top_predictions.append({
                'class': class_names[str(idx)],
                'confidence': float(prediction_scores[idx])
            })
        
        return {
            'success': True,
            'prediction': {
                'plant': plant_type,
                'disease': disease_name,
                'confidence': confidence,
                'status': status,
                'full_class': predicted_class
            },
            'top_predictions': top_predictions,
            'model_info': {
                'total_classes': len(class_names),
                'model_accuracy': '80.51%'
            }
        }
        
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        return {
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'service': 'ML Service',
        'model_loaded': model_loaded,
        'classes_count': len(class_names) if class_names else 0
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
        
        # Get image data
        image_data = data['image']
        
        # Make prediction
        result = predict_disease(image_data)
        
        return jsonify(result)
        
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
        'classes': class_names,
        'count': len(class_names) if class_names else 0
    })

if __name__ == '__main__':
    # Load model on startup
    logger.info("Starting ML Service...")
    
    if load_model():
        logger.info("ML Service started successfully")
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        logger.error("Failed to load model. Exiting...")
        sys.exit(1)
