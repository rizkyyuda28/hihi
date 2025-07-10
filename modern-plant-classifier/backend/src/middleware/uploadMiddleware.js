const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory created:', uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  console.log('📁 Received file:', file.originalname, 'Type:', file.mimetype);
  
  // Check file type
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1 // Only one file at a time
  },
  fileFilter: fileFilter
});

// Middleware for single image upload
const uploadSingleImage = upload.single('image');

// Wrapper middleware with error handling
const handleImageUpload = (req, res, next) => {
  uploadSingleImage(req, res, (error) => {
    if (error) {
      console.error('❌ Upload error:', error);
      
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 10MB.',
          timestamp: new Date().toISOString()
        });
      }
      
      if (error.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(400).json({
        success: false,
        error: 'File upload failed',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    // Log successful upload
    if (req.file) {
      console.log('✅ File uploaded successfully:', req.file.filename);
      console.log('📍 File path:', req.file.path);
      console.log('📏 File size:', req.file.size, 'bytes');
    }
    
    next();
  });
};

// Cleanup function to remove old uploaded files
const cleanupOldFiles = (maxAge = 24 * 60 * 60 * 1000) => { // 24 hours default
  try {
    const files = fs.readdirSync(uploadDir);
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Cleaned up old file:', file);
      }
    });
  } catch (error) {
    console.error('❌ Error cleaning up old files:', error);
  }
};

// Validate uploaded file
const validateUploadedFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No image file uploaded. Please select an image file.',
      timestamp: new Date().toISOString()
    });
  }
  
  // Additional validation can be added here
  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  if (!allowedExtensions.includes(fileExtension)) {
    // Remove the uploaded file if it's invalid
    try {
      fs.unlinkSync(req.file.path);
    } catch (error) {
      console.error('Error removing invalid file:', error);
    }
    
    return res.status(400).json({
      success: false,
      error: 'Invalid file extension. Only JPG, JPEG, PNG, and WebP files are allowed.',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

// Run cleanup every hour
setInterval(() => {
  cleanupOldFiles();
}, 60 * 60 * 1000);

module.exports = {
  handleImageUpload,
  validateUploadedFile,
  cleanupOldFiles,
  uploadDir
}; 