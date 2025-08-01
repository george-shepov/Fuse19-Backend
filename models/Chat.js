const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const ChatSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: [100, 'Chat name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['direct', 'group', 'channel'],
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'owner'],
      default: 'member'
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  messages: [MessageSchema],
  settings: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    allowInvites: {
      type: Boolean,
      default: true
    },
    muteNotifications: {
      type: Boolean,
      default: false
    }
  },
  avatar: String,
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
ChatSchema.index({ participants: 1 });
ChatSchema.index({ type: 1 });
ChatSchema.index({ lastActivity: -1 });
ChatSchema.index({ 'messages.createdAt': -1 });

// Update last activity when message is added
ChatSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.lastActivity = new Date();
  return this.save();
};

// Get unread messages count for a user
ChatSchema.methods.getUnreadCount = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) return 0;
  
  return this.messages.filter(message => 
    message.createdAt > participant.lastReadAt &&
    message.sender.toString() !== userId.toString()
  ).length;
};

// Mark messages as read for a user
ChatSchema.methods.markAsRead = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.lastReadAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Check if user is participant
ChatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => 
    p.user.toString() === userId.toString() && p.isActive
  );
};

// Get participant info
ChatSchema.methods.getParticipant = function(userId) {
  return this.participants.find(p => p.user.toString() === userId.toString());
};

// Static method to get user's chats
ChatSchema.statics.getUserChats = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    'participants.user': userId,
    'participants.isActive': true
  })
  .populate('participants.user', 'name email avatar')
  .populate('messages.sender', 'name avatar')
  .sort({ lastActivity: -1 })
  .skip(skip)
  .limit(limit);
};

module.exports = mongoose.model('Chat', ChatSchema);