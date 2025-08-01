const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const Chat = require('../models/Chat');

const router = express.Router();

// Sample chat data for testing
const sampleChats = [
  {
    id: '1',
    name: 'General Discussion',
    type: 'group',
    participants: [
      { id: '1', name: 'John Doe', avatar: 'assets/images/avatars/male-01.jpg' },
      { id: '2', name: 'Jane Smith', avatar: 'assets/images/avatars/female-01.jpg' }
    ],
    lastMessage: {
      content: 'Hello everyone!',
      timestamp: new Date().toISOString(),
      sender: { id: '1', name: 'John Doe' }
    },
    unreadCount: 2
  }
];

// Temporary endpoint for testing without auth
router.get('/test', optionalAuth, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { chats: sampleChats }
  });
}));

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private (temporarily optional for testing)
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  // If user is authenticated, get real chats
  if (req.user) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    try {
      const chats = await Chat.getUserChats(req.user.id, page, limit);
      return res.json({
        success: true,
        data: { chats }
      });
    } catch (error) {
      // If database error, fall back to sample data
      console.log('Database error, using sample data:', error.message);
    }
  }

  // Return sample data for testing
  res.json({
    success: true,
    data: { chats: sampleChats }
  });
}));

// All other chat routes require authentication
router.use(auth);

// @desc    Get specific chat
// @route   GET /api/chat/:id
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id)
    .populate('participants.user', 'name email avatar')
    .populate('messages.sender', 'name avatar');
    
  if (!chat || !chat.isParticipant(req.user.id)) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }
  
  res.json({
    success: true,
    data: { chat }
  });
}));

// @desc    Create new chat
// @route   POST /api/chat
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const { name, description, type, participantIds } = req.body;
  
  // Validate chat type
  if (!['direct', 'group', 'channel'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid chat type'
    });
  }

  // For direct chats, ensure only 2 participants
  if (type === 'direct' && participantIds.length !== 1) {
    return res.status(400).json({
      success: false,
      message: 'Direct chats must have exactly 2 participants'
    });
  }

  // Check if direct chat already exists
  if (type === 'direct') {
    const existingChat = await Chat.findOne({
      type: 'direct',
      'participants.user': { $all: [req.user.id, participantIds[0]] },
      'participants.isActive': true
    });

    if (existingChat) {
      return res.json({
        success: true,
        data: { chat: existingChat }
      });
    }
  }

  // Create participants array
  const participants = [
    {
      user: req.user.id,
      role: 'owner',
      joinedAt: new Date()
    }
  ];

  // Add other participants
  participantIds.forEach(userId => {
    participants.push({
      user: userId,
      role: 'member',
      joinedAt: new Date()
    });
  });

  const chatData = {
    name: type === 'direct' ? null : name,
    description,
    type,
    participants,
    createdBy: req.user.id,
    settings: {
      isPrivate: type === 'direct' || req.body.isPrivate || false,
      allowInvites: type !== 'direct' && (req.body.allowInvites !== false),
      muteNotifications: false
    }
  };

  const chat = new Chat(chatData);
  await chat.save();

  // Populate participant data
  await chat.populate('participants.user', 'name email avatar');

  // Notify other participants via Socket.io
  const io = req.app.get('io');
  participants.forEach(participant => {
    if (participant.user.toString() !== req.user.id) {
      io.notifyUser(participant.user, 'chat:new-chat', {
        chat: chat.toObject(),
        createdBy: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        }
      });
    }
  });

  res.status(201).json({
    success: true,
    data: { chat }
  });
}));

// @desc    Send message
// @route   POST /api/chat/:id/messages
// @access  Private
router.post('/:id/messages', asyncHandler(async (req, res) => {
  const { content, messageType = 'text', attachments = [] } = req.body;
  const chatId = req.params.id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Message content is required'
    });
  }

  const chat = await Chat.findById(chatId);
  
  if (!chat || !chat.isParticipant(req.user.id)) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found or you are not a participant'
    });
  }

  const messageData = {
    sender: req.user.id,
    content: content.trim(),
    messageType,
    attachments: attachments.map(attachment => ({
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      url: attachment.url
    }))
  };

  // Add message to chat
  await chat.addMessage(messageData);
  
  // Get the newly added message with populated sender
  await chat.populate('messages.sender', 'name email avatar');
  const newMessage = chat.messages[chat.messages.length - 1];

  // Real-time notification via Socket.io
  const io = req.app.get('io');
  
  // Notify all participants except sender
  chat.participants.forEach(participant => {
    if (participant.user.toString() !== req.user.id && participant.isActive) {
      io.notifyUser(participant.user, 'chat:new-message', {
        chatId,
        message: newMessage.toObject(),
        chat: {
          id: chat._id,
          name: chat.name,
          type: chat.type
        }
      });
    }
  });

  // Broadcast to chat room
  io.notifyChat(chatId, 'chat:message-sent', {
    message: newMessage.toObject(),
    sender: {
      id: req.user.id,
      name: req.user.name,
      avatar: req.user.avatar
    }
  });

  res.status(201).json({
    success: true,
    data: { 
      message: newMessage,
      chatId 
    }
  });
}));

