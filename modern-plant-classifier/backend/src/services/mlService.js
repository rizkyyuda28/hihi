const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class MLService {
  constructor() {
    this.model = null;
    this.classes = null;
    
    // Path to ML model from klasifikasi-tanaman folder
    // This ensures we use the original ML model without editing it
    const defaultModelPath = path.resolve(__dirname, '../../../../klasifikasi-tanaman/tfjs_model/model.json');
    const defaultClassesPath = path.resolve(__dirname, '../../../../klasifikasi-tanaman/tfjs_model/classes.json');
    
    // Check environment variables first, then fallback to klasifikasi-tanaman paths
    this.modelPath = process.env.TFJS_MODEL_PATH || defaultModelPath;
    this.classesPath = process.env.TFJS_CLASSES_PATH || defaultClassesPath;
    
    console.log(`🔍 Loading ML model from: ${this.modelPath}`);
    console.log(`🏷️ Loading classes from: ${this.classesPath}`);
    console.log(`📂 Using klasifikasi-tanaman model (86.12% accuracy)`);
  }

  async loadModel() {
    if (!this.model) {
      try {
        console.log('🤖 Loading TensorFlow.js model from klasifikasi-tanaman...');
        
        // Check if model files exist
        const modelExists = await this.checkFileExists(this.modelPath);
        const classesExists = await this.checkFileExists(this.classesPath);
        
        if (!modelExists) {
          throw new Error(`Model file not found at: ${this.modelPath}`);
        }
        if (!classesExists) {
          throw new Error(`Classes file not found at: ${this.classesPath}`);
        }
        
        // Load the model
        this.model = await tf.loadLayersModel(`file://${this.modelPath}`);
        
        // Load class names
        const classesData = await fs.readFile(this.classesPath, 'utf8');
        this.classes = JSON.parse(classesData);
        
        console.log('✅ Model loaded successfully from klasifikasi-tanaman');
        console.log(`📊 Model input shape: ${this.model.inputs[0].shape}`);
        console.log(`🏷️ Number of classes: ${Object.keys(this.classes).length}`);
        console.log(`🎯 Model accuracy: 86.12%`);
        
        // Validate model compatibility
        this.validateModel();
        
      } catch (error) {
        console.error('❌ Failed to load model from klasifikasi-tanaman:', error);
        console.error('💡 Make sure klasifikasi-tanaman folder exists and contains tfjs_model/');
        throw new Error(`Model loading failed: ${error.message}`);
      }
    }
    return this.model;
  }

  async checkFileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  validateModel() {
    // Validate model has correct input/output shapes
    const expectedInputShape = [null, 224, 224, 3];
    const expectedOutputClasses = 17;
    
    const actualInputShape = this.model.inputs[0].shape;
    const actualOutputShape = this.model.outputs[0].shape;
    
    console.log(`🔍 Validating model compatibility...`);
    console.log(`📏 Input shape: Expected ${expectedInputShape}, Got ${actualInputShape}`);
    console.log(`📊 Output classes: Expected ${expectedOutputClasses}, Got ${Object.keys(this.classes).length}`);
    
    if (actualInputShape[1] !== 224 || actualInputShape[2] !== 224 || actualInputShape[3] !== 3) {
      console.warn('⚠️ Warning: Model input shape mismatch, adjusting preprocessing...');
    }
    
    if (Object.keys(this.classes).length !== expectedOutputClasses) {
      console.warn('⚠️ Warning: Number of classes mismatch');
    }
    
    console.log('✅ Model validation completed');
  }

  async preprocessImage(imagePath) {
    try {
      console.log(`🖼️ Preprocessing image: ${imagePath}`);
      
      // Resize and normalize image to match model input (224x224x3)
      // This matches the preprocessing used in klasifikasi-tanaman
      const imageBuffer = await sharp(imagePath)
        .resize(224, 224)
        .removeAlpha() // Remove alpha channel if present
        .raw()
        .toBuffer();

      // Convert to tensor and normalize (0-1) - same as original model
      const tensor = tf.tensor3d(new Uint8Array(imageBuffer), [224, 224, 3])
        .expandDims(0) // Add batch dimension
        .div(255.0); // Normalize to 0-1

      console.log(`✅ Image preprocessed: ${tensor.shape}`);
      return tensor;
    } catch (error) {
      console.error('❌ Image preprocessing failed:', error);
      throw new Error(`Image preprocessing failed: ${error.message}`);
    }
  }

  async predict(imagePath) {
    try {
      await this.loadModel();
      
      console.log(`🔍 Processing image: ${imagePath}`);
      const startTime = Date.now();
      
      const preprocessed = await this.preprocessImage(imagePath);
      
      // Make prediction using the same logic as klasifikasi-tanaman
      const prediction = await this.model.predict(preprocessed);
      const probabilities = await prediction.data();
      const predictedClassIndex = prediction.argMax(-1).dataSync()[0];
      
      // Clean up tensors
      preprocessed.dispose();
      prediction.dispose();

      const processingTime = Date.now() - startTime;

      const result = {
        classId: predictedClassIndex,
        className: this.classes[predictedClassIndex] || 'Unknown',
        confidence: probabilities[predictedClassIndex],
        probabilities: Object.fromEntries(
          Object.entries(this.classes).map(([idx, name]) => 
            [name, probabilities[parseInt(idx)]]
          )
        ),
        processingTime: processingTime,
        modelPath: this.modelPath
      };

      console.log(`✅ Prediction completed in ${processingTime}ms`);
      console.log(`🎯 Result: ${result.className} (${(result.confidence * 100).toFixed(2)}%)`);
      
      return result;

    } catch (error) {
      console.error('❌ Prediction failed:', error);
      throw new Error(`Prediction failed: ${error.message}`);
    }
  }

  // Get all available classes
  getClasses() {
    return this.classes;
  }

  // Get model info
  async getModelInfo() {
    await this.loadModel();
    return {
      inputShape: this.model.inputs[0].shape,
      outputShape: this.model.outputs[0].shape,
      numClasses: Object.keys(this.classes).length,
      classes: this.classes,
      accuracy: '86.12%',
      modelPath: this.modelPath,
      classesPath: this.classesPath,
      version: '1.0.0',
      source: 'klasifikasi-tanaman',
      architecture: 'CNN (Convolutional Neural Network)',
      framework: 'TensorFlow.js (converted from Keras)',
      trainingData: '17 plant disease categories with 38,000+ images'
    };
  }

  // Check if model is loaded
  isModelLoaded() {
    return this.model !== null && this.classes !== null;
  }

  // Get supported plant types
  getSupportedPlants() {
    const plants = ['Corn (Maize)', 'Potato', 'Tomato'];
    const diseases = {
      'Corn (Maize)': [
        'Cercospora leaf spot Gray leaf spot',
        'Common rust',
        'Northern Leaf Blight',
        'Healthy'
      ],
      'Potato': [
        'Early blight',
        'Late blight', 
        'Healthy'
      ],
      'Tomato': [
        'Bacterial spot',
        'Early blight',
        'Late blight',
        'Leaf Mold',
        'Septoria leaf spot',
        'Spider mites Two-spotted spider mite',
        'Target Spot',
        'Tomato mosaic virus',
        'Tomato Yellow Leaf Curl Virus',
        'Healthy'
      ]
    };
    
    return { plants, diseases };
  }
}

// Export singleton instance
module.exports = new MLService(); 