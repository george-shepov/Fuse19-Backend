require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const { connectCache } = require('./config/cache');
const { errorHandler } = require('./middleware/error');
const { configureSocket } = require('./config/socket');
const { specs, swaggerUi, swaggerConfig } = require('./config/swagger');
const { dynamicRateLimiter, addRateLimitHeaders } = require('./middleware/rateLimiter');
const { 
  httpRequestLogger, 
  addCorrelationId, 
  addRequestTiming, 
  logRequestDetails,
  logErrors
} = require('./middleware/logging');
const { info, error: logError } = require('./config/logger');
const { apiVersioning, versionedResponse } = require('./middleware/apiVersion');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const commonRoutes = require('./routes/common');
const dashboardRoutes = require('./routes/dashboard');
const chatRoutes = require('./routes/chat');
const contactsRoutes = require('./routes/contacts');
const notesRoutes = require('./routes/notes');
const tasksRoutes = require('./routes/tasks');
const fileManagerRoutes = require('./routes/fileManager');
const mailboxRoutes = require('./routes/mailbox');
const academyRoutes = require('./routes/academy');
const helpCenterRoutes = require('./routes/helpCenter');
const notificationsRoutes = require('./routes/notifications');
const messagesRoutes = require('./routes/messages');
const shortcutsRoutes = require('./routes/shortcuts');
const activitiesRoutes = require('./routes/activities');
const scrumboardRoutes = require('./routes/scrumboard');
const ecommerceRoutes = require('./routes/ecommerce');
const uploadRoutes = require('./routes/upload');
const passwordRoutes = require('./routes/password');
const adminRoutes = require('./routes/admin');
const versionRoutes = require('./routes/version');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:4200', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Connect to services
connectDB();
connectCache();

// Configure Socket.io
configureSocket(io);

// Make io available to routes
app.set('io', io);

// Logging middleware (early in the chain)
app.use(addCorrelationId);
app.use(addRequestTiming);
app.use(httpRequestLogger);
app.use(logRequestDetails);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS ?
      process.env.ALLOWED_ORIGINS.split(',') :
      ['http://localhost:4200', 'http://localhost:3000'];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override'
  ],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API versioning middleware
app.use('/api/', apiVersioning);
// app.use('/api/', versionedResponse); // Disabled to prevent double wrapping

// Rate limiting middleware
app.use(addRateLimitHeaders);
app.use('/api/', dynamicRateLimiter);

// Static file serving
app.use('/uploads', express.static('uploads'));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerConfig));

// API Documentation JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Fuse19 Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/common', commonRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/file-manager', fileManagerRoutes);
app.use('/api/mailbox', mailboxRoutes);
app.use('/api/academy', academyRoutes);
app.use('/api/help-center', helpCenterRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/shortcuts', shortcutsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/scrumboard', scrumboardRoutes);
app.use('/api/ecommerce', ecommerceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/version', versionRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Error logging middleware
app.use(logErrors);

// Error Handler (should be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

server.listen(PORT, () => {
  const message = `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`;
  const socketMessage = `📡 Socket.io server ready for real-time connections`;
  
  console.log(message);
  console.log(socketMessage);
  console.log(`📝 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`📊 Logs directory: ./logs/`);
  
  info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    pid: process.pid
  });
});

module.exports = app;