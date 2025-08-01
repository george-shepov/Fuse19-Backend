const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Fuse-compatible fields
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  // Multiple emails array (Fuse format)
  emails: [{
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    label: {
      type: String,
      enum: ['Personal', 'Work', 'Other'],
      default: 'Personal'
    }
  }],
  // Multiple phone numbers array (Fuse format)
  phoneNumbers: [{
    country: {
      type: String,
      default: 'us'
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    label: {
      type: String,
      enum: ['Mobile', 'Work', 'Home', 'Other'],
      default: 'Mobile'
    }
  }],
  title: {
    type: String,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  company: {
    type: String,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  // Single address string (Fuse format)
  address: {
    type: String,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  background: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  birthday: Date,

  // Legacy fields for backward compatibility
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  structuredAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },

  // Additional fields
  isFavorite: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String,
    website: String
  },
  customFields: [{
    label: {
      type: String,
      required: true,
      maxlength: [50, 'Custom field label cannot exceed 50 characters']
    },
    value: {
      type: String,
      maxlength: [200, 'Custom field value cannot exceed 200 characters']
    },
    type: {
      type: String,
      enum: ['text', 'email', 'phone', 'url', 'date'],
      default: 'text'
    }
  }],
  lastContactedAt: Date,
  source: {
    type: String,
    enum: ['manual', 'import', 'form', 'api'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Pre-save middleware for data transformation
ContactSchema.pre('save', async function(next) {
  // Sync between Fuse format and legacy format
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.name = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  if (this.isModified('name') && !this.firstName && !this.lastName) {
    const nameParts = this.name.split(' ');
    this.firstName = nameParts[0] || '';
    this.lastName = nameParts.slice(1).join(' ') || '';
  }

  // Sync single email with emails array
  if (this.isModified('email') && this.email) {
    if (!this.emails || this.emails.length === 0) {
      this.emails = [{ email: this.email, label: 'Personal' }];
    } else if (this.emails[0].email !== this.email) {
      this.emails[0] = { email: this.email, label: this.emails[0].label || 'Personal' };
    }
  }

  // Sync single phone with phoneNumbers array
  if (this.isModified('phone') && this.phone) {
    if (!this.phoneNumbers || this.phoneNumbers.length === 0) {
      this.phoneNumbers = [{ phoneNumber: this.phone, country: 'us', label: 'Mobile' }];
    } else if (this.phoneNumbers[0].phoneNumber !== this.phone) {
      this.phoneNumbers[0].phoneNumber = this.phone;
    }
  }

  // Sync position with title
  if (this.isModified('position')) {
    this.title = this.position;
  }
  if (this.isModified('title')) {
    this.position = this.title;
  }

  next();
});

// Indexes
ContactSchema.index({ owner: 1 });
ContactSchema.index({ owner: 1, firstName: 1, lastName: 1 });
ContactSchema.index({ owner: 1, email: 1 });
ContactSchema.index({ owner: 1, company: 1 });
ContactSchema.index({ owner: 1, tags: 1 });
ContactSchema.index({ owner: 1, isFavorite: 1 });
ContactSchema.index({ owner: 1, createdAt: -1 });

// Virtual for full name
ContactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Virtual for initials
ContactSchema.virtual('initials').get(function() {
  const firstInitial = this.firstName ? this.firstName.charAt(0).toUpperCase() : '';
  const lastInitial = this.lastName ? this.lastName.charAt(0).toUpperCase() : '';
  return `${firstInitial}${lastInitial}`;
});

// Make sure virtuals are included in JSON output
ContactSchema.set('toJSON', { virtuals: true });

// Update last contacted timestamp
ContactSchema.methods.updateLastContacted = function() {
  this.lastContactedAt = new Date();
  return this.save();
};

// Toggle favorite status
ContactSchema.methods.toggleFavorite = function() {
  this.isFavorite = !this.isFavorite;
  return this.save();
};

// Add tag if not exists
ContactSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

// Remove tag
ContactSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Static method to search contacts
ContactSchema.statics.searchContacts = function(userId, query, options = {}) {
  const {
    page = 1,
    limit = 20,
    tags = [],
    isFavorite,
    company
  } = options;
  
  const skip = (page - 1) * limit;
  
  let searchCriteria = { owner: userId };
  
  if (query) {
    const searchRegex = new RegExp(query, 'i');
    searchCriteria.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { company: searchRegex },
      { phone: searchRegex }
    ];
  }
  
  if (tags.length > 0) {
    searchCriteria.tags = { $in: tags };
  }
  
  if (typeof isFavorite === 'boolean') {
    searchCriteria.isFavorite = isFavorite;
  }
  
  if (company) {
    searchCriteria.company = new RegExp(company, 'i');
  }
  
  return this.find(searchCriteria)
    .sort({ firstName: 1, lastName: 1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get contact statistics
ContactSchema.statics.getStats = function(userId) {
  return this.aggregate([
    { $match: { owner: userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        favorites: { $sum: { $cond: ['$isFavorite', 1, 0] } },
        withCompany: { $sum: { $cond: [{ $ne: ['$company', null] }, 1, 0] } },
        withEmail: { $sum: { $cond: [{ $ne: ['$email', null] }, 1, 0] } },
        withPhone: { $sum: { $cond: [{ $ne: ['$phone', null] }, 1, 0] } }
      }
    }
  ]);
};

module.exports = mongoose.model('Contact', ContactSchema);