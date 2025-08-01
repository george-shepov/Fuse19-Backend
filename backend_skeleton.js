// Fuse Admin Template - Backend Skeleton
// Tech Stack: Node.js, Express, MongoDB (Mongoose), Redis (caching), JWT for auth, bcrypt for password hashing

// Project Structure:
// ├── package.json
// ├── .env           # environment variables
// ├── server.js      # entry point
// ├── config/
// │   ├── db.js      # database connection
// │   └── cache.js   # redis connection
// ├── middleware/
// │   ├── auth.js    # JWT verification
// │   └── error.js   # error handler
// ├── models/
// │   ├── User.js    # user schema
// │   └── ...        # other entity schemas
// ├── controllers/
// │   ├── auth.js    # login/register
// │   ├── users.js   # CRUD user management
// │   └── ...        # controllers for each module
// ├── routes/
// │   ├── auth.js    # /api/auth
// │   ├── users.js   # /api/users
// │   └── ...        # routes per module
// └── utils/
//     └── crypto.js  # helper for encryption, tokens

// 1. package.json (partial)

{
  "name": "fuse-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.x",
    "mongoose": "^6.x",
    "redis": "^4.x",
    "jsonwebtoken": "^9.x",
    "bcrypt": "^5.x",
    "cors": "^2.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "nodemon": "^2.x"
  }
}

// 2. server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { connectCache } = require('./config/cache');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/error');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to services
connectDB();
connectCache();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// TODO: add other feature routes here

// Error Handler (should be last)
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// 3. config/db.js

const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('DB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };

// 4. config/cache.js

const redis = require('redis');
let client;

async function connectCache() {
  client = redis.createClient({ url: process.env.REDIS_URL });
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  console.log('Redis connected');
}

function getCacheClient() {
  if (!client) throw new Error('Redis client not initialized');
  return client;
}

module.exports = { connectCache, getCacheClient };

// 5. middleware/auth.js

const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = auth;

// 6. middleware/error.js

function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
}

module.exports = errorHandler;

// 7. models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

// 8. controllers/auth.js

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    next(err);
  }
};

// 9. routes/auth.js

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth');

router.post('/register', register);
router.post('/login', login);

module.exports = router;

// 10. routes/users.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/users');

router.get('/', auth, getUsers);
router.get('/:id', auth, getUserById);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);

module.exports = router;

// Next Steps:
// - Create controllers/users.js with CRUD operations
// - Add cache middleware for read-heavy endpoints
// - Define schemas/controllers/routes for other Fuse demo modules (e.g., Email, Chat, Calendar)
// - Integrate role-based access control
// - Secure sensitive data and input validation
