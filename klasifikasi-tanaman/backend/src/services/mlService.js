/**
 * Machine Learning Service
 * Handles TensorFlow.js model loading and predictions
 */

const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../config');

class MLService {
  constructor() {
    this.model = null;
    this.classes = null;
    this.isModelLoaded = false;
    this.loadingPromise = null;
  }

  /**
   * Initialize the ML service by loading model and classes
   */
  async initialize() {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this._loadModel();
    return this.loadingPromise;
  }

  /**
   * Load TensorFlow.js model and class mappings
   * @private
   */
  async _loadModel() {
    try {
      console.log('🤖 Loading TensorFlow.js model...');
      
      // Check if model files exist
      const modelPath = path.resolve(config.MODEL_PATH);
      const classesPath = path.resolve(config.CLASSES_PATH);
      
      if (!await this._fileExists(modelPath)) {
        throw new Error(`Model file not found at: ${modelPath}`);
      }
      
      if (!await this._fileExists(classesPath)) {
        throw new Error(`Classes file not found at: ${classesPath}`);
      }

      // Load model
      this.model = await tf.loadLayersModel(`file://${modelPath}`);
      console.log('✅ TensorFlow.js model loaded successfully');

      // Load class mappings
      const classesData = await fs.readFile(classesPath, 'utf-8');
      this.classes = JSON.parse(classesData);
      console.log(`✅ Loaded ${Object.keys(this.classes).length} plant disease classes`);

      // Warm up the model with a dummy prediction
      await this._warmUpModel();

      this.isModelLoaded = true;
      console.log('🎯 ML Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load ML model:', error.message);
      throw new Error(`Model loading failed: ${error.message}`);
    }
  }

  /**
   * Warm up the model by running a dummy prediction
   * @private
   */
  async _warmUpModel() {
    try {
      const dummyInput = tf.zeros([1, ...config.MODEL_CONFIG.inputShape]);
      const prediction = this.model.predict(dummyInput);
      prediction.dispose();
      dummyInput.dispose();
      console.log('🔥 Model warmed up successfully');
    } catch (error) {
      console.warn('⚠️ Model warm-up failed:', error.message);
    }
  }

  /**
   * Check if file exists
   * @private
   */
  async _fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Preprocess image for model prediction
   * @param {Buffer} imageBuffer - Raw image buffer
   * @returns {tf.Tensor} Preprocessed image tensor
   */
  async preprocessImage(imageBuffer) {
    try {
      // Resize and normalize image using Sharp
      const processedBuffer = await sharp(imageBuffer)
        .resize(config.MODEL_CONFIG.imageSize, config.MODEL_CONFIG.imageSize)
        .removeAlpha() // Remove alpha channel if present
        .raw()
        .toBuffer();

      // Convert to tensor
      const imageTensor = tf.tensor3d(
        new Uint8Array(processedBuffer), 
        [config.MODEL_CONFIG.imageSize, config.MODEL_CONFIG.imageSize, 3]
      );

      // Normalize pixel values to [0, 1] and add batch dimension
      const normalizedTensor = imageTensor
        .expandDims(0)
        .div(255.0);

      // Clean up intermediate tensor
      imageTensor.dispose();

      return normalizedTensor;
    } catch (error) {
      throw new Error(`Image preprocessing failed: ${error.message}`);
    }
  }

  /**
   * Make prediction on preprocessed image
   * @param {Buffer} imageBuffer - Raw image buffer
   * @returns {Promise<Object>} Prediction results
   */
  async predict(imageBuffer) {
    try {
      // Check if model is loaded
      if (!this.isModelLoaded) {
        await this.initialize();
      }

      // Validate input
      if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
        throw new Error('Invalid image buffer provided');
      }

      // Preprocess image
      const preprocessedImage = await this.preprocessImage(imageBuffer);

      // Make prediction
      const prediction = this.model.predict(preprocessedImage);
      
      // Get prediction data
      const probabilities = await prediction.data();
      const probabilitiesArray = Array.from(probabilities);
      
      // Find predicted class
      const predictedClassIndex = probabilitiesArray.indexOf(Math.max(...probabilitiesArray));
      const confidence = probabilitiesArray[predictedClassIndex];
      
      // Get class name
      const predictedClass = this.classes[predictedClassIndex.toString()];
      
      // Get top 3 predictions
      const topPredictions = this._getTopPredictions(probabilitiesArray, 3);
      
      // Clean up tensors
      preprocessedImage.dispose();
      prediction.dispose();

      return {
        success: true,
        prediction: {
          class: predictedClass,
          classIndex: predictedClassIndex,
          confidence: parseFloat(confidence.toFixed(4)),
          confidencePercentage: parseFloat((confidence * 100).toFixed(2)),
          topPredictions: topPredictions,
          processingTime: Date.now()
        }
      };

    } catch (error) {
      console.error('❌ Prediction error:', error.message);
      throw new Error(`Prediction failed: ${error.message}`);
    }
  }

  /**
   * Get top N predictions with confidence scores
   * @private
   */
  _getTopPredictions(probabilities, topN = 3) {
    const indexed = probabilities.map((prob, index) => ({ index, prob }));
    const sorted = indexed.sort((a, b) => b.prob - a.prob);
    
    return sorted.slice(0, topN).map(item => ({
      class: this.classes[item.index.toString()],
      classIndex: item.index,
      confidence: parseFloat(item.prob.toFixed(4)),
      confidencePercentage: parseFloat((item.prob * 100).toFixed(2))
    }));
  }

  /**
   * Get model information
   */
  getModelInfo() {
    if (!this.isModelLoaded) {
      return { loaded: false, message: 'Model not loaded' };
    }

    return {
      loaded: true,
      inputShape: config.MODEL_CONFIG.inputShape,
      outputClasses: config.MODEL_CONFIG.outputClasses,
      totalClasses: Object.keys(this.classes).length,
      classes: this.classes
    };
  }

  /**
   * Health check for the ML service
   */
  async healthCheck() {
    try {
      if (!this.isModelLoaded) {
        return { status: 'unhealthy', message: 'Model not loaded' };
      }

      // Test with dummy data
      const dummyBuffer = Buffer.alloc(224 * 224 * 3, 128); // Gray image
      const result = await this.predict(dummyBuffer);
      
      return { 
        status: 'healthy', 
        message: 'ML service is working correctly',
        testPrediction: result.prediction.class
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        message: `Health check failed: ${error.message}` 
      };
    }
  }

  /**
   * Cleanup resources
   */
  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isModelLoaded = false;
    console.log('🧹 ML Service disposed');
  }
}

// Export singleton instance
module.exports = new MLService(); 