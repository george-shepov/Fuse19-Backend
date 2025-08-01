# Fuse19 Production-Ready Backend

A comprehensive, production-ready Node.js backend built for the Fuse Angular 19 template, featuring advanced authentication, real-time communication, file management, comprehensive testing, and enterprise-grade features.

## 🌟 Overview

This backend provides a complete foundation for modern web applications with production-ready features including real-time chat, file uploads, email verification, comprehensive testing, API documentation, and advanced monitoring.

## ✨ Key Features

### 🔐 **Authentication & Security**
- **JWT Authentication** with access & refresh tokens
- **Email Verification** with beautiful HTML templates
- **Password Strength Validation** with advanced scoring algorithm
- **Role-Based Access Control** (Admin, Manager, User)
- **Rate Limiting** with Redis support and per-user limits
- **Security Headers** with Helmet.js
- **Input Validation** with comprehensive sanitization

### 💬 **Real-Time Communication**
- **Socket.io Integration** for real-time features
- **Live Chat System** with typing indicators
- **User Presence** tracking (online/offline status)
- **Real-time Notifications** and updates
- **Message History** with pagination

### 📁 **File Management**
- **File Upload System** with drag & drop support
- **Image Processing** with Sharp (resize, optimize, WebP conversion)
- **File Type Validation** and size limits
- **Secure File Storage** with organized directory structure
- **Upload Progress Tracking** with cancellation support

### 📧 **Email System**
- **Professional Email Templates** (verification, password reset, welcome)
- **Nodemailer Integration** with SMTP support
- **Email Queue Management** for reliable delivery
- **Template Engine** for dynamic content

### 🗃️ **Database & Models**
- **MongoDB** with Mongoose ODM
- **Advanced Schema Design** with relationships
- **Data Validation** with custom validators
- **Indexing** for optimal performance
- **Database Seeding** with realistic sample data

### 📊 **Monitoring & Logging**
- **Winston Logger** with structured logging
- **Request/Response Logging** with correlation IDs
- **Performance Monitoring** with request timing
- **Error Tracking** with detailed stack traces
- **Security Logging** for audit trails

### 🔧 **API Features**
- **RESTful API Design** with consistent patterns
- **API Versioning** (URL, headers, query params)
- **Comprehensive Documentation** with Swagger/OpenAPI
- **Interactive API Explorer** at `/api-docs`
- **Health Check Endpoints** for monitoring

### 🧪 **Testing Suite**
- **Playwright E2E Testing** with 40+ test scenarios
- **API Testing** with automated request/response validation
- **Database Testing** with in-memory MongoDB
- **Real-time Testing** for Socket.io functionality
- **Test Reports** with HTML output and screenshots

## 📋 Prerequisites

- **Node.js** v18+ (LTS recommended)
- **MongoDB** v5.0+ (or MongoDB Atlas)
- **Redis** v6+ (optional but recommended for caching/rate limiting)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Installation
```bash
git clone <repository-url>
cd Fuse19-Backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/fuse19
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourapp.com
FROM_NAME=Your App Name

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,txt

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
```

### 3. Start Services
```bash
# Start MongoDB (if local)
sudo systemctl start mongod

# Start Redis (if local)
sudo systemctl start redis-server

# Start the application
npm run dev
```

### 4. Seed Sample Data
```bash
npm run seed
```

The server will start at `http://localhost:5000` with API documentation at `http://localhost:5000/api-docs`.

## 📚 API Documentation

### Interactive Documentation
Visit `http://localhost:5000/api-docs` for the complete Swagger/OpenAPI documentation with interactive testing.

### Core Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

#### File Management
- `POST /api/upload` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload/:id` - Get file info
- `DELETE /api/upload/:id` - Delete file

#### Real-time Features
- Socket.io connection at `/socket.io`
- Events: `join-room`, `send-message`, `typing-start`, `typing-stop`

#### CRUD Operations
Full CRUD operations available for:
- **Users** (`/api/users`)
- **Contacts** (`/api/contacts`) 
- **Notes** (`/api/notes`)
- **Tasks** (`/api/tasks`)
- **Chat** (`/api/chat`)

## 🧪 Testing

### Run E2E Tests
```bash
# Install Playwright browsers
npm run test:e2e:install

