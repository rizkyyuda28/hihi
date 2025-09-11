const path = require('path');

function testFilenameAnalysis() {
  const filename = 'RS_Rust 2730_flipLR.JPG';
  const lowerFilename = filename.toLowerCase();
  
  console.log('Original filename:', filename);
  console.log('Lowercase filename:', lowerFilename);
  console.log('Contains "rust":', lowerFilename.includes('rust'));
  console.log('Contains "blight":', lowerFilename.includes('blight'));
  console.log('Contains "spot":', lowerFilename.includes('spot'));
  console.log('Contains "corn":', lowerFilename.includes('corn'));
  console.log('Contains "tomato":', lowerFilename.includes('tomato'));
  console.log('Contains "potato":', lowerFilename.includes('potato'));
}

testFilenameAnalysis();
