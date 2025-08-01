# Fuse19 Full-Stack Development Guide

This guide explains how to work with the integrated Fuse19 Angular frontend and Node.js backend.

## 🏗️ Project Structure

```
Fuse19-Backend/
├── 🔧 Backend (Node.js + Express + MongoDB)
│   ├── server.js              # Main server file
│   ├── routes/                # API routes
│   ├── controllers/           # Business logic
│   ├── models/                # Database models
│   ├── middleware/            # Auth & error handling
│   └── config/                # Database configuration
├── 🌐 demo/                   # Angular demo application
│   ├── src/app/               # Angular app source
│   ├── proxy.conf.json        # Proxy config for API calls
│   └── angular.json           # Angular configuration
├── 🌐 starter/                # Angular starter template
└── 📚 Documentation and utilities
```

## 🚀 Quick Start

### Option 1: Automated Start (Recommended)
```bash
# Start both backend and frontend
./start-dev.sh

# Stop both servers
./stop-dev.sh
```

### Option 2: Manual Start

#### 1. Start MongoDB
```bash
# Using Docker (recommended)
docker run -d --name fuse19-mongodb -p 27017:27017 mongo:6.0

# Or install MongoDB locally and start
mongod
```

#### 2. Start Backend Server
```bash
# Install dependencies (first time only)
npm install

# Start in development mode
npm run dev
# Backend runs on http://localhost:5000
```

#### 3. Start Frontend (Demo App)
```bash
cd demo

# Install dependencies (first time only)
npm install

# Start Angular development server
npm start
# Frontend runs on http://localhost:4200
```

## 🔄 API Integration

The Angular apps are configured to work with both **mock APIs** (original) and **real backend APIs** (new).

### Environment Configuration

**File: `demo/src/environments/environment.ts`**
```typescript
export const environment = {
    production: false,
    apiUrl: 'http://localhost:5000/api',
    useRealApi: true  // Set to false to use mock APIs
};
```

### API Endpoint Mapping

| Frontend Call | Mock API | Real Backend API |
|---------------|----------|------------------|
| Auth Login | `api/auth/sign-in` | `http://localhost:5000/api/auth/login` |
| Auth Register | `api/auth/sign-up` | `http://localhost:5000/api/auth/register` |
| Get Contacts | `api/apps/contacts/all` | `http://localhost:5000/api/contacts` |
| Create Contact | `api/apps/contacts/contact` | `http://localhost:5000/api/contacts` |
| Update Contact | `api/apps/contacts/contact` | `http://localhost:5000/api/contacts/:id` |
| Delete Contact | `api/apps/contacts/contact` | `http://localhost:5000/api/contacts/:id` |

## 🔐 Authentication Flow

The app uses JWT-based authentication:

1. **Login**: User provides email/password
2. **Backend**: Validates credentials, returns JWT token
3. **Frontend**: Stores token in localStorage
4. **API Calls**: Token sent in Authorization header
5. **Backend**: Validates token for protected routes

### Token Storage
- **Access Token**: `localStorage.getItem('accessToken')`
- **Auto-refresh**: Implemented in auth interceptor
- **Logout**: Clears token and redirects to login

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  role: ['admin', 'user', 'moderator'],
  settings: {
    theme: String,
    language: String,
    notifications: Object
  }
}
```

### Contact Model
```javascript
{
  name: String,
  email: String,
  phone: String,
  company: String,
  avatar: String,
  tags: [String],
  owner: ObjectId (User)
}
```

## 🛠️ Development Workflow

### 1. Backend Development
```bash
# Make changes to backend files
# Server auto-restarts with nodemon

# Test API endpoints
curl -X GET http://localhost:5000/api/contacts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Frontend Development
```bash
# Make changes to Angular files in demo/src/
# Frontend auto-reloads

# Proxy configuration in demo/proxy.conf.json handles API calls
```

### 3. Database Changes
```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/fuse19

# View collections
show collections

# Query data
db.users.find()
db.contacts.find()
```

## 🧪 Testing

### Backend Testing
```bash
# Run setup validation
node test-setup.js

# Run integration tests
node test-integration.js

# Manual API testing
npm test
```

### Frontend Testing
```bash
cd demo

# Run Angular tests
ng test

# Run e2e tests
ng e2e
```

## 🔄 Switching Between Mock and Real APIs

### Use Real Backend (Default)
```typescript
// demo/src/environments/environment.ts
export const environment = {
    useRealApi: true,
    apiUrl: 'http://localhost:5000/api'
};
```

### Use Mock APIs (For Testing)
```typescript
// demo/src/environments/environment.ts
export const environment = {
    useRealApi: false,
    apiUrl: 'http://localhost:5000/api'  // Ignored when useRealApi is false
};
```

## 📦 Production Deployment

### Backend
```bash
# Build for production
npm run build

# Start production server
npm start

# Environment variables
export NODE_ENV=production
export MONGO_URI=mongodb://your-mongo-host:27017/fuse19
export JWT_SECRET=your-super-secret-key
```

### Frontend
```bash
cd demo

# Build for production
ng build --configuration production

# Files will be in dist/fuse/
# Deploy dist folder to your web server
```

## 🐛 Troubleshooting

### Common Issues

**1. CORS Errors**
```bash
# Update backend .env file
ALLOWED_ORIGINS=http://localhost:4200,http://your-domain.com
```

**2. Database Connection Failed**
```bash
# Check MongoDB is running
docker ps  # If using Docker
mongod --version  # If installed locally
```

**3. JWT Token Expired**
```javascript
// Check browser localStorage
localStorage.getItem('accessToken')

// Clear expired token
localStorage.removeItem('accessToken')
```

**4. Port Already in Use**
```bash
# Kill processes on ports
lsof -ti:4200 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

## 📈 Next Steps

### Recommended Enhancements
1. **Add more API endpoints** (Notes, Tasks, Chat)
2. **Implement real-time features** with Socket.io
3. **Add file upload functionality**
4. **Create admin dashboard**
5. **Add comprehensive testing**

### Service Updates Needed
- ✅ AuthService - Updated
- ✅ ContactsService - Updated  
- ⏳ ChatService - Pending
- ⏳ NotesService - Pending
- ⏳ TasksService - Pending

## 💡 Tips

- **Use the proxy configuration** to avoid CORS issues during development
- **Check browser DevTools Network tab** to debug API calls
- **Use MongoDB Compass** for visual database management
- **Enable backend logging** by setting `NODE_ENV=development`
- **Use Postman** to test API endpoints independently

## 🆘 Getting Help

1. Check the console for error messages
2. Verify all services are running (Backend, Frontend, Database)
3. Test API endpoints with curl or Postman
4. Check this guide for common solutions
5. Review the backend logs for detailed error information

---

**Happy Coding! 🚀**