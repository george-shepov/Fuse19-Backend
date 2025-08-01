const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    console.log('🌱 Starting user seeding...');
    
    // Connect to database
    await connectDB();
    
    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'hughes.brian@company.com' });
    if (existingUser) {
      console.log('✅ Demo user already exists');
      return;
    }
    
    // Demo user data
    const demoUsers = [
      {
        name: 'Brian Hughes',
        email: 'hughes.brian@company.com',
        password: 'admin',
        role: 'admin',
        status: 'active',
        avatar: 'assets/images/avatars/male-01.jpg',
        emailVerified: true,
        emailVerificationToken: null
      },
      {
        name: 'John Doe',
        email: 'john.doe@company.com',
        password: 'password123',
        role: 'user',
        status: 'active',
        avatar: 'assets/images/avatars/male-02.jpg',
        emailVerified: true,
        emailVerificationToken: null
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        password: 'password123',
        role: 'user',
        status: 'active',
        avatar: 'assets/images/avatars/female-01.jpg',
        emailVerified: true,
        emailVerificationToken: null
      }
    ];
    
    // Create users
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
    }
    
    console.log('🎉 User seeding completed successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('Email: hughes.brian@company.com');
    console.log('Password: admin');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedUsers();
}

module.exports = { seedUsers };
