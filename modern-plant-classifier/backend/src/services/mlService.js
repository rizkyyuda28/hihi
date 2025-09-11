const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class MLService {
  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    this.isAvailable = false;
    this.checkServiceHealth();
  }

  async checkServiceHealth() {
    try {
      const response = await axios.get(`${this.mlServiceUrl}/health`, { timeout: 5000 });
      this.isAvailable = response.data.status === 'OK';
      console.log(`🤖 ML Service ${this.isAvailable ? 'available' : 'unavailable'}`);
    } catch (error) {
      this.isAvailable = false;
      console.log('🤖 ML Service unavailable, using fallback');
    }
  }

  async preprocessImage(imagePath) {
    try {
      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      
      // Resize and optimize image using Sharp
      const processedBuffer = await sharp(imageBuffer)
        .resize(224, 224, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer();
      
      // Convert to base64
      const base64Image = processedBuffer.toString('base64');
      
      return base64Image;
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw new Error('Failed to preprocess image');
    }
  }

  async predictWithML(imagePath) {
    try {
      if (!this.isAvailable) {
        throw new Error('ML Service not available');
      }

      // Preprocess image
      const base64Image = await this.preprocessImage(imagePath);
      
      // Send to ML service
      const response = await axios.post(`${this.mlServiceUrl}/predict`, {
        image: base64Image
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      return response.data;
    } catch (error) {
      console.error('ML Service prediction error:', error.message);
      throw error;
    }
  }

  getFallbackPrediction(imagePath) {
    // Fallback prediction when ML service is not available
    const filename = path.basename(imagePath);
    const randomDiseases = [
      'Healthy', 'Bacterial Spot', 'Early Blight', 'Late Blight', 
      'Leaf Mold', 'Septoria Leaf Spot', 'Spider Mites', 'Target Spot'
    ];
    
    const randomPlants = ['Tomato', 'Potato', 'Corn', 'Apple', 'Grape'];
    
    const plant = randomPlants[Math.floor(Math.random() * randomPlants.length)];
    const disease = randomDiseases[Math.floor(Math.random() * randomDiseases.length)];
    const confidence = 0.7 + Math.random() * 0.25; // 0.7 to 0.95
    
    return {
      success: true,
      prediction: {
        plant: plant,
        disease: disease,
        confidence: confidence,
        status: disease === 'Healthy' ? 'healthy' : 'diseased',
        full_class: `${plant} ${disease}`
      },
      top_predictions: [
        { class: `${plant} ${disease}`, confidence: confidence },
        { class: `${plant} Healthy`, confidence: 0.3 + Math.random() * 0.2 },
        { class: `${plant} Early Blight`, confidence: 0.1 + Math.random() * 0.2 }
      ],
      model_info: {
        total_classes: 17,
        model_accuracy: 'Fallback Mode'
      },
      fallback: true
    };
  }

  async predict(imagePath) {
    try {
      // Try ML service first
      if (this.isAvailable) {
        return await this.predictWithML(imagePath);
      } else {
        // Use fallback
        console.log('Using fallback prediction');
        return this.getFallbackPrediction(imagePath);
      }
    } catch (error) {
      console.error('Prediction error:', error.message);
      // Fallback to mock prediction
      return this.getFallbackPrediction(imagePath);
    }
  }

  async getAvailableClasses() {
    try {
      if (!this.isAvailable) {
        return {
          success: false,
          error: 'ML Service not available'
        };
      }

      const response = await axios.get(`${this.mlServiceUrl}/classes`, { timeout: 5000 });
      return response.data;
    } catch (error) {
      console.error('Error getting classes:', error.message);
      return {
        success: false,
        error: 'Failed to get classes'
      };
    }
  }

  // Health check for ML service
  async healthCheck() {
    try {
      const response = await axios.get(`${this.mlServiceUrl}/health`, { timeout: 5000 });
      this.isAvailable = response.data.status === 'OK';
      return {
        available: this.isAvailable,
        service: response.data
      };
    } catch (error) {
      this.isAvailable = false;
      return {
        available: false,
        error: error.message
      };
    }
  }
}

module.exports = new MLService();