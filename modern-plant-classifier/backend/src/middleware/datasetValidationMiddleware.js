const path = require('path');

// Word list berdasarkan dataset yang tersedia di klasifikasi-tanaman
const ALLOWED_PLANT_NAMES = [
  // Corn/Maize (Jagung)
  'corn', 'maize', 'jagung', 'zea', 'zea mays',
  
  // Potato (Kentang)
  'potato', 'kentang', 'solanum', 'solanum tuberosum',
  
  // Tomato (Tomat)
  'tomato', 'tomat', 'lycopersicon', 'solanum lycopersicum'
];

const ALLOWED_DISEASE_NAMES = [
  // Corn diseases
  'healthy', 'common rust', 'gray leaf spot', 'northern leaf blight', 'cercospora',
  
  // Potato diseases  
  'early blight', 'late blight',
  
  // Tomato diseases
  'bacterial spot', 'early blight', 'late blight', 'leaf mold', 
  'septoria leaf spot', 'spider mites', 'target spot', 'mosaic virus', 
  'yellow leaf curl virus'
];

const ALLOWED_KEYWORDS = [
  // Plant types
  'plant', 'tanaman', 'daun', 'leaf', 'pohon', 'tree', 'semak', 'shrub',
  
  // Disease indicators
  'disease', 'penyakit', 'sick', 'infected', 'damage', 'rusak', 'spot', 'bintik',
  'blight', 'rust', 'mold', 'virus', 'bacterial', 'fungal', 'mite', 'tungau',
  
  // Common words
  'healthy', 'sehat', 'normal', 'good', 'bagus', 'fresh', 'segar'
];

// Combine all allowed words
const ALLOWED_WORDS = [
  ...ALLOWED_PLANT_NAMES,
  ...ALLOWED_DISEASE_NAMES,
  ...ALLOWED_KEYWORDS
];

// Function to check if filename contains allowed words
const containsAllowedWords = (filename) => {
  const lowerFilename = filename.toLowerCase();
  const nameWithoutExt = path.parse(filename).name.toLowerCase();
  
  // Check if filename contains any of the allowed words
  for (const word of ALLOWED_WORDS) {
    if (lowerFilename.includes(word.toLowerCase()) || 
        nameWithoutExt.includes(word.toLowerCase())) {
      return true;
    }
  }
  
  // Check for common variations and abbreviations
  const variations = [
    'corn', 'jagung', 'maize', 'zea',
    'potato', 'kentang', 'solanum',
    'tomato', 'tomat', 'lycopersicon',
    'healthy', 'sehat', 'normal',
    'disease', 'penyakit', 'sick',
    'blight', 'rust', 'mold', 'virus',
    'spot', 'bintik', 'daun', 'leaf'
  ];
  
  for (const variation of variations) {
    if (lowerFilename.includes(variation)) {
      return true;
    }
  }
  
  return false;
};

// Function to get plant type from filename
const getPlantTypeFromFilename = (filename) => {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('corn') || lowerFilename.includes('maize') || lowerFilename.includes('jagung') || lowerFilename.includes('zea')) {
    return 'corn';
  } else if (lowerFilename.includes('potato') || lowerFilename.includes('kentang') || lowerFilename.includes('solanum')) {
    return 'potato';
  } else if (lowerFilename.includes('tomato') || lowerFilename.includes('tomat') || lowerFilename.includes('lycopersicon')) {
    return 'tomato';
  }
  
  return 'unknown';
};

// Function to get disease type from filename
const getDiseaseTypeFromFilename = (filename) => {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('healthy') || lowerFilename.includes('sehat') || lowerFilename.includes('normal')) {
    return 'healthy';
  } else if (lowerFilename.includes('blight')) {
    if (lowerFilename.includes('early')) return 'early blight';
    if (lowerFilename.includes('late')) return 'late blight';
    return 'blight';
  } else if (lowerFilename.includes('rust')) {
    return 'rust';
  } else if (lowerFilename.includes('mold') || lowerFilename.includes('mould')) {
    return 'mold';
  } else if (lowerFilename.includes('virus')) {
    return 'virus';
  } else if (lowerFilename.includes('bacterial')) {
    return 'bacterial';
  } else if (lowerFilename.includes('spot')) {
    return 'spot';
  } else if (lowerFilename.includes('mite') || lowerFilename.includes('tungau')) {
    return 'mite';
  }
  
  return 'unknown';
};

// Main validation middleware
const validateDatasetFilename = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        message: 'Please upload an image file'
      });
    }

    const filename = req.file.originalname;
    const fileExtension = path.extname(filename).toLowerCase();
    
    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type',
        message: `Only ${allowedExtensions.join(', ')} files are allowed`,
        allowedExtensions
      });
    }

    // Check if filename contains allowed words
    if (!containsAllowedWords(filename)) {
      console.log(`❌ File validation failed: ${filename} - No allowed keywords found`);
      return res.status(400).json({
        success: false,
        error: 'Invalid filename',
        message: 'Filename must contain plant or disease related keywords from the dataset',
        filename: filename,
        allowedKeywords: ALLOWED_WORDS.slice(0, 20), // Show first 20 for reference
        suggestion: 'Please rename your file to include plant/disease keywords (e.g., corn_healthy.jpg, tomato_blight.jpg)',
        examples: [
          'corn_healthy.jpg',
          'tomato_blight.jpg', 
          'potato_rust.jpg',
          'jagung_sehat.jpg',
          'tomat_penyakit.jpg',
          'kentang_healthy.jpg'
        ]
      });
    }

    // Extract plant and disease info for logging
    const plantType = getPlantTypeFromFilename(filename);
    const diseaseType = getDiseaseTypeFromFilename(filename);
    
    // Add metadata to request for later use
    req.fileMetadata = {
      originalName: filename,
      plantType: plantType,
      diseaseType: diseaseType,
      isValidDataset: true
    };

    logInfo(`File validation passed: ${filename} (Plant: ${plantType}, Disease: ${diseaseType})`);
    next();
    
  } catch (error) {
    console.error('Dataset validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Validation error',
      message: 'Error validating file against dataset'
    });
  }
};

// Helper function to log info
const logInfo = (message) => {
  console.log(`[Dataset Validation] ℹ️ ${message}`);
};

// Export functions for testing
module.exports = {
  validateDatasetFilename,
  containsAllowedWords,
  getPlantTypeFromFilename,
  getDiseaseTypeFromFilename,
  ALLOWED_WORDS,
  ALLOWED_PLANT_NAMES,
  ALLOWED_DISEASE_NAMES
};
