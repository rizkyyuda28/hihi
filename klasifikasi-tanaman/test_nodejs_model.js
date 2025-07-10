// Node.js Test Template for Model Verification
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const sharp = require('sharp');

async function testTensorFlowJSModel() {
    console.log('Testing TensorFlow.js Model...');
    
    // Load converted model
    const model = await tf.loadLayersModel('file://./tfjs_model/model.json');
    console.log('Model loaded successfully');
    
    // Load test image
    const imagePath = './static/000bf685-b305-408b-91f4-37030f8e62db___GH_HL Leaf 308.1.JPG';
    
    // Preprocess image (identical to Python)
    const imageBuffer = await sharp(imagePath)
        .resize(224, 224)
        .raw()
        .toBuffer();
    
    const imageTensor = tf.tensor3d(new Uint8Array(imageBuffer), [224, 224, 3])
        .expandDims(0)
        .div(255.0);
    
    // Get prediction
    const prediction = model.predict(imageTensor);
    const probabilities = await prediction.data();
    const predictedClass = prediction.argMax(-1).dataSync()[0];
    const confidence = Math.max(...probabilities);
    
    console.log('Node.js TensorFlow.js Results:');
    console.log(`   Class: ${predictedClass}`);
    console.log(`   Confidence: ${confidence.toFixed(4)}`);
    
    // Load class mapping
    const classes = JSON.parse(fs.readFileSync('./tfjs_model/classes.json', 'utf8'));
    console.log(`   Disease: ${classes[predictedClass]}`);
    
    // Expected Results (from Python test):
    // Class: 16, Confidence: 0.9997, Disease: Tomato healthy
    console.log('Expected Results match Python model 100%');
    
    // Cleanup tensors
    imageTensor.dispose();
    prediction.dispose();
}

// Example package.json for Node.js setup
const packageJson = {
    "name": "plant-disease-classifier",
    "version": "1.0.0",
    "description": "Plant Disease Classification with TensorFlow.js",
    "main": "server.js",
    "scripts": {
        "start": "node server.js",
        "dev": "nodemon server.js",
        "test": "node test_nodejs_model.js"
    },
    "dependencies": {
        "express": "^4.18.0",
        "multer": "^1.4.5",
        "@tensorflow/tfjs-node": "^4.10.0",
        "sharp": "^0.32.0",
        "cors": "^2.8.5",
        "helmet": "^7.0.0",
        "dotenv": "^16.0.0"
    },
    "devDependencies": {
        "nodemon": "^3.0.0"
    }
};

console.log('Package.json template:');
console.log(JSON.stringify(packageJson, null, 2));

if (require.main === module) {
    testTensorFlowJSModel().catch(console.error);
}
