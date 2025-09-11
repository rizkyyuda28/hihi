const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function quickTest() {
  try {
    console.log('Testing Early Blight...');
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream('../0a8a68ee-f587-4dea-beec-79d02e7d3fa4___RS_Early.B 8461.JPG'));
    
    const response = await axios.post('http://localhost:3001/api/predict', formData, {
      headers: formData.getHeaders()
    });
    
    console.log('Plant:', response.data.prediction.plant);
    console.log('Disease:', response.data.prediction.disease);
    console.log('Full Class:', response.data.prediction.full_class);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

quickTest();
