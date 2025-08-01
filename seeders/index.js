require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { seedUsers } = require('./users');
const { seedContacts } = require('./contacts');
const { seedNotes } = require('./notes');
const { seedTasks } = require('./tasks');

// Command line arguments
const args = process.argv.slice(2);
const shouldClearAll = args.includes('--clear-all');
const onlyUsers = args.includes('--users-only');
const onlyContacts = args.includes('--contacts-only');
const onlyNotes = args.includes('--notes-only');
const onlyTasks = args.includes('--tasks-only');
const skipConfirm = args.includes('--yes');

const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding process...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Safety check for production
    if (process.env.NODE_ENV === 'production' && !skipConfirm) {
      console.log('⚠️  WARNING: You are about to seed data in PRODUCTION environment!');
      console.log('This operation may overwrite existing data.');
      console.log('Use --yes flag if you are sure you want to proceed.');
      process.exit(1);
    }

    // Clear all data if requested
    if (shouldClearAll && process.env.NODE_ENV !== 'production') {
      console.log('🗑️  Clearing all existing data...');
      const User = require('../models/User');
      const Contact = require('../models/Contact');
      const Note = require('../models/Note');
      const Task = require('../models/Task');
      
      await Promise.all([
        User.deleteMany({}),
        Contact.deleteMany({}),
        Note.deleteMany({}),
        Task.deleteMany({})
      ]);
      console.log('✅ All data cleared');
    }

    let users = [];

    // Seed users (required for other collections)
    if (!onlyContacts && !onlyNotes && !onlyTasks) {
      users = await seedUsers();
    } else {
      // Get existing users for relationships
      const User = require('../models/User');
      users = await User.find({}).limit(10);
      if (users.length === 0) {
        console.log('⚠️  No users found. Seeding users first...');
        users = await seedUsers();
      }
    }

    // Seed specific collections based on flags
    if (onlyUsers) {
      console.log('✅ Users seeding completed');
      return;
    }

    if (onlyContacts) {
      await seedContacts(users);
      console.log('✅ Contacts seeding completed');
      return;
    }

    if (onlyNotes) {
      await seedNotes(users);
      console.log('✅ Notes seeding completed');
      return;
    }

    if (onlyTasks) {
      await seedTasks(users);
      console.log('✅ Tasks seeding completed');
      return;
    }

    // Seed all collections
    const results = await Promise.allSettled([
      seedContacts(users),
      seedNotes(users),
      seedTasks(users)
    ]);

    // Check results
    results.forEach((result, index) => {
      const collections = ['contacts', 'notes', 'tasks'];
      if (result.status === 'fulfilled') {
        console.log(`✅ ${collections[index]} seeded successfully`);
      } else {
        console.error(`❌ Failed to seed ${collections[index]}:`, result.reason);
      }
    });

    // Summary
    console.log('\n🎉 Database seeding completed!');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    
    // Get final counts
    const User = require('../models/User');
    const Contact = require('../models/Contact');
    const Note = require('../models/Note');
    const Task = require('../models/Task');
    
    const [userCount, contactCount, noteCount, taskCount] = await Promise.all([
      User.countDocuments(),
      Contact.countDocuments(),
      Note.countDocuments(),
      Task.countDocuments()
    ]);

    console.log(`   👥 Total Users: ${userCount}`);
    console.log(`   📞 Total Contacts: ${contactCount}`);
    console.log(`   📝 Total Notes: ${noteCount}`);
    console.log(`   ✅ Total Tasks: ${taskCount}`);

    console.log('\n🔑 Default Admin Account:');
    console.log('   Email: admin@fuse19.com');
    console.log('   Password: Admin123!@#');
    
    console.log('\n🧪 Test Account:');
    console.log('   Email: test@example.com');
    console.log('   Password: TestPass123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⏹️  Seeding interrupted by user');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  await mongoose.connection.close();
  process.exit(1);
});

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🌱 Database Seeder

Usage: node seeders/index.js [options]

Options:
  --clear-all     Clear all existing data before seeding (dev only)
  --users-only    Seed only users
  --contacts-only Seed only contacts
  --notes-only    Seed only notes  
  --tasks-only    Seed only tasks
  --yes           Skip confirmation in production
  --help, -h      Show this help message

Examples:
  node seeders/index.js                    # Seed all data
  node seeders/index.js --clear-all        # Clear and seed all data
  node seeders/index.js --users-only       # Seed only users
  node seeders/index.js --contacts-only    # Seed only contacts

Environment Variables:
  NODE_ENV        Set to 'production' for production seeding
  MONGODB_URI     Database connection string
  
Default Accounts Created:
  Admin: admin@fuse19.com / Admin123!@#
  Test:  test@example.com / TestPass123!
`);
  process.exit(0);
}

// Run the seeder
seedDatabase();