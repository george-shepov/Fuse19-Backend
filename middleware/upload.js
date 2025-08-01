const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { AppError } = require('./error');

// Create uploads directory if it doesn't exist
const createUploadDir = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Organize files by type
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'videos/';
    } else if (file.mimetype.includes('pdf')) {
      uploadPath += 'documents/';
    } else {
      uploadPath += 'files/';
    }

    // Create directory if it doesn't exist
    await createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${name}_${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'video/mp4': true,
    'video/webm': true,
    'video/ogg': true,
    'application/pdf': true,
    'text/plain': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'application/vnd.ms-excel': true,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new AppError('File type not allowed', 400, 'INVALID_FILE_TYPE'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files at once
  }
});

// Image processing middleware
const processImage = async (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  const files = req.files || [req.file];
  const processedFiles = [];

  try {
    for (const file of files) {
      if (file && file.mimetype.startsWith('image/')) {
        const originalPath = file.path;
        const processedPath = originalPath.replace(/\.[^/.]+$/, '_processed.webp');

        // Process image: resize and optimize
        await sharp(originalPath)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toFile(processedPath);

        // Create thumbnail
        const thumbnailPath = originalPath.replace(/\.[^/.]+$/, '_thumb.webp');
        await sharp(originalPath)
          .resize(300, 300, {
            fit: 'cover'
          })
          .webp({ quality: 70 })
          .toFile(thumbnailPath);

        // Update file info
        file.processedPath = processedPath;
        file.thumbnailPath = thumbnailPath;
        file.url = `/${processedPath}`;
        file.thumbnailUrl = `/${thumbnailPath}`;
      } else if (file) {
        file.url = `/${file.path}`;
      }

      if (file) {
        processedFiles.push(file);
      }
    }

    req.processedFiles = processedFiles;
    next();
  } catch (error) {
    next(new AppError('Error processing files', 500, 'FILE_PROCESSING_ERROR'));
  }
};

// Validation middleware
const validateUpload = (req, res, next) => {
  if (!req.files && !req.file) {
    return next(new AppError('No files uploaded', 400, 'NO_FILES'));
  }
  next();
};

// Clean up failed uploads
const cleanupFiles = async (files) => {
  if (!files) return;
  
  const fileList = Array.isArray(files) ? files : [files];
  
  for (const file of fileList) {
    try {
      if (file.path) await fs.unlink(file.path);
      if (file.processedPath) await fs.unlink(file.processedPath);
      if (file.thumbnailPath) await fs.unlink(file.thumbnailPath);
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
};

module.exports = {
  upload,
  processImage,
  validateUpload,
  cleanupFiles,
  single: (field) => upload.single(field),
  multiple: (field, maxCount = 5) => upload.array(field, maxCount),
  fields: (fields) => upload.fields(fields)
};