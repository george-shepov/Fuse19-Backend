require('dotenv').config();
const { seedUsers } = require('./users');

const seedAll = async () => {
  console.log('🌱 Starting database seeding...');
  console.log('=====================================');
  
  try {
    // Seed users
    await seedUsers();
    
    console.log('=====================================');
    console.log('🎉 All seeding completed successfully!');
    console.log('\n🚀 You can now start the server with: npm start');
    console.log('🌐 Frontend will be available at: http://localhost:4200');
    console.log('🔧 Backend will be available at: http://localhost:5000');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedAll();
}

module.exports = { seedAll };
