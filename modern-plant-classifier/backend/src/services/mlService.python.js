const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class MLServicePython {
  constructor() {
    this.model = null;
    this.classes = null;
    this.loaded = false;
    
    // Paths to klasifikasi-tanaman model files
    this.modelPath = path.resolve(__dirname, '../../../../klasifikasi-tanaman/model/massive_16-massive_16-86.12.h5');
    this.classesPath = path.resolve(__dirname, '../../../../klasifikasi-tanaman/tfjs_model/classes.json');
    this.pythonScript = path.resolve(__dirname, '../../../python_ml_bridge.py');
    
    console.log('🐍 Python ML Service initialized');
    console.log(`📊 Model: ${this.modelPath}`);
    console.log(`🏷️ Classes: ${this.classesPath}`);
    console.log(`🔧 Python Script: ${this.pythonScript}`);
  }

  async loadModel() {
    if (!this.loaded) {
      try {
        console.log('🤖 Loading Python ML Service...');
        
        // Check if files exist
        const modelExists = await this.checkFileExists(this.modelPath);
        const classesExists = await this.checkFileExists(this.classesPath);
        const scriptExists = await this.checkFileExists(this.pythonScript);
        
        if (!modelExists) {
          throw new Error(`Model file not found: ${this.modelPath}`);
        }
        if (!classesExists) {
          throw new Error(`Classes file not found: ${this.classesPath}`);
        }
        if (!scriptExists) {
          throw new Error(`Python script not found: ${this.pythonScript}`);
        }
        
        // Load classes for validation
        const classesData = await fs.readFile(this.classesPath, 'utf8');
        this.classes = JSON.parse(classesData);
        
        console.log('✅ Python ML Service loaded successfully');
        console.log(`🏷️ Number of classes: ${Object.keys(this.classes).length}`);
        console.log(`🎯 Using REAL Machine Learning with 86.12% accuracy`);
        
        this.loaded = true;
        
      } catch (error) {
        console.error('❌ Failed to load Python ML Service:', error.message);
        throw error;
      }
    }
    return true;
  }

  async checkFileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async predict(imagePath) {
    try {
      await this.loadModel();
      
      console.log(`🔍 Analyzing image with REAL ML: ${imagePath}`);
      const startTime = Date.now();
      
      // Prepare Python command
      const pythonArgs = [
        this.pythonScript,
        '--model', this.modelPath,
        '--classes', this.classesPath,
        '--image', imagePath
      ];
      
      console.log('🐍 Executing Python ML prediction...');
      
      // Execute Python script
      const result = await this.executePython('python', pythonArgs);
      const processingTime = Date.now() - startTime;
      
      if (result.success) {
        console.log(`✅ REAL ML prediction completed in ${processingTime}ms`);
        console.log(`🎯 Result: ${result.predicted_class} (${(result.confidence * 100).toFixed(2)}%)`);
        console.log(`🧠 This is REAL AI analysis, not mock prediction!`);
        
        return {
          classId: result.predicted_class_index,
          className: result.predicted_class,
          confidence: result.confidence,
          probabilities: result.all_probabilities,
          processingTime: processingTime,
          modelPath: this.modelPath,
          mode: 'real_ml',
          note: 'Real Machine Learning prediction using TensorFlow/Keras model'
        };
      } else {
        throw new Error(result.error || 'Python prediction failed');
      }
      
    } catch (error) {
      console.error('❌ Python ML prediction failed:', error.message);
      throw new Error(`Real ML prediction failed: ${error.message}`);
    }
  }

  async executePython(command, args) {
    return new Promise((resolve, reject) => {
      const python = spawn(command, args);
      
      let stdout = '';
      let stderr = '';
      
      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      python.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse Python output: ${error.message}`));
          }
        } else {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
        }
      });
      
      python.on('error', (error) => {
        reject(new Error(`Failed to start Python: ${error.message}`));
      });
    });
  }

  // Get all available classes
  getClasses() {
    return this.classes;
  }

  // Get model info
  async getModelInfo() {
    await this.loadModel();
    return {
      inputShape: [null, 224, 224, 3],
      outputShape: [null, Object.keys(this.classes).length],
      numClasses: Object.keys(this.classes).length,
      classes: this.classes,
      accuracy: '86.12%',
      modelPath: this.modelPath,
      classesPath: this.classesPath,
      version: '1.0.0-python',
      source: 'klasifikasi-tanaman',
      architecture: 'CNN (Convolutional Neural Network)',
      framework: 'TensorFlow/Keras via Python Bridge',
      trainingData: '17 plant disease categories with 38,000+ images',
      mode: 'real_ml',
      note: 'Real Machine Learning using original trained model'
    };
  }

  // Check if model is loaded
  isModelLoaded() {
    return this.loaded && this.classes !== null;
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
module.exports = new MLServicePython(); 