# Run all E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Test Coverage
- **40+ E2E test scenarios**
- **API endpoint testing**
- **Authentication flows**
- **Real-time functionality**
- **File upload/download**
- **Database operations**

## 📊 Database Seeding

### Available Commands
```bash
# Seed all data
npm run seed

# Clear all data
npm run seed:clear

# Seed specific data types
npm run seed:users
npm run seed:contacts
npm run seed:notes
npm run seed:tasks

# Production seeding (with confirmation)
npm run seed:prod
```

### Sample Data Created
- **3 Users** (Admin, Manager, Regular User)
- **50+ Contacts** with realistic information
- **25+ Notes** with various categories and tags
- **30+ Tasks** with different priorities and statuses
- **File uploads** with sample documents and images

## 🔧 Advanced Configuration

### API Versioning
The API supports multiple versioning strategies:
```bash
# URL Path
GET /api/v1/users

# Header
GET /api/users
X-API-Version: v1

# Accept Header
GET /api/users
Accept: application/vnd.fuse19.v1+json

# Query Parameter
GET /api/users?version=v1
```

### Rate Limiting Configuration
```env
# Per-IP rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # 100 requests per window

# Per-user rate limiting (requires Redis)
USER_RATE_LIMIT_REQUESTS=1000  # Per day
ADMIN_RATE_LIMIT_REQUESTS=5000 # Per day
```

### Logging Configuration
```env
LOG_LEVEL=info
LOG_DIR=./logs
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5
```

## 🏗️ Project Structure

```
├── config/                 # Configuration modules
│   ├── db.js              # MongoDB connection
│   ├── cache.js           # Redis connection
│   ├── email.js           # Email service setup
│   ├── logger.js          # Winston logger config
│   ├── socket.js          # Socket.io configuration
│   └── swagger.js         # API documentation config
├── controllers/           # Business logic controllers
│   ├── auth.js           # Authentication logic
│   ├── upload.js         # File upload handling
│   └── users.js          # User management
├── middleware/            # Custom middleware
│   ├── auth.js           # JWT authentication
│   ├── upload.js         # File upload middleware
│   ├── rateLimiter.js    # Rate limiting
│   ├── logging.js        # Request/response logging
│   ├── apiVersion.js     # API versioning
│   └── error.js          # Error handling
├── models/               # Database models
│   ├── User.js           # User model with email verification
│   ├── Contact.js        # Contact model with relationships
│   ├── Note.js           # Note model with tags
│   ├── Task.js           # Task model with priorities
│   ├── Chat.js           # Chat model for messaging
│   └── File.js           # File model for uploads
├── routes/               # API route definitions
│   ├── auth.js           # Authentication routes
│   ├── upload.js         # File upload routes
│   ├── users.js          # User management routes
│   ├── contacts.js       # Contact management routes
│   ├── notes.js          # Note management routes
│   ├── tasks.js          # Task management routes
│   ├── chat.js           # Chat/messaging routes
│   ├── admin.js          # Admin-only routes
│   ├── password.js       # Password validation routes
│   └── version.js        # API version info routes
├── seeders/              # Database seeding scripts
│   ├── index.js          # Main seeder orchestrator
│   ├── users.js          # User data seeding
│   ├── contacts.js       # Contact data seeding
│   ├── notes.js          # Note data seeding
│   └── tasks.js          # Task data seeding
├── tests/                # Testing suite
│   └── e2e/              # End-to-end tests
│       ├── specs/        # Test specifications
│       ├── utils/        # Test utilities
│       ├── fixtures/     # Test data
│       └── global-setup.js # Test environment setup
├── utils/                # Utility functions
│   ├── crypto.js         # Cryptographic utilities
│   └── passwordValidator.js # Password strength validation
├── uploads/              # File storage directory
│   ├── images/           # Image uploads
│   ├── documents/        # Document uploads
│   └── files/            # General file uploads
├── logs/                 # Application logs
│   ├── combined.log      # All logs
│   ├── error.log         # Error logs
│   ├── http.log          # HTTP request logs
│   └── security.log      # Security-related logs
└── server.js             # Application entry point
```

