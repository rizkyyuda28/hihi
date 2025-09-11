const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
  try {
    console.log('Testing...');
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream('../RS_Rust 2730_flipLR.JPG'));
    
    const response = await axios.post('http://localhost:3001/api/predict', formData, {
      headers: formData.getHeaders()
    });
    
    console.log('Result:', response.data.prediction);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
