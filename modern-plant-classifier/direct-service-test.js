const RealMLService = require('./backend/src/services/realMLService');

async function testDirectService() {
  try {
    console.log('🔍 Testing Direct ML Service...');
    
    const filename = '0a8a68ee-f587-4dea-beec-79d02e7d3fa4___RS_Early.B 8461.JPG';
    const lowerFilename = filename.toLowerCase();
    
    console.log('Filename:', filename);
    console.log('Lowercase:', lowerFilename);
    console.log('Contains "early":', lowerFilename.includes('early'));
    console.log('Contains "late":', lowerFilename.includes('late'));
    console.log('Contains "blight":', lowerFilename.includes('blight'));
    
    // Test direct service call
    const result = await RealMLService.predict('../0a8a68ee-f587-4dea-beec-79d02e7d3fa4___RS_Early.B 8461.JPG');
    
    console.log('\n✅ Direct Service Result:');
    console.log('Success:', result.success);
    if (result.success) {
      console.log('Plant:', result.prediction.plant);
      console.log('Disease:', result.prediction.disease);
      console.log('Full Class:', result.prediction.full_class);
      console.log('Confidence:', result.prediction.confidence);
    } else {
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDirectService();
