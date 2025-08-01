const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    maxlength: [50000, 'Content cannot exceed 50000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  color: {
    type: String,
    enum: ['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'],
    default: 'default'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reminders: [{
    date: {
      type: Date,
      required: true
    },
    message: String,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  checklist: [{
    text: {
      type: String,
      required: true,
      maxlength: [200, 'Checklist item cannot exceed 200 characters']
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    order: {
      type: Number,
      default: 0
    }
  }],
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  wordCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
NoteSchema.index({ owner: 1 });
NoteSchema.index({ owner: 1, title: 'text', content: 'text' });
NoteSchema.index({ owner: 1, tags: 1 });
NoteSchema.index({ owner: 1, category: 1 });
NoteSchema.index({ owner: 1, isPinned: 1 });
NoteSchema.index({ owner: 1, isArchived: 1 });
NoteSchema.index({ owner: 1, isFavorite: 1 });
NoteSchema.index({ owner: 1, createdAt: -1 });
NoteSchema.index({ owner: 1, updatedAt: -1 });

// Calculate word count and reading time before saving
NoteSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Calculate word count
    const words = this.content.trim().split(/\s+/);
    this.wordCount = words.length;
    
    // Calculate reading time (average 200 words per minute)
    this.readingTime = Math.ceil(this.wordCount / 200);
    
    // Increment version
    if (!this.isNew) {
      this.version += 1;
    }
  }
  next();
});

// Virtual for completion percentage of checklist
NoteSchema.virtual('checklistProgress').get(function() {
  if (this.checklist.length === 0) return 0;
  const completed = this.checklist.filter(item => item.isCompleted).length;
  return Math.round((completed / this.checklist.length) * 100);
});

// Virtual for active reminders
NoteSchema.virtual('activeReminders').get(function() {
  return this.reminders.filter(reminder => 
    !reminder.isCompleted && reminder.date > new Date()
  );
});

// Make sure virtuals are included in JSON output
NoteSchema.set('toJSON', { virtuals: true });

// Toggle pin status
NoteSchema.methods.togglePin = function() {
  this.isPinned = !this.isPinned;
  return this.save();
};

// Toggle favorite status
NoteSchema.methods.toggleFavorite = function() {
  this.isFavorite = !this.isFavorite;
  return this.save();
};

// Archive/unarchive note
NoteSchema.methods.toggleArchive = function() {
  this.isArchived = !this.isArchived;
  return this.save();
};

// Add tag if not exists
NoteSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

// Remove tag
NoteSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Add checklist item
NoteSchema.methods.addChecklistItem = function(text) {
  const maxOrder = Math.max(...this.checklist.map(item => item.order), -1);
  this.checklist.push({
    text,
    order: maxOrder + 1
  });
  return this.save();
};

// Toggle checklist item
NoteSchema.methods.toggleChecklistItem = function(itemId) {
  const item = this.checklist.id(itemId);
  if (item) {
    item.isCompleted = !item.isCompleted;
    item.completedAt = item.isCompleted ? new Date() : null;
    return this.save();
  }
  return Promise.resolve(this);
};

// Check if user can access note
NoteSchema.methods.canUserAccess = function(userId, permission = 'read') {
  // Owner has full access
  if (this.owner.toString() === userId.toString()) {
    return true;
  }
  
  // Check if note is public and only read access is requested
  if (this.isPublic && permission === 'read') {
    return true;
  }
  
  // Check collaborators
  const collaborator = this.collaborators.find(c => 
    c.user.toString() === userId.toString()
  );
  
  if (!collaborator) return false;
  
  const permissionLevels = { read: 1, write: 2, admin: 3 };
  const userLevel = permissionLevels[collaborator.permission];
  const requiredLevel = permissionLevels[permission];
  
  return userLevel >= requiredLevel;
};

// Static method to search notes
NoteSchema.statics.searchNotes = function(userId, query, options = {}) {
  const {
    page = 1,
    limit = 20,
    tags = [],
    category,
    isPinned,
    isArchived = false,
    isFavorite,
    color
  } = options;
  
  const skip = (page - 1) * limit;
  
  let searchCriteria = {
    $or: [
      { owner: userId },
      { 
        collaborators: { 
          $elemMatch: { user: userId } 
        } 
      },
      { isPublic: true }
    ],
    isArchived
  };
  
  if (query) {
    searchCriteria.$text = { $search: query };
  }
  
  if (tags.length > 0) {
    searchCriteria.tags = { $in: tags };
  }
  
  if (category) {
    searchCriteria.category = category;
  }
  
  if (typeof isPinned === 'boolean') {
    searchCriteria.isPinned = isPinned;
  }
  
  if (typeof isFavorite === 'boolean') {
    searchCriteria.isFavorite = isFavorite;
  }
  
  if (color) {
    searchCriteria.color = color;
  }
  
  const sortCriteria = { isPinned: -1, updatedAt: -1 };
  if (query) {
    sortCriteria.score = { $meta: 'textScore' };
  }
  
  return this.find(searchCriteria)
    .populate('owner', 'name email avatar')
    .populate('collaborators.user', 'name email avatar')
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Note', NoteSchema);