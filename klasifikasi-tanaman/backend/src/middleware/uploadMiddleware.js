/**
 * Upload Middleware
 * Handles file uploads with validation and error handling
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../../config');

// Ensure upload directory exists
const ensureUploadDir = () => {
  if (!fs.existsSync(config.UPLOAD_DIR)) {
    fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
    console.log(`📁 Created upload directory: ${config.UPLOAD_DIR}`);
  }
};

// Storage configuration
const storage = multer.memoryStorage(); // Store in memory for processing

// File filter function
const fileFilter = (req, file, callback) => {
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (config.ALLOWED_EXTENSIONS.includes(ext)) {
    callback(null, true);
  } else {
    const error = new Error(
      `Invalid file type. Allowed types: ${config.ALLOWED_EXTENSIONS.join(', ')}`
    );
    error.code = 'INVALID_FILE_TYPE';
    callback(error, false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
    files: 1, // Only allow single file upload
  },
  fileFilter: fileFilter,
});

/**
 * Single file upload middleware
 */
const uploadSingle = (fieldName = 'image') => {
  ensureUploadDir();
  
  return (req, res, next) => {
    const uploadHandler = upload.single(fieldName);
    
    uploadHandler(req, res, (error) => {
      if (error) {
        // Handle multer specific errors
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File too large',
            message: `File size must be less than ${config.MAX_FILE_SIZE / 1024 / 1024}MB`,
            code: 'FILE_TOO_LARGE'
          });
        }
        
        if (error.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            error: 'Too many files',
            message: 'Only one file is allowed',
            code: 'TOO_MANY_FILES'
          });
        }
        
        if (error.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            success: false,
            error: 'Invalid file type',
            message: error.message,
            code: 'INVALID_FILE_TYPE'
          });
        }
        
        // Generic multer error
        return res.status(400).json({
          success: false,
          error: 'Upload failed',
          message: error.message,
          code: 'UPLOAD_ERROR'
        });
      }
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          message: 'Please select an image file to upload',
          code: 'NO_FILE'
        });
      }
      
      // Validate file buffer
      if (!req.file.buffer || req.file.buffer.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid file',
          message: 'The uploaded file appears to be empty or corrupted',
          code: 'INVALID_FILE'
        });
      }
      
      // Add file metadata to request
      req.fileInfo = {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        buffer: req.file.buffer,
        uploadTime: new Date().toISOString()
      };
      
      console.log(`📤 File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);
      next();
    });
  };
};

/**
 * Validate image file middleware
 */
const validateImageFile = (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({
      success: false,
      error: 'No image file provided',
      code: 'NO_IMAGE'
    });
  }
  
  // Check MIME type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid image format',
      message: `Supported formats: ${allowedMimeTypes.join(', ')}`,
      code: 'INVALID_IMAGE_FORMAT'
    });
  }
  
  // Basic file signature validation
  const fileSignature = req.file.buffer.slice(0, 4).toString('hex');
  const validSignatures = {
    'ffd8ffe0': 'JPEG',
    'ffd8ffe1': 'JPEG',
    'ffd8ffe2': 'JPEG',
    'ffd8ffe3': 'JPEG',
    'ffd8ffe8': 'JPEG',
    '89504e47': 'PNG',
    '52494646': 'WEBP'
  };
  
  const isValidSignature = Object.keys(validSignatures).some(sig => 
    fileSignature.startsWith(sig)
  );
  
  if (!isValidSignature) {
    return res.status(400).json({
      success: false,
      error: 'Invalid image file',
      message: 'The file does not appear to be a valid image',
      code: 'INVALID_IMAGE_SIGNATURE'
    });
  }
  
  next();
};

/**
 * Error handler for upload middleware
 */
const uploadErrorHandler = (err, req, res, next) => {
  console.error('Upload error:', err);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: 'Upload error',
      message: err.message,
      code: err.code
    });
  }
  
  // Pass non-upload errors to next error handler
  next(err);
};

module.exports = {
  uploadSingle,
  validateImageFile,
  uploadErrorHandler,
  ensureUploadDir
}; 