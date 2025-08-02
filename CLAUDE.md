# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Fuse19-Backend, a production-ready Node.js backend built for the Fuse Angular 19 template. It provides comprehensive backend services including authentication, real-time communication, file management, and API services for a full-stack application.

## Architecture

### Core Stack
- **Backend**: Node.js + Express.js + MongoDB + Socket.io
- **Frontend**: Angular 19 (in `/demo` and `/starter` directories)
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for rate limiting and sessions
- **Testing**: Jest (unit) + Playwright (E2E)

### Project Structure
```
├── server.js                  # Main application entry point
├── config/                    # Configuration modules (db, cache, logging, swagger)
├── controllers/               # Business logic for API endpoints
├── middleware/                # Custom middleware (auth, logging, rate limiting)
├── models/                    # Mongoose database models
├── routes/                    # API route definitions
├── utils/                     # Utility functions and helpers
├── tests/                     # Test suites (unit & E2E)
├── demo/                      # Angular demo application
├── starter/                   # Angular starter template
└── uploads/                   # File storage directory
```

## Common Development Commands

### Backend Development
```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Seed database with sample data
npm run seed

# Clear all database data
npm run seed:clear
```

### Testing Commands
```bash
# Install Playwright browsers (first time)
npm run test:e2e:install

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Frontend Development (Angular)
```bash
# Demo application
cd demo
npm install
npm start  # Runs on http://localhost:4200

# Starter template
cd starter
npm install
npm start  # Runs on http://localhost:4200
```

## Environment Configuration

The project uses environment variables for configuration. Key variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/fuse19
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=24h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# CORS
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
```

## Key Features and Components

### Authentication System
- JWT-based authentication with refresh tokens
- Email verification flow
- Password strength validation
- Role-based access control (admin, manager, user)
- Located in: `controllers/auth.js`, `middleware/auth.js`, `routes/auth.js`

### Real-Time Communication
- Socket.io integration for live chat
- User presence tracking
- Typing indicators
- Configuration in: `config/socket.js`

### File Management
- Multi-file upload support
- Image processing with Sharp
- File type validation
- Secure storage in organized directories
- Located in: `controllers/upload.js`, `middleware/upload.js`, `routes/upload.js`

### API Features
- RESTful API design with consistent patterns
- API versioning support (URL, headers, query params)
- Swagger/OpenAPI documentation at `/api-docs`
- Rate limiting with Redis support
- Comprehensive logging with Winston

### Database Models
Core models include:
- **User**: Authentication and profile data
- **Contact**: Contact management with relationships
- **Note**: Note-taking with tags and categories
- **Task**: Task management with priorities
- **Chat**: Real-time messaging
- **File**: File upload metadata

## Testing Architecture

### E2E Testing with Playwright
- Test configuration: `playwright.config.js`
- Test specs: `tests/e2e/specs/`
- Covers API endpoints, authentication, real-time features
- Database seeding and cleanup between tests

### Unit Testing with Jest
- Configuration: `jest.config.js`
- Test files: `tests/unit/`
- Focuses on controllers, models, and utilities

## API Documentation

Interactive API documentation is available at `/api-docs` when the server is running. The API follows RESTful conventions:

### Core Endpoints
- **Auth**: `/api/auth/*` - Authentication and user management
- **Users**: `/api/users/*` - User CRUD operations
- **Contacts**: `/api/contacts/*` - Contact management
- **Notes**: `/api/notes/*` - Note operations
- **Tasks**: `/api/tasks/*` - Task management
- **Chat**: `/api/chat/*` - Messaging system
- **Upload**: `/api/upload/*` - File upload/management

### Health Checks
- `/health` - Basic health check
- `/api/health` - Detailed API health information
- `/api/version` - API version information

## Development Workflow

1. **Database**: Ensure MongoDB is running
2. **Redis** (optional): For rate limiting and caching
3. **Backend**: Start with `npm run dev`
4. **Frontend**: Start Angular app with `npm start` in demo/ or starter/
5. **Testing**: Run `npm run test:e2e` for comprehensive testing

## Integration with Frontend

The Angular applications are configured to work with the backend via:
- Proxy configuration in `proxy.conf.json`
- Environment settings for API endpoints
- JWT token handling in HTTP interceptors
- Socket.io client integration for real-time features

## Production Considerations

- Set strong JWT secrets
- Configure MongoDB indexes
- Enable Redis for production caching
- Set up log rotation
- Configure CORS for production domains
- Use environment-specific configurations

## Logging and Monitoring

- Structured logging with Winston
- Separate log files: combined.log, error.log, http.log, security.log
- Request correlation IDs for tracking
- Performance monitoring with request timing
- Security audit logs

## Common Patterns

- **Error Handling**: Centralized error middleware in `middleware/error.js`
- **Validation**: Input validation using express-validator
- **Authentication**: JWT middleware protects all `/api/*` routes except auth endpoints
- **CORS**: Configured for development and production origins
- **Rate Limiting**: IP-based and user-based limits with Redis