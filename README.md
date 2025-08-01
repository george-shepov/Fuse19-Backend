# Fuse19 Node.js Backend

A comprehensive Node.js backend built for the Fuse Angular 19 template, providing REST APIs for all major modules including authentication, user management, chat, contacts, notes, tasks, and more.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens, role-based access control
- **User Management**: Complete user CRUD with profile management, settings, and admin controls
- **Chat System**: Real-time messaging with support for direct and group chats
- **Contact Management**: Full contact management with search, tagging, and organization
- **Notes & Tasks**: Rich note-taking and task management with collaboration features
- **Security**: Rate limiting, input validation, CORS, helmet protection
- **Caching**: Redis integration for improved performance
- **Error Handling**: Comprehensive error handling with detailed logging
- **Database**: MongoDB with Mongoose ODM
- **File Uploads**: Support for file attachments (planned)
- **Real-time**: Socket.io ready for real-time features (planned)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6 or higher) - optional but recommended
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone and Setup

```bash
cd /home/shepov/Documents/Source/Fuse19-Backend
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/fuse19
MONGO_TEST_URI=mongodb://localhost:27017/fuse19_test

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRE=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
```

### 3. Database Setup

Make sure MongoDB is running:

```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS with Homebrew
brew services start mongodb-community
```

### 4. Redis Setup (Optional)

```bash
# Ubuntu/Debian
sudo systemctl start redis-server

# macOS with Homebrew
brew services start redis
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:5000` with hot reloading enabled.

### Production Mode

```bash
npm start
```

### Seeding Data (Optional)

```bash
npm run seed
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| POST | `/auth/refresh` | Refresh access token | Public |
| GET | `/auth/me` | Get current user | Private |
| PUT | `/auth/profile` | Update user profile | Private |
| PUT | `/auth/change-password` | Change password | Private |
| POST | `/auth/logout` | Logout user | Private |
| POST | `/auth/logout-all` | Logout from all devices | Private |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/reset-password` | Reset password | Public |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users` | Get all users (paginated) | Admin |
| GET | `/users/:id` | Get user by ID | Private (Self/Admin) |
| PUT | `/users/:id` | Update user | Private (Self/Admin) |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/users/stats` | Get user statistics | Admin |
| GET | `/users/search` | Search users | Private |
| PATCH | `/users/:id/status` | Toggle user status | Admin |
| POST | `/users/bulk` | Bulk user operations | Admin |

### Chat Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/chat` | Get user's chats | Private |
| GET | `/chat/:id` | Get specific chat | Private |
| POST | `/chat` | Create new chat | Private |
| POST | `/chat/:id/messages` | Send message | Private |
| PATCH | `/chat/:id/read` | Mark chat as read | Private |

### Contacts Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/contacts` | Get user's contacts | Private |
| POST | `/contacts` | Create contact | Private |
| GET | `/contacts/:id` | Get contact by ID | Private |
| PUT | `/contacts/:id` | Update contact | Private |
| DELETE | `/contacts/:id` | Delete contact | Private |

### Notes Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/notes` | Get user's notes | Private |
| POST | `/notes` | Create note | Private |
| GET | `/notes/:id` | Get note by ID | Private |
| PUT | `/notes/:id` | Update note | Private |
| DELETE | `/notes/:id` | Delete note | Private |
| PATCH | `/notes/:id/pin` | Toggle note pin | Private |

### Tasks Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/tasks` | Get user's tasks | Private |
| POST | `/tasks` | Create task | Private |
| GET | `/tasks/:id` | Get task by ID | Private |
| PUT | `/tasks/:id` | Update task | Private |
| DELETE | `/tasks/:id` | Delete task | Private |

### Dashboard Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard/analytics` | Get analytics data | Private |
| GET | `/dashboard/project` | Get project data | Private |
| GET | `/dashboard/finance` | Get finance data | Private |
| GET | `/dashboard/crypto` | Get crypto data | Private |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Refresh

Access tokens expire after 24 hours (configurable). Use the refresh token to get a new access token:

```javascript
POST /api/auth/refresh
{
  "refreshToken": "your-refresh-token"
}
```

