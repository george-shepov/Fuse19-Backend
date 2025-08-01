const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
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
  company: {
    type: String,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  position: {
    type: String,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  avatar: {
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
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  birthday: Date,
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