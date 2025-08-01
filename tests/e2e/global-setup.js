const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { info, error } = require('../../config/logger');

let mongod;

async function seedTestData() {
  const bcrypt = require('bcrypt');
  const User = require('../../models/User');
  const Contact = require('../../models/Contact');
  const Note = require('../../models/Note');
  const Task = require('../../models/Task');

  // Create test users
  const users = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: await bcrypt.hash('Password123!', 10),
      role: 'user',
      isEmailVerified: true
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: await bcrypt.hash('Password123!', 10),
      role: 'user',
      isEmailVerified: true
    },
    {
      name: 'Admin User',
      email: 'admin@fuse19.com',
      password: await bcrypt.hash('Admin123!@#', 10),
      role: 'admin',
      isEmailVerified: true
    }
  ];

  const createdUsers = await User.insertMany(users);
  const firstUser = createdUsers.find(u => u.email === 'john.doe@example.com');

  // Create test contacts
  const contacts = [
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@testcompany.com',
      phone: '+1-555-0101',
      company: 'Test Company Inc',
      owner: firstUser._id
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@anothertest.com',
      phone: '+1-555-0102',
      company: 'Another Test LLC',
      owner: firstUser._id
    }
  ];

  await Contact.insertMany(contacts);

  // Create test notes
  const notes = [
    {
      title: 'Test Note 1',
      content: 'This is a test note for E2E testing',
      tags: ['test', 'e2e'],
      owner: firstUser._id
    },
    {
      title: 'Test Note 2',
      content: 'Another test note with different content',
      tags: ['test', 'demo'],
      owner: firstUser._id
    }
  ];

  await Note.insertMany(notes);

  // Create test tasks
  const tasks = [
    {
      title: 'Complete E2E Tests',
      description: 'Finish implementing Playwright tests',
      status: 'todo',
      priority: 'high',
      owner: firstUser._id
    },
    {
      title: 'Review Code',
      description: 'Code review for new features',
      status: 'completed',
      priority: 'medium',
      owner: firstUser._id
    }
  ];

  await Task.insertMany(tasks);

  console.log(`Created ${createdUsers.length} users, ${contacts.length} contacts, ${notes.length} notes, ${tasks.length} tasks`);
}

async function globalSetup() {
  console.log('🔧 Starting global setup for E2E tests...');

  try {
    // Start in-memory MongoDB instance for testing
    mongod = await MongoMemoryServer.create({
      instance: {
        port: 27018, // Different port from main app
        dbName: 'fuse19_e2e_test'
      }
    });

    const mongoUri = mongod.getUri();
    process.env.MONGODB_URI = mongoUri;
    process.env.MONGODB_TEST_URI = mongoUri;

    console.log(`📦 Test MongoDB started at: ${mongoUri}`);

    // Connect to test database (close existing connection first)
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to test database');

    // Seed test database with sample data
    console.log('🌱 Seeding test database...');
    await seedTestData();
    console.log('✅ Test database seeded successfully');

    // Store mongod instance globally for cleanup
    global.__MONGOD__ = mongod;

    info('E2E global setup completed successfully', {
      mongoUri,
      dbName: 'fuse19_e2e_test',
      port: 27018
    });

  } catch (setupError) {
    error('E2E global setup failed', {
      error: setupError.message,
      stack: setupError.stack
    });
    
    // Cleanup on failure
    if (mongod) {
      await mongod.stop();
    }
    
    throw setupError;
  }
}

module.exports = globalSetup;