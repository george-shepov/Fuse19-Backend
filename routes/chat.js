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
  // TODO: Implement chat creation
  res.json({
    success: true,
    message: 'Chat creation endpoint - TODO'
  });
}));

// @desc    Send message
// @route   POST /api/chat/:id/messages
// @access  Private
router.post('/:id/messages', asyncHandler(async (req, res) => {
  // TODO: Implement message sending
  res.json({
    success: true,
    message: 'Send message endpoint - TODO'
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
  
  res.json({
    success: true,
    message: 'Chat marked as read'
  });
}));

module.exports = router;