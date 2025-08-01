const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Fuse-compatible fields
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['task', 'section'],
    default: 'task'
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    min: 0,
    max: 3,
    default: 1 // 0=low, 1=medium, 2=high, 3=urgent
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  subTasks: [{
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    title: {
      type: String,
      required: true,
      maxlength: [200, 'Subtask title cannot exceed 200 characters']
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  order: {
    type: Number,
    default: 0
  },

  // Legacy fields for backward compatibility
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed', 'cancelled'],
    default: 'todo'
  },
  priorityString: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  dueDate: Date,
  startDate: Date,
  completedAt: Date,
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [1000, 'Estimated hours cannot exceed 1000']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    default: 0
  },
  assignees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  parentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  dependencies: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked-by', 'related'],
      default: 'blocks'
    }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date
  }],
  timeTracking: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    duration: Number, // in minutes
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  recurrence: {
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    interval: {
      type: Number,
      min: 1,
      default: 1
    },
    endDate: Date,
    occurrences: Number
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  originalTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  customFields: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select'],
      default: 'text'
    }
  }]
}, {
  timestamps: true
});

// Pre-save middleware for data transformation
TaskSchema.pre('save', async function(next) {
  // Sync between Fuse format and legacy format
  if (this.isModified('notes')) {
    this.description = this.notes;
  }
  if (this.isModified('description')) {
    this.notes = this.description;
  }

  // Sync completed status with status enum
  if (this.isModified('completed')) {
    if (this.completed) {
      this.status = 'completed';
      this.completedAt = new Date();
    } else if (this.status === 'completed') {
      this.status = 'todo';
      this.completedAt = null;
    }
  }

  if (this.isModified('status')) {
    this.completed = this.status === 'completed';
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = null;
    }
  }

  // Sync priority number with priority string
  if (this.isModified('priority') && typeof this.priority === 'number') {
    const priorityMap = { 0: 'low', 1: 'medium', 2: 'high', 3: 'urgent' };
    this.priorityString = priorityMap[this.priority] || 'medium';
  }

  if (this.isModified('priorityString')) {
    const priorityMap = { 'low': 0, 'medium': 1, 'high': 2, 'urgent': 3 };
    this.priority = priorityMap[this.priorityString] || 1;
  }

  next();
});

// Indexes
TaskSchema.index({ owner: 1 });
TaskSchema.index({ owner: 1, status: 1 });
TaskSchema.index({ owner: 1, priority: 1 });
TaskSchema.index({ owner: 1, dueDate: 1 });
TaskSchema.index({ owner: 1, category: 1 });
TaskSchema.index({ owner: 1, tags: 1 });
TaskSchema.index({ 'assignees.user': 1 });
TaskSchema.index({ project: 1 });
TaskSchema.index({ parentTask: 1 });
TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ updatedAt: -1 });

// Virtual for overdue status
TaskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.status !== 'completed' && new Date() > this.dueDate;
});

// Virtual for progress percentage based on subtasks
TaskSchema.virtual('progressPercentage').get(function() {
  if (this.subtasks.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  // This would need to be populated to calculate properly
  return 0;
});

// Virtual for time spent
TaskSchema.virtual('timeSpent').get(function() {
  return this.timeTracking.reduce((total, entry) => {
    return total + (entry.duration || 0);
  }, 0);
});

// Make sure virtuals are included in JSON output
TaskSchema.set('toJSON', { virtuals: true });

// Update status and set completion date
TaskSchema.methods.markAsCompleted = function(userId) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.lastUpdatedBy = userId;
  return this.save();
};

// Start task
TaskSchema.methods.startTask = function(userId) {
  this.status = 'in-progress';
  if (!this.startDate) {
    this.startDate = new Date();
  }
  this.lastUpdatedBy = userId;
  return this.save();
};

// Add comment
TaskSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    author: userId,
    content: content.trim()
  });
  return this.save();
};

// Add time tracking entry
TaskSchema.methods.addTimeEntry = function(userId, startTime, endTime, description) {
  const duration = endTime ? Math.round((endTime - startTime) / (1000 * 60)) : null;
  
  this.timeTracking.push({
    user: userId,
    startTime,
    endTime,
    duration,
    description
  });
  
  if (duration) {
    this.actualHours = (this.actualHours || 0) + (duration / 60);
  }
  
  return this.save();
};

// Check if user can access task
TaskSchema.methods.canUserAccess = function(userId) {
  // Owner can access
  if (this.owner.toString() === userId.toString()) {
    return true;
  }
  
  // Assignees can access
  if (this.assignees.some(a => a.user.toString() === userId.toString())) {
    return true;
  }
  
  // Watchers can access
  if (this.watchers.some(w => w.toString() === userId.toString())) {
    return true;
  }
  
  return false;
};

// Add watcher
TaskSchema.methods.addWatcher = function(userId) {
  if (!this.watchers.includes(userId)) {
    this.watchers.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Remove watcher
TaskSchema.methods.removeWatcher = function(userId) {
  this.watchers = this.watchers.filter(w => w.toString() !== userId.toString());
  return this.save();
};

// Static method to get user's tasks
TaskSchema.statics.getUserTasks = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    priority,
    category,
    assignedToMe = false,
    createdByMe = false,
    dueThisWeek = false,
    overdue = false
  } = options;
  
  const skip = (page - 1) * limit;
  
  let criteria = {
    $or: [
      { owner: userId },
      { 'assignees.user': userId },
      { watchers: userId }
    ]
  };
  
  if (assignedToMe) {
    criteria = { 'assignees.user': userId };
  }
  
  if (createdByMe) {
    criteria = { owner: userId };
  }
  
  if (status) {
    criteria.status = status;
  }
  
  if (priority) {
    criteria.priority = priority;
  }
  
  if (category) {
    criteria.category = category;
  }
  
  if (dueThisWeek) {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    criteria.dueDate = { $gte: now, $lte: weekFromNow };
  }
  
  if (overdue) {
    criteria.dueDate = { $lt: new Date() };
    criteria.status = { $nin: ['completed', 'cancelled'] };
  }
  
  return this.find(criteria)
    .populate('owner', 'name email avatar')
    .populate('assignees.user', 'name email avatar')
    .populate('project', 'name color')
    .sort({ priority: -1, dueDate: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get task statistics
TaskSchema.statics.getTaskStats = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { owner: userId },
          { 'assignees.user': userId }
        ]
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Task', TaskSchema);