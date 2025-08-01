const File = require('../models/File');
const { AppError, asyncHandler } = require('../middleware/error');
const { cleanupFiles } = require('../middleware/upload');
const fs = require('fs').promises;
const path = require('path');

// Upload single file
exports.uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400, 'NO_FILE');
  }

  try {
    const fileData = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: req.file.url || `/${req.file.path}`,
      uploadedBy: req.user.id
    };

    // Add processed paths if image
    if (req.file.processedPath) {
      fileData.processedPath = req.file.processedPath;
      fileData.url = req.file.url;
    }
    
    if (req.file.thumbnailPath) {
      fileData.thumbnailPath = req.file.thumbnailPath;
      fileData.thumbnailUrl = req.file.thumbnailUrl;
    }

    // Add metadata if provided
    if (req.body.description) {
      fileData.metadata = { description: req.body.description };
    }

    if (req.body.tags) {
      fileData.tags = req.body.tags.split(',').map(tag => tag.trim());
    }

    if (req.body.isPublic) {
      fileData.isPublic = req.body.isPublic === 'true';
    }

    const file = new File(fileData);
    await file.save();

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: file.getFileInfo()
    });
  } catch (error) {
    // Clean up uploaded files on error
    await cleanupFiles(req.file);
    throw error;
  }
});

// Upload multiple files
exports.uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError('No files uploaded', 400, 'NO_FILES');
  }

  try {
    const uploadedFiles = [];

    for (const file of req.files) {
      const fileData = {
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: file.url || `/${file.path}`,
        uploadedBy: req.user.id
      };

      // Add processed paths if image
      if (file.processedPath) {
        fileData.processedPath = file.processedPath;
        fileData.url = file.url;
      }
      
      if (file.thumbnailPath) {
        fileData.thumbnailPath = file.thumbnailPath;
        fileData.thumbnailUrl = file.thumbnailUrl;
      }

      const fileDoc = new File(fileData);
      await fileDoc.save();
      uploadedFiles.push(fileDoc.getFileInfo());
    }

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    // Clean up uploaded files on error
    await cleanupFiles(req.files);
    throw error;
  }
});

// Get user's files
exports.getUserFiles = asyncHandler(async (req, res) => {
  const { category, tags, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const options = {
    category,
    tags: tags ? tags.split(',') : undefined,
    limit: parseInt(limit),
    skip: parseInt(skip)
  };

  const files = await File.findByUser(req.user.id, options);
  const total = await File.countDocuments({ 
    uploadedBy: req.user.id,
    ...(category && { category }),
    ...(tags && { tags: { $in: tags.split(',') } })
  });

  res.json({
    success: true,
    data: {
      files: files.map(file => file.getFileInfo()),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: files.length,
        totalFiles: total
      }
    }
  });
});

// Get public files
exports.getPublicFiles = asyncHandler(async (req, res) => {
  const { category, limit = 20 } = req.query;

  const files = await File.findPublic({
    category,
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    data: files.map(file => ({
      ...file.getFileInfo(),
      uploadedBy: {
        id: file.uploadedBy._id,
        name: file.uploadedBy.name,
        email: file.uploadedBy.email
      }
    }))
  });
});

// Get single file
exports.getFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id).populate('uploadedBy', 'name email');

  if (!file) {
    throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
  }

  // Check permissions
  if (!file.isPublic && file.uploadedBy._id.toString() !== req.user.id) {
    throw new AppError('Access denied', 403, 'ACCESS_DENIED');
  }

  res.json({
    success: true,
    data: {
      ...file.getFileInfo(),
      uploadedBy: {
        id: file.uploadedBy._id,
        name: file.uploadedBy.name,
        email: file.uploadedBy.email
      }
    }
  });
});

// Update file metadata
exports.updateFile = asyncHandler(async (req, res) => {
  const { description, tags, isPublic } = req.body;

  const file = await File.findById(req.params.id);

  if (!file) {
    throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
  }

  // Check ownership
  if (file.uploadedBy.toString() !== req.user.id) {
    throw new AppError('Access denied', 403, 'ACCESS_DENIED');
  }

  // Update metadata
  if (description !== undefined) {
    file.metadata = { ...file.metadata, description };
  }

  if (tags !== undefined) {
    file.tags = tags.split(',').map(tag => tag.trim());
  }

  if (isPublic !== undefined) {
    file.isPublic = isPublic;
  }

  await file.save();

  res.json({
    success: true,
    message: 'File updated successfully',
    data: file.getFileInfo()
  });
});

// Delete file
exports.deleteFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);

  if (!file) {
    throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
  }

  // Check ownership
  if (file.uploadedBy.toString() !== req.user.id) {
    throw new AppError('Access denied', 403, 'ACCESS_DENIED');
  }

  try {
    // Delete physical files
    if (file.path) {
      await fs.unlink(file.path).catch(() => {});
    }
    if (file.processedPath) {
      await fs.unlink(file.processedPath).catch(() => {});
    }
    if (file.thumbnailPath) {
      await fs.unlink(file.thumbnailPath).catch(() => {});
    }

    // Delete from database
    await File.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    throw new AppError('Error deleting file', 500, 'DELETE_ERROR');
  }
});

// Get file statistics
exports.getFileStats = asyncHandler(async (req, res) => {
  const stats = await File.aggregate([
    {
      $match: { uploadedBy: req.user._id }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' }
      }
    }
  ]);

  const totalFiles = await File.countDocuments({ uploadedBy: req.user.id });
  const totalSize = await File.aggregate([
    { $match: { uploadedBy: req.user._id } },
    { $group: { _id: null, totalSize: { $sum: '$size' } } }
  ]);

  res.json({
    success: true,
    data: {
      totalFiles,
      totalSize: totalSize[0]?.totalSize || 0,
      byCategory: stats,
      storageUsed: ((totalSize[0]?.totalSize || 0) / (1024 * 1024 * 1024)).toFixed(2) // GB
    }
  });
});