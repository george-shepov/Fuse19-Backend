const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  processedPath: {
    type: String
  },
  thumbnailPath: {
    type: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['image', 'video', 'document', 'other'],
    default: 'other'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  metadata: {
    width: Number,
    height: Number,
    duration: Number, // for videos
    pages: Number, // for documents
    description: String
  }
}, {
  timestamps: true
});

// Indexes
fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ category: 1 });
fileSchema.index({ createdAt: -1 });
fileSchema.index({ tags: 1 });

// Virtual for file type
fileSchema.virtual('fileType').get(function() {
  if (this.mimetype.startsWith('image/')) return 'image';
  if (this.mimetype.startsWith('video/')) return 'video';
  if (this.mimetype.includes('pdf') || this.mimetype.includes('document')) return 'document';
  return 'other';
});

// Pre-save middleware to set category
fileSchema.pre('save', function(next) {
  if (this.mimetype.startsWith('image/')) {
    this.category = 'image';
  } else if (this.mimetype.startsWith('video/')) {
    this.category = 'video';
  } else if (this.mimetype.includes('pdf') || this.mimetype.includes('document')) {
    this.category = 'document';
  } else {
    this.category = 'other';
  }
  next();
});

// Method to get file info
fileSchema.methods.getFileInfo = function() {
  return {
    id: this._id,
    originalName: this.originalName,
    filename: this.filename,
    mimetype: this.mimetype,
    size: this.size,
    url: this.url,
    thumbnailUrl: this.thumbnailUrl,
    category: this.category,
    fileType: this.fileType,
    uploadedAt: this.createdAt,
    tags: this.tags,
    metadata: this.metadata,
    isPublic: this.isPublic
  };
};

// Static method to find files by user
fileSchema.statics.findByUser = function(userId, options = {}) {
  const query = { uploadedBy: userId };
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to find public files
fileSchema.statics.findPublic = function(options = {}) {
  const query = { isPublic: true };
  
  if (options.category) {
    query.category = options.category;
  }

  return this.find(query)
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20);
};

module.exports = mongoose.model('File', fileSchema);