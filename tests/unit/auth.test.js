const request = require('supertest');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Import modules to test
const authRoutes = require('../../routes/auth');
const authController = require('../../controllers/auth');
const User = require('../../models/User');

describe('Authentication Controller', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to in-memory database
    await mongoose.connect(mongoUri);
    
    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  afterAll(async () => {
    // Cleanup
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123!',
        company: 'Test Company'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('User registered successfully');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'TestPassword123!',
        company: 'Test Company'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBeFalsy();
    });

    it('should not register user with weak password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test2@example.com',
        password: '123',
        company: 'Test Company'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123!',
        company: 'Test Company',
        isEmailVerified: true
      });
      await user.save();
    });

    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.email).toBe(credentials.email);
    });

    it('should not login with invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(401);
      // Just check that we got an unauthorized response - the format may vary
      expect([401, 403]).toContain(response.status);
    });

    it('should login demo user in development', async () => {
      // Set development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const credentials = {
        email: 'hughes.brian@company.com',
        password: 'admin'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(credentials.email);

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Password Validation', () => {
    const { validatePasswordStrength } = require('../../utils/helpers');
    
    it('should validate strong password', () => {
      const strongPassword = 'TestPassword123!';
      const validation = validatePasswordStrength(strongPassword);
      
      expect(validation.isValid).toBe(true);
      expect(validation.score).toBeGreaterThan(3);
    });

    it('should reject weak password', () => {
      const weakPassword = '123';
      const validation = validatePasswordStrength(weakPassword);
      
      expect(validation.isValid).toBe(false);
      expect(validation.score).toBeLessThan(3);
    });
  });
});