const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'moderator'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      desktop: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'public'
      },
      showOnlineStatus: {
        type: Boolean,
        default: true
      }
    }
  },
  profile: {
    firstName: String,
    lastName: String,
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    location: String,
    website: String,
    company: String,
    position: String,
    phone: String,
    dateOfBirth: Date,
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String,
      facebook: String
    }
  },
  preferences: {
    emailFrequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly', 'never'],
      default: 'daily'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  lastLoginAt: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsedAt: Date,
    deviceInfo: String
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.refreshTokens;
      return ret;
    }
  }
});

// Indexes
// Email index created automatically by unique: true
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update login tracking
UserSchema.methods.updateLoginInfo = function() {
  this.lastLoginAt = new Date();
  this.loginCount += 1;
  return this.save();
};

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Get public profile
UserSchema.methods.getPublicProfile = function() {
  const publicProfile = this.toObject();
  delete publicProfile.settings;
  delete publicProfile.preferences;
  delete publicProfile.refreshTokens;
  return publicProfile;
};

// Check if user can perform action
UserSchema.methods.canPerformAction = function(action) {
  if (this.status !== 'active') return false;
  
  const permissions = {
    admin: ['create', 'read', 'update', 'delete', 'manage'],
    moderator: ['create', 'read', 'update'],
    user: ['create', 'read', 'update_own']
  };
  
  return permissions[this.role]?.includes(action) || false;
};

// Static method to find by email
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get users with pagination
UserSchema.statics.getPaginated = function(page = 1, limit = 10, filters = {}) {
  const skip = (page - 1) * limit;
  
  return this.find(filters)
    .select('-password -refreshTokens')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('User', UserSchema);