// @desc    Mark chat as read
// @route   PATCH /api/chat/:id/read
// @access  Private
router.patch('/:id/read', asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  
  if (!chat || !chat.isParticipant(req.user.id)) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }
  
  await chat.markAsRead(req.user.id);
  
  // Notify other participants that messages were read
  const io = req.app.get('io');
  chat.participants.forEach(participant => {
    if (participant.user.toString() !== req.user.id && participant.isActive) {
      io.notifyUser(participant.user, 'chat:messages-read', {
        chatId: req.params.id,
        readBy: {
          id: req.user.id,
          name: req.user.name
        }
      });
    }
  });

  res.json({
    success: true,
    message: 'Chat marked as read'
  });
}));

// @desc    Get chat messages with pagination
// @route   GET /api/chat/:id/messages
// @access  Private
router.get('/:id/messages', asyncHandler(async (req, res) => {
  const chatId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const chat = await Chat.findById(chatId);
  
  if (!chat || !chat.isParticipant(req.user.id)) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found or you are not a participant'
    });
  }

  // Get messages with pagination (newest first)
  const messages = chat.messages
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(skip, skip + limit)
    .reverse(); // Return in chronological order

  // Populate sender info
  await chat.populate('messages.sender', 'name email avatar');

  res.json({
    success: true,
    data: {
      messages,
      pagination: {
        current: page,
        hasMore: chat.messages.length > skip + limit,
        total: chat.messages.length
      }
    }
  });
}));

// @desc    Edit message
// @route   PUT /api/chat/:id/messages/:messageId
// @access  Private
router.put('/:id/messages/:messageId', asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { id: chatId, messageId } = req.params;

  const chat = await Chat.findById(chatId);
  
  if (!chat || !chat.isParticipant(req.user.id)) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found or you are not a participant'
    });
  }

  const message = chat.messages.id(messageId);
  
  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user is the sender
  if (message.sender.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'You can only edit your own messages'
    });
  }

  // Update message
  message.content = content.trim();
  message.isEdited = true;
  message.editedAt = new Date();

  await chat.save();

  // Real-time notification
  const io = req.app.get('io');
  io.notifyChat(chatId, 'chat:message-edited', {
    messageId,
    content: message.content,
    editedAt: message.editedAt,
    editedBy: {
      id: req.user.id,
      name: req.user.name
    }
  });

  res.json({
    success: true,
    data: { message }
  });
}));

// @desc    Delete message
// @route   DELETE /api/chat/:id/messages/:messageId
// @access  Private
router.delete('/:id/messages/:messageId', asyncHandler(async (req, res) => {
  const { id: chatId, messageId } = req.params;

  const chat = await Chat.findById(chatId);
  
  if (!chat || !chat.isParticipant(req.user.id)) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found or you are not a participant'
    });
  }

  const message = chat.messages.id(messageId);
  
  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user is the sender or chat admin/owner
  const participant = chat.getParticipant(req.user.id);
  const canDelete = message.sender.toString() === req.user.id || 
                   ['admin', 'owner'].includes(participant.role);

  if (!canDelete) {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own messages or need admin privileges'
    });
  }

  // Remove message
  message.deleteOne();
  await chat.save();

  // Real-time notification
  const io = req.app.get('io');
  io.notifyChat(chatId, 'chat:message-deleted', {
    messageId,
    deletedBy: {
      id: req.user.id,
      name: req.user.name
    }
  });

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
}));

// @desc    Add reaction to message
// @route   POST /api/chat/:id/messages/:messageId/reactions
// @access  Private
router.post('/:id/messages/:messageId/reactions', asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  const { id: chatId, messageId } = req.params;

  const chat = await Chat.findById(chatId);
  
  if (!chat || !chat.isParticipant(req.user.id)) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found or you are not a participant'
    });
  }

  const message = chat.messages.id(messageId);
  
  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user already reacted with this emoji
  const existingReaction = message.reactions.find(
    r => r.user.toString() === req.user.id && r.emoji === emoji
  );

  if (existingReaction) {
    // Remove existing reaction
    existingReaction.deleteOne();
  } else {
    // Add new reaction
    message.reactions.push({
      user: req.user.id,
      emoji,
      createdAt: new Date()
    });
  }

  await chat.save();

  // Real-time notification
  const io = req.app.get('io');
  io.notifyChat(chatId, 'chat:reaction-updated', {
    messageId,
    reactions: message.reactions,
    updatedBy: {
      id: req.user.id,
      name: req.user.name
    }
  });

  res.json({
    success: true,
    data: { reactions: message.reactions }
  });
}));

module.exports = router;