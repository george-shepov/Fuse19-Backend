const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Socket.io authentication middleware
const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error - No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error - User not found'));
    }

    socket.userId = user.id;
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error - Invalid token'));
  }
};

// Socket.io configuration
const configureSocket = (io) => {
  // Authentication middleware
  io.use(socketAuth);

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} (${socket.userId}) connected`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle user going online
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
      user: {
        id: socket.user.id,
        name: socket.user.name,
        email: socket.user.email,
        avatar: socket.user.avatar
      }
    });

    // Chat message handling
    socket.on('chat:join', (chatId) => {
      socket.join(`chat:${chatId}`);
      socket.to(`chat:${chatId}`).emit('user:joined-chat', {
        userId: socket.userId,
        user: socket.user,
        chatId
      });
    });

    socket.on('chat:leave', (chatId) => {
      socket.leave(`chat:${chatId}`);
      socket.to(`chat:${chatId}`).emit('user:left-chat', {
        userId: socket.userId,
        user: socket.user,
        chatId
      });
    });

    socket.on('chat:message', (data) => {
      const { chatId, message, tempId } = data;
      
      // Broadcast to all users in the chat room
      socket.to(`chat:${chatId}`).emit('chat:new-message', {
        chatId,
        message: {
          ...message,
          sender: socket.user,
          timestamp: new Date().toISOString()
        },
        tempId
      });
    });

    socket.on('chat:typing-start', (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit('chat:user-typing', {
        chatId,
        userId: socket.userId,
        user: socket.user,
        isTyping: true
      });
    });

    socket.on('chat:typing-stop', (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit('chat:user-typing', {
        chatId,
        userId: socket.userId,
        user: socket.user,
        isTyping: false
      });
    });

    // Task updates
    socket.on('task:update', (data) => {
      const { taskId, update } = data;
      
      // Broadcast task update to all interested users
      socket.broadcast.emit('task:updated', {
        taskId,
        update,
        updatedBy: socket.user
      });
    });

    // Note updates
    socket.on('note:update', (data) => {
      const { noteId, update } = data;
      
      // Broadcast note update to all interested users
      socket.broadcast.emit('note:updated', {
        noteId,
        update,
        updatedBy: socket.user
      });
    });

    // File upload progress
    socket.on('upload:progress', (data) => {
      const { uploadId, progress } = data;
      
      // Send progress update to user's room
      socket.to(`user:${socket.userId}`).emit('upload:progress-update', {
        uploadId,
        progress
      });
    });

    // Notifications
    socket.on('notification:mark-read', (notificationId) => {
      socket.to(`user:${socket.userId}`).emit('notification:read', {
        notificationId,
        readBy: socket.userId
      });
    });

    // Collaboration events
    socket.on('collaborate:join', (documentId) => {
      socket.join(`document:${documentId}`);
      socket.to(`document:${documentId}`).emit('collaborate:user-joined', {
        documentId,
        user: socket.user
      });
    });

    socket.on('collaborate:leave', (documentId) => {
      socket.leave(`document:${documentId}`);
      socket.to(`document:${documentId}`).emit('collaborate:user-left', {
        documentId,
        user: socket.user
      });
    });

    socket.on('collaborate:cursor', (data) => {
      const { documentId, cursor } = data;
      socket.to(`document:${documentId}`).emit('collaborate:cursor-update', {
        documentId,
        userId: socket.userId,
        cursor
      });
    });

    // Dashboard updates
    socket.on('dashboard:update', (data) => {
      socket.broadcast.emit('dashboard:data-changed', {
        ...data,
        updatedBy: socket.user
      });
    });

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.user.name} (${socket.userId}) disconnected: ${reason}`);
      
      // Broadcast user going offline
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        user: socket.user
      });

      // Clean up typing indicators
      socket.broadcast.emit('chat:user-typing', {
        userId: socket.userId,
        user: socket.user,
        isTyping: false
      });
    });

    // Error handler
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Broadcast system notifications
  const broadcastNotification = (notification) => {
    io.emit('notification:system', notification);
  };

  // Broadcast to specific user
  const notifyUser = (userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  // Broadcast to chat room
  const notifyChat = (chatId, event, data) => {
    io.to(`chat:${chatId}`).emit(event, data);
  };

  // Store broadcast functions on io for external access
  io.broadcastNotification = broadcastNotification;
  io.notifyUser = notifyUser;
  io.notifyChat = notifyChat;

  return io;
};

module.exports = {
  socketAuth,
  configureSocket
};