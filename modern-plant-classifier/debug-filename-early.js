const path = require('path');

function testEarlyBlightFilename() {
  const filename = '0a8a68ee-f587-4dea-beec-79d02e7d3fa4___RS_Early.B 8461.JPG';
  const lowerFilename = filename.toLowerCase();
  
  console.log('Original filename:', filename);
  console.log('Lowercase filename:', lowerFilename);
  console.log('Contains "early":', lowerFilename.includes('early'));
  console.log('Contains "blight":', lowerFilename.includes('blight'));
  console.log('Contains "early" AND "blight":', lowerFilename.includes('early') && lowerFilename.includes('blight'));
  console.log('Contains "late":', lowerFilename.includes('late'));
  console.log('Contains "corn":', lowerFilename.includes('corn'));
  console.log('Contains "tomato":', lowerFilename.includes('tomato'));
  console.log('Contains "potato":', lowerFilename.includes('potato'));
}

testEarlyBlightFilename();
