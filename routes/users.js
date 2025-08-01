const express = require('express');
const { body, param, query } = require('express-validator');
const { auth, adminAuth, userSelfOrAdmin } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  searchUsers,
  toggleUserStatus,
  bulkUserOperations
} = require('../controllers/users');

const router = express.Router();

// Validation middleware
const validateObjectId = [
  param('id').isMongoId().withMessage('Invalid user ID format')
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['admin', 'user', 'moderator'])
    .withMessage('Invalid role'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Invalid status')
];

const validateSearch = [
  query('q')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

const validateBulkOperation = [
  body('action')
    .isIn(['activate', 'deactivate', 'verify'])
    .withMessage('Invalid bulk action'),
  body('userIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('User IDs must be an array with 1-100 items'),
  body('userIds.*')
    .isMongoId()
    .withMessage('Each user ID must be a valid MongoDB ObjectId')
];

// Public routes (none for users)

// Protected routes - require authentication
router.use(auth);

// Routes that require admin privileges
router.get('/', adminAuth, getUsers);
router.get('/stats', adminAuth, getUserStats);
router.delete('/:id', adminAuth, validateObjectId, deleteUser);
router.patch('/:id/status', adminAuth, validateObjectId, toggleUserStatus);
router.post('/bulk', adminAuth, validateBulkOperation, bulkUserOperations);

// Routes accessible by user themselves or admin
router.get('/:id', userSelfOrAdmin, validateObjectId, getUserById);
router.put('/:id', userSelfOrAdmin, validateObjectId, validateUserUpdate, updateUser);

// Search users - all authenticated users can search
router.get('/search', validateSearch, searchUsers);

module.exports = router;