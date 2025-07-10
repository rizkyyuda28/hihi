#!/usr/bin/env python3
"""
Manual model conversion from Keras H5 to TensorFlow.js
"""
import os
import tensorflow as tf
from tensorflow import keras
import json

def convert_keras_to_tfjs():
    """Convert Keras H5 model to TensorFlow.js format"""
    
    print("🚀 Starting model conversion...")
    
    # Load the existing Keras model
    model_path = './model/massive_16-massive_16-86.12.h5'
    print(f"📂 Loading model from: {model_path}")
    
    try:
        model = keras.models.load_model(model_path)
        print("✅ Model loaded successfully!")
        print(f"📊 Model summary:")
        model.summary()
        
        # Create output directory
        output_dir = './tfjs_model'
        os.makedirs(output_dir, exist_ok=True)
        
        # Save as SavedModel format first (required for TF.js)
        saved_model_path = './temp_saved_model'
        print(f"💾 Saving as SavedModel format...")
        model.save(saved_model_path, save_format='tf')
        
        # Manual conversion to TensorFlow.js format
        print("🔄 Converting to TensorFlow.js format...")
        
        # Save model architecture as JSON
        model_json = model.to_json()
        model_config = json.loads(model_json)
        
        # Create model.json with TF.js format
        tfjs_model = {
            "format": "layers-model",
            "generatedBy": "keras v" + keras.__version__,
            "convertedBy": "manual conversion",
            "modelTopology": model_config,
            "weightsManifest": [
                {
                    "paths": ["weights.bin"],
                    "weights": []
                }
            ]
        }
        
        # Extract weights
        weights = []
        weight_data = []
        
        for layer in model.layers:
            layer_weights = layer.get_weights()
            for i, weight in enumerate(layer_weights):
                weight_info = {
                    "name": f"{layer.name}/{['kernel', 'bias'][i] if i < 2 else f'weight_{i}'}",
                    "shape": list(weight.shape),
                    "dtype": "float32"
                }
                weights.append(weight_info)
                weight_data.extend(weight.flatten().astype('float32'))
        
        tfjs_model["weightsManifest"][0]["weights"] = weights
        
        # Save model.json
        with open(os.path.join(output_dir, 'model.json'), 'w') as f:
            json.dump(tfjs_model, f, indent=2)
        
        # Save weights.bin
        import numpy as np
        weight_array = np.array(weight_data, dtype=np.float32)
        with open(os.path.join(output_dir, 'weights.bin'), 'wb') as f:
            f.write(weight_array.tobytes())
        
        print(f"✅ Model converted successfully!")
        print(f"📁 Output saved to: {output_dir}")
        print(f"📄 Files created:")
        print(f"   - model.json ({os.path.getsize(os.path.join(output_dir, 'model.json'))} bytes)")
        print(f"   - weights.bin ({os.path.getsize(os.path.join(output_dir, 'weights.bin'))} bytes)")
        
        # Clean up temp files
        import shutil
        if os.path.exists(saved_model_path):
            shutil.rmtree(saved_model_path)
        
        # Create class mapping file
        class_mapping = {
            0: 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
            1: 'Corn_(maize)___Common_rust_',
            2: 'Corn_(maize)___Northern_Leaf_Blight',
            3: 'Corn_(maize)___healthy',
            4: 'Potato___Early_blight',
            5: 'Potato___Late_blight',
            6: 'Potato___healthy',
            7: 'Tomato___Bacterial_spot',
            8: 'Tomato___Early_blight',
            9: 'Tomato___Late_blight',
            10: 'Tomato___Leaf_Mold',
            11: 'Tomato___Septoria_leaf_spot',
            12: 'Tomato___Spider_mites Two-spotted_spider_mite',
            13: 'Tomato___Target_Spot',
            14: 'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
            15: 'Tomato___Tomato_mosaic_virus',
            16: 'Tomato___healthy'
        }
        
        with open(os.path.join(output_dir, 'classes.json'), 'w') as f:
            json.dump(class_mapping, f, indent=2)
        
        print("📋 Class mapping saved to classes.json")
        print("🎉 Conversion completed successfully!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during conversion: {str(e)}")
        return False

if __name__ == "__main__":
    success = convert_keras_to_tfjs()
    if success:
        print("\n🎯 Next steps:")
        print("1. Test the converted model with Node.js")
        print("2. Setup your new backend stack")
        print("3. Deploy to your preferred hosting platform")
    else:
        print("\n💡 Consider using alternative conversion methods or ONNX format") 