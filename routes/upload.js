const express = require('express');
const { auth } = require('../middleware/auth');
const { 
  single, 
  multiple, 
  processImage, 
  validateUpload 
} = require('../middleware/upload');
const {
  uploadSingle,
  uploadMultiple,
  getUserFiles,
  getPublicFiles,
  getFile,
  updateFile,
  deleteFile,
  getFileStats
} = require('../controllers/upload');

const router = express.Router();

// Upload routes
router.post('/single', 
  auth, 
  single('file'), 
  validateUpload, 
  processImage, 
  uploadSingle
);

router.post('/multiple', 
  auth, 
  multiple('files', 5), 
  validateUpload, 
  processImage, 
  uploadMultiple
);

// File management routes
router.get('/files', auth, getUserFiles);
router.get('/files/public', getPublicFiles);
router.get('/files/stats', auth, getFileStats);
router.get('/files/:id', auth, getFile);
router.put('/files/:id', auth, updateFile);
router.delete('/files/:id', auth, deleteFile);

module.exports = router;