## 📊 Request/Response Format

### Standard Response Format

```javascript
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response Format

```javascript
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Pagination Format

```javascript
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment | No | development |
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `REDIS_URL` | Redis connection string | No | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRE` | JWT expiration time | No | 24h |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | http://localhost:4200 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | 100 |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
├── config/              # Configuration files
│   ├── db.js            # Database connection
│   └── cache.js         # Redis cache connection
├── controllers/         # Route controllers
│   ├── auth.js          # Authentication controller
│   └── users.js         # User management controller
├── middleware/          # Custom middleware
│   ├── auth.js          # Authentication middleware
│   └── error.js         # Error handling middleware
├── models/              # Database models
│   ├── User.js          # User model
│   ├── Chat.js          # Chat model
│   ├── Contact.js       # Contact model
│   ├── Note.js          # Note model
│   └── Task.js          # Task model
├── routes/              # API routes
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User routes
│   ├── chat.js          # Chat routes
│   ├── contacts.js      # Contact routes
│   ├── notes.js         # Note routes
│   ├── tasks.js         # Task routes
│   └── dashboard.js     # Dashboard routes
├── utils/               # Utility functions
│   └── crypto.js        # Cryptographic utilities
├── .env.example         # Environment variables example
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
└── server.js           # Application entry point
```

## 🔄 Integration with Fuse Angular Frontend

### 1. Update Angular Environment

In your Angular app's `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

### 2. Configure Proxy (Optional)

In `proxy.conf.json`:

```json
{
  "/api/*": {
    "target": "http://localhost:5000",
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true
  }
}
```

### 3. Update Angular Services

Replace the mock API calls in Fuse Angular services with actual HTTP calls to this backend.

Example for AuthService:

```typescript
// Before (mock)
signIn(credentials): Observable<any> {
  return this._httpClient.post('api/auth/sign-in', credentials);
}

// After (real API)
signIn(credentials): Observable<any> {
  return this._httpClient.post(`${environment.apiUrl}/auth/login`, credentials);
}
```

## 🚧 Next Steps & TODOs

### High Priority
- [ ] Implement file upload functionality
- [ ] Add Socket.io for real-time features
- [ ] Complete chat functionality (send messages, typing indicators)
- [ ] Add email verification system
- [ ] Implement password strength validation

### Medium Priority
- [ ] Add comprehensive API documentation (Swagger/OpenAPI)
- [ ] Implement rate limiting per user
- [ ] Add request/response logging
- [ ] Create database seeder with sample data
- [ ] Add API versioning

### Low Priority
- [ ] Add support for multiple languages
- [ ] Implement audit logging
- [ ] Add performance monitoring
- [ ] Create Docker configuration
- [ ] Add CI/CD pipeline

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
Solution: Make sure MongoDB is running and accessible.

**2. JWT Secret Missing**
```
Error: JWT secret not provided
```
Solution: Set `JWT_SECRET` in your `.env` file.

**3. CORS Errors**
```
Access to fetch at 'localhost:5000' from origin 'localhost:4200' has been blocked
```
Solution: Update `ALLOWED_ORIGINS` in `.env` file.

**4. Redis Connection Error**
```
Redis connection error: connect ECONNREFUSED
```
Solution: Install and start Redis, or remove `REDIS_URL` from `.env` to disable caching.

## 📞 Support

If you encounter any issues or need help with integration:

1. Check the troubleshooting section above
2. Review the API documentation
3. Check MongoDB and Redis are running
4. Verify your `.env` configuration
5. Check the server logs for detailed error messages

## 🏗️ Architecture

This backend follows a clean, modular architecture:

- **Controllers**: Handle HTTP requests and responses
- **Models**: Define data structures and business logic
- **Middleware**: Handle cross-cutting concerns (auth, validation, errors)
- **Routes**: Define API endpoints and apply middleware
- **Utils**: Shared utility functions
- **Config**: Database and cache connections

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS protection
- Helmet for security headers
- Input validation and sanitization
- SQL injection protection through Mongoose
- XSS protection through proper data handling

---

**Happy Coding! 🚀**