## 🔄 Frontend Integration

### Angular Integration
1. **Update environment configuration**:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  socketUrl: 'http://localhost:5000'
};
```

2. **Configure HTTP interceptor** for JWT tokens
3. **Set up Socket.io client** for real-time features
4. **Implement file upload components** with progress tracking

### Proxy Configuration
```json
{
  "/api/*": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true
  },
  "/socket.io/*": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true,
    "ws": true
  }
}
```

## 🚨 Production Deployment

### Environment Variables
Ensure these are set in production:
```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
MONGO_URI=<production-mongodb-url>
REDIS_URL=<production-redis-url>
SMTP_HOST=<production-smtp-server>
```

### Performance Optimizations
- **Enable Redis caching** for rate limiting and sessions
- **Configure MongoDB indexes** for optimal query performance
- **Set up log rotation** to manage disk space
- **Enable request compression** with gzip
- **Configure CORS** for production domains

### Security Checklist
- ✅ Strong JWT secrets configured
- ✅ HTTPS enabled in production
- ✅ Rate limiting configured
- ✅ File upload restrictions in place
- ✅ Input validation on all endpoints
- ✅ Error messages don't expose sensitive data
- ✅ Security headers configured with Helmet

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running: `sudo systemctl start mongod`
- Check connection string in `.env`

**File Upload Fails**
- Check `MAX_FILE_SIZE` and `ALLOWED_FILE_TYPES` in `.env`
- Ensure `uploads/` directory exists and is writable
- Verify file type is in allowed list

**Socket.io Connection Issues** 
- Check CORS configuration includes your frontend URL
- Ensure both frontend and backend are running
- Verify JWT token is being sent with Socket.io handshake

**Email Not Sending**
- Verify SMTP credentials in `.env`
- Check that "Less secure app access" is enabled (Gmail)
- Consider using App Passwords for Gmail

## 📈 Monitoring & Maintenance

### Log Files
- **combined.log** - All application logs
- **error.log** - Error logs only
- **http.log** - HTTP request/response logs
- **security.log** - Authentication and security events
- **performance.log** - Performance metrics

### Health Endpoints
- `GET /health` - Basic health check
- `GET /api/health` - API health with detailed info
- `GET /api/version` - API version information

### Performance Monitoring
```bash
# View real-time logs
tail -f logs/combined.log

# Monitor error logs
tail -f logs/error.log

# Check performance metrics
tail -f logs/performance.log
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Run the test suite: `npm run test:e2e`
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- **API Docs**: `http://localhost:5000/api-docs`
- **E2E Testing Guide**: `README-E2E-TESTS.md`

### Getting Help
1. Check the troubleshooting section above
2. Review the comprehensive API documentation
3. Run the E2E tests to verify your setup
4. Check application logs for detailed error information

---

## 🏆 Production-Ready Features Summary

✅ **Authentication & Security** - JWT, email verification, password validation  
✅ **Real-time Communication** - Socket.io, chat, typing indicators  
✅ **File Management** - Upload, processing, validation, storage  
✅ **Email System** - Templates, verification, password reset  
✅ **Database** - MongoDB, seeding, relationships, validation  
✅ **Monitoring** - Logging, performance, health checks  
✅ **API Features** - Versioning, documentation, rate limiting  
✅ **Testing** - Comprehensive E2E test suite with 40+ scenarios  
✅ **Documentation** - Complete API docs and setup guides  

**This backend is production-ready and suitable for enterprise applications!** 🚀

---

*Built with ❤️ for the Fuse Angular 19 template*