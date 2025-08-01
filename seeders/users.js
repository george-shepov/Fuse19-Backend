const User = require('../models/User');
const bcrypt = require('bcrypt');

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@fuse19.com',
    password: 'Admin123!@#',
    role: 'admin',
    status: 'active',
    isEmailVerified: true,
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      bio: 'System Administrator with full access to all features.',
      company: 'Fuse19 Inc.',
      position: 'System Administrator',
      location: 'San Francisco, CA',
      phone: '+1-555-0101'
    },
    settings: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        desktop: true
      }
    }
  },
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
    role: 'user',
    status: 'active',
    isEmailVerified: true,
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Full stack developer passionate about creating amazing user experiences.',
      company: 'Tech Solutions Inc.',
      position: 'Senior Developer',
      location: 'New York, NY',
      phone: '+1-555-0102',
      website: 'https://johndoe.dev',
      socialLinks: {
        github: 'johndoe',
        linkedin: 'john-doe-dev',
        twitter: 'johndoe_dev'
      }
    },
    settings: {
      theme: 'dark',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        desktop: false
      }
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'StrongPass456!',
    role: 'user',
    status: 'active',
    isEmailVerified: true,
    profile: {
      firstName: 'Jane',
      lastName: 'Smith',
      bio: 'UX Designer and product strategist with 8+ years of experience.',
      company: 'Design Studio Pro',
      position: 'Lead UX Designer',
      location: 'Los Angeles, CA',
      phone: '+1-555-0103',
      socialLinks: {
        linkedin: 'jane-smith-ux',
        twitter: 'janesmith_ux'
      }
    },
    settings: {
      theme: 'auto',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        desktop: true
      }
    }
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    password: 'PowerUser789!',
    role: 'moderator',
    status: 'active',
    isEmailVerified: true,
    profile: {
      firstName: 'Mike',
      lastName: 'Johnson',
      bio: 'Project manager and team lead focused on agile methodologies.',
      company: 'Agile Corp',
      position: 'Project Manager',
      location: 'Chicago, IL',
      phone: '+1-555-0104'
    },
    settings: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        desktop: true
      }
    }
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    password: 'CreativePass321!',
    role: 'user',
    status: 'active',
    isEmailVerified: true,
    profile: {
      firstName: 'Sarah',
      lastName: 'Wilson',
      bio: 'Creative director with expertise in branding and visual design.',
      company: 'Creative Agency',
      position: 'Creative Director',
      location: 'Austin, TX',
      phone: '+1-555-0105',
      website: 'https://sarahwilson.design'
    },
    settings: {
      theme: 'dark',
      language: 'en',
      notifications: {
        email: false,
        push: true,
        desktop: false
      }
    }
  },
  {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPass123!',
    role: 'user',
    status: 'active',
    isEmailVerified: false,
    profile: {
      firstName: 'Test',
      lastName: 'User',
      bio: 'Test account for development and testing purposes.',
      company: 'Test Company',
      position: 'Tester'
    }
  }
];

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding users...');
    
    // Clear existing users (except production)
    if (process.env.NODE_ENV !== 'production') {
      await User.deleteMany({});
      console.log('🗑️  Cleared existing users');
    }

    const users = [];
    for (const userData of sampleUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists, skipping...`);
        users.push(existingUser);
        continue;
      }

      // Hash password manually since we're using insertMany
      const salt = await bcrypt.genSalt(12);
      userData.password = await bcrypt.hash(userData.password, salt);
      
      // Set timestamps
      userData.createdAt = new Date();
      userData.updatedAt = new Date();
      
      // Create user
      const user = new User(userData);
      await user.save();
      users.push(user);
      
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
    }

    console.log(`🎉 Successfully seeded ${users.length} users`);
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

const getUserByEmail = (email) => {
  return sampleUsers.find(user => user.email === email);
};

const getAdminUser = () => {
  return sampleUsers.find(user => user.role === 'admin');
};

const getRegularUsers = () => {
  return sampleUsers.filter(user => user.role === 'user');
};

module.exports = {
  seedUsers,
  sampleUsers,
  getUserByEmail,
  getAdminUser,
  getRegularUsers
};