const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { asyncHandler, AppError } = require('../middleware/error');
const { setCache, deleteCache } = require('../config/cache');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { user: { id: userId } },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// Generate refresh token
const generateRefreshToken = () => {
  return jwt.sign(
    { tokenId: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Validation
  if (!name || !email || !password) {
    throw new AppError('Please provide name, email and password', 400, 'MISSING_FIELDS');
  }

  // Only check password confirmation if confirmPassword is provided
  if (confirmPassword && password !== confirmPassword) {
    throw new AppError('Passwords do not match', 400, 'PASSWORD_MISMATCH');
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400, 'PASSWORD_TOO_SHORT');
  }

  // Check if user exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new AppError('User already exists with this email', 400, 'USER_EXISTS');
  }

  // Create user
  const user = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    emailVerificationToken: uuidv4()
  });

  await user.save();

  // Generate tokens
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken();

  // Store refresh token
  user.refreshTokens.push({
    token: refreshToken,
    deviceInfo: req.get('User-Agent')
  });
  await user.save();

  // Cache user data
  await setCache(`user:${user._id}`, user.toJSON(), 3600);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe = false } = req.body;

  // Validation
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400, 'MISSING_CREDENTIALS');
  }

  // Check for user and include password
  let user = await User.findByEmail(email).select('+password');

  // Demo user fallback for development
  if (!user && email === 'hughes.brian@company.com' && password === 'admin' && process.env.NODE_ENV === 'development') {
    // Create a temporary demo user object
    user = {
      _id: 'demo-user-id',
      name: 'Brian Hughes',
      email: 'hughes.brian@company.com',
      role: 'admin',
      status: 'active',
      avatar: 'assets/images/avatars/male-01.jpg',
      refreshTokens: [],
      comparePassword: async () => true,
      updateLoginInfo: async () => {},
      save: async () => {},
      toJSON: () => ({
        id: 'demo-user-id',
        name: 'Brian Hughes',
        email: 'hughes.brian@company.com',
        role: 'admin',
        status: 'active',
        avatar: 'assets/images/avatars/male-01.jpg'
      })
    };
  }

  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Check if account is active
  if (user.status !== 'active') {
    throw new AppError('Account is suspended. Please contact support.', 403, 'ACCOUNT_SUSPENDED');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Update login info
  await user.updateLoginInfo();

  // Generate tokens
  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken();

  // Store refresh token
  user.refreshTokens.push({
    token: refreshToken,
    deviceInfo: req.get('User-Agent'),
    lastUsedAt: new Date()
  });

  // Limit refresh tokens (keep only last 5)
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();

  // Cache user data
  await setCache(`user:${user._id}`, user.toJSON(), 3600);

  // Set cookie if remember me
  if (rememberMe) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken
    }
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user with this refresh token
    const user = await User.findOne({
      'refreshTokens.token': refreshToken
    });

    if (!user) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Update token usage
    const tokenRecord = user.refreshTokens.find(t => t.token === refreshToken);
    if (tokenRecord) {
      tokenRecord.lastUsedAt = new Date();
      await user.save();
    }

    // Generate new access token
    const newAccessToken = generateToken(user._id);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
    throw error;
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  let user;

  // Handle demo user
  if (req.user.id === 'demo-user-id' && process.env.NODE_ENV === 'development') {
    user = {
      id: 'demo-user-id',
      name: 'Brian Hughes',
      email: 'hughes.brian@company.com',
      role: 'admin',
      status: 'active',
      avatar: 'assets/images/avatars/male-01.jpg',
      toJSON: () => ({
        id: 'demo-user-id',
        name: 'Brian Hughes',
        email: 'hughes.brian@company.com',
        role: 'admin',
        status: 'active',
        avatar: 'assets/images/avatars/male-01.jpg'
      })
    };
  } else {
    user = await User.findById(req.user.id);
  }

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({
    success: true,
    data: {
      user: user.toJSON()
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name', 'profile.firstName', 'profile.lastName', 'profile.bio',
    'profile.location', 'profile.website', 'profile.company',
    'profile.position', 'profile.phone', 'profile.socialLinks'
  ];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Update cache
  await setCache(`user:${user._id}`, user.toJSON(), 3600);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toJSON()
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new AppError('Please provide current password, new password and confirmation', 400, 'MISSING_FIELDS');
  }

  if (newPassword !== confirmPassword) {
    throw new AppError('New passwords do not match', 400, 'PASSWORD_MISMATCH');
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters long', 400, 'PASSWORD_TOO_SHORT');
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Clear all refresh tokens (force re-login on all devices)
  user.refreshTokens = [];
  await user.save();

  // Clear cache
  await deleteCache(`user:${user._id}`);

  res.json({
    success: true,
    message: 'Password changed successfully. Please login again.'
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    // Remove specific refresh token
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { refreshTokens: { token: refreshToken } }
    });
  }

  // Clear cache
  await deleteCache(`user:${req.user.id}`);

  // Clear cookie
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
exports.logoutAll = asyncHandler(async (req, res) => {
  // Clear all refresh tokens
  await User.findByIdAndUpdate(req.user.id, {
    $set: { refreshTokens: [] }
  });

  // Clear cache
  await deleteCache(`user:${req.user.id}`);

  // Clear cookie
  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logged out from all devices successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide email address', 400, 'MISSING_EMAIL');
  }

  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, we have sent password reset instructions.'
    });
  }

  // Generate reset token
  const resetToken = uuidv4();
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // TODO: Send email with reset token
  // For now, just log it (remove in production)
  console.log(`Password reset token for ${email}: ${resetToken}`);

  res.json({
    success: true,
    message: 'If an account with that email exists, we have sent password reset instructions.'
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    throw new AppError('Please provide reset token, new password and confirmation', 400, 'MISSING_FIELDS');
  }

  if (newPassword !== confirmPassword) {
    throw new AppError('Passwords do not match', 400, 'PASSWORD_MISMATCH');
  }

  if (newPassword.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400, 'PASSWORD_TOO_SHORT');
  }

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }

  // Update password and clear reset token
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // Clear all sessions
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successfully. Please login with your new password.'
  });
});