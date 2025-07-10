#!/usr/bin/env python3
import sys
import os
import json
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from PIL import Image
import argparse

def load_classes(classes_path):
    """Load class names from JSON file"""
    try:
        with open(classes_path, 'r') as f:
            classes = json.load(f)
        return classes
    except Exception as e:
        print(f"Error loading classes: {e}", file=sys.stderr)
        return None

def preprocess_image(img_path, target_size=(224, 224)):
    """Preprocess image for prediction"""
    try:
        # Load and resize image
        img = Image.open(img_path)
        img = img.convert('RGB')  # Ensure RGB format
        img = img.resize(target_size)
        
        # Convert to array and normalize
        img_array = np.array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array.astype('float32') / 255.0
        
        return img_array
    except Exception as e:
        print(f"Error preprocessing image: {e}", file=sys.stderr)
        return None

def predict_image(model_path, classes_path, image_path):
    """Make prediction on image using loaded model"""
    try:
        # Load model and classes
        print(f"Loading model from: {model_path}", file=sys.stderr)
        model = load_model(model_path)
        
        print(f"Loading classes from: {classes_path}", file=sys.stderr)
        classes = load_classes(classes_path)
        
        if classes is None:
            return None
            
        # Preprocess image
        print(f"Preprocessing image: {image_path}", file=sys.stderr)
        img_array = preprocess_image(image_path)
        
        if img_array is None:
            return None
            
        # Make prediction
        print("Making prediction...", file=sys.stderr)
        predictions = model.predict(img_array, verbose=0)
        predicted_class_index = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_index])
        
        # Get class name
        predicted_class = classes.get(str(predicted_class_index), 'Unknown')
        
        # Create result
        result = {
            'success': True,
            'predicted_class': predicted_class,
            'predicted_class_index': int(predicted_class_index),
            'confidence': confidence,
            'all_probabilities': {
                classes[str(i)]: float(predictions[0][i]) 
                for i in range(len(predictions[0]))
                if str(i) in classes
            }
        }
        
        return result
        
    except Exception as e:
        print(f"Prediction error: {e}", file=sys.stderr)
        return {
            'success': False,
            'error': str(e)
        }

def main():
    parser = argparse.ArgumentParser(description='Plant Disease Classification')
    parser.add_argument('--model', required=True, help='Path to .h5 model file')
    parser.add_argument('--classes', required=True, help='Path to classes.json file')
    parser.add_argument('--image', required=True, help='Path to image file')
    
    args = parser.parse_args()
    
    # Make prediction
    result = predict_image(args.model, args.classes, args.image)
    
    # Output result as JSON
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main() 