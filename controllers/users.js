const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/error');
const { setCache, getCache, deleteCache } = require('../config/cache');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
exports.getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';
  const role = req.query.role;
  const status = req.query.status;
  
  // Build filter criteria
  let filterCriteria = {};
  
  if (search) {
    filterCriteria.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'profile.company': { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role) {
    filterCriteria.role = role;
  }
  
  if (status) {
    filterCriteria.status = status;
  }

  const skip = (page - 1) * limit;
  
  // Get users with pagination
  const users = await User.find(filterCriteria)
    .select('-password -refreshTokens')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const totalUsers = await User.countDocuments(filterCriteria);
  const totalPages = Math.ceil(totalUsers / limit);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check cache first
  let user = await getCache(`user:${id}`);
  
  if (!user) {
    user = await User.findById(id).select('-password -refreshTokens');
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    // Cache for 1 hour
    await setCache(`user:${id}`, user.toJSON(), 3600);
  }

  res.json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or Self)
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if user exists
  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Define allowed fields based on user role
  const currentUser = await User.findById(req.user.id);
  let allowedFields = [
    'name', 'profile.firstName', 'profile.lastName', 'profile.bio',
    'profile.location', 'profile.website', 'profile.company',
    'profile.position', 'profile.phone', 'profile.socialLinks',
    'settings', 'preferences'
  ];

  // Admin can update more fields
  if (currentUser.role === 'admin') {
    allowedFields.push('role', 'status', 'isEmailVerified');
  }

  // Build update object
  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Don't allow users to change their own role unless they are admin
  if (req.user.id === id && updates.role && currentUser.role !== 'admin') {
    delete updates.role;
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  // Update cache
  await setCache(`user:${id}`, user.toJSON(), 3600);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: {
      user
    }
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Prevent admin from deleting themselves
  if (req.user.id === id) {
    throw new AppError('You cannot delete your own account', 400, 'CANNOT_DELETE_SELF');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Instead of hard delete, we'll deactivate the account
  user.status = 'inactive';
  user.email = `deleted_${Date.now()}_${user.email}`;
  await user.save();

  // Clear cache
  await deleteCache(`user:${id}`);

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
exports.getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        adminUsers: {
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
        },
        verifiedUsers: {
          $sum: { $cond: ['$isEmailVerified', 1, 0] }
        }
      }
    }
  ]);

  // Get registration trends (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const registrationTrends = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        verifiedUsers: 0
      },
      registrationTrends
    }
  });
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;
  
  if (!q || q.length < 2) {
    throw new AppError('Search query must be at least 2 characters', 400, 'INVALID_SEARCH_QUERY');
  }

  const users = await User.find({
    $and: [
      { status: 'active' },
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { 'profile.company': { $regex: q, $options: 'i' } }
        ]
      }
    ]
  })
  .select('name email avatar profile.company profile.position')
  .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      users
    }
  });
});

// @desc    Toggle user status
// @route   PATCH /api/users/:id/status
// @access  Private (Admin only)
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Prevent admin from deactivating themselves
  if (req.user.id === id) {
    throw new AppError('You cannot change your own status', 400, 'CANNOT_CHANGE_OWN_STATUS');
  }

  // Toggle status
  user.status = user.status === 'active' ? 'inactive' : 'active';
  await user.save();

  // Clear cache
  await deleteCache(`user:${id}`);

  res.json({
    success: true,
    message: `User ${user.status === 'active' ? 'activated' : 'deactivated'} successfully`,
    data: {
      user: user.toJSON()
    }
  });
});

// @desc    Bulk user operations
// @route   POST /api/users/bulk
// @access  Private (Admin only)
exports.bulkUserOperations = asyncHandler(async (req, res) => {
  const { action, userIds } = req.body;
  
  if (!action || !userIds || !Array.isArray(userIds)) {
    throw new AppError('Action and user IDs are required', 400, 'MISSING_BULK_DATA');
  }

  // Prevent admin from affecting their own account in bulk operations
  if (userIds.includes(req.user.id)) {
    throw new AppError('You cannot perform bulk operations on your own account', 400, 'CANNOT_BULK_SELF');
  }

  let updateData = {};
  let message = '';

  switch (action) {
    case 'activate':
      updateData = { status: 'active' };
      message = 'Users activated successfully';
      break;
    case 'deactivate':
      updateData = { status: 'inactive' };
      message = 'Users deactivated successfully';
      break;
    case 'verify':
      updateData = { isEmailVerified: true };
      message = 'Users verified successfully';
      break;
    default:
      throw new AppError('Invalid bulk action', 400, 'INVALID_BULK_ACTION');
  }

  const result = await User.updateMany(
    { _id: { $in: userIds } },
    { $set: updateData }
  );

  // Clear cache for affected users
  for (const userId of userIds) {
    await deleteCache(`user:${userId}`);
  }

  res.json({
    success: true,
    message,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});