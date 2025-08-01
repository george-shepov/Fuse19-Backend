const mongoose = require('mongoose');
const { info, error } = require('../../config/logger');

async function globalTeardown() {
  console.log('🧹 Starting global teardown for E2E tests...');

  try {
    // Close mongoose connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('✅ Mongoose connection closed');
    }

    // Stop MongoDB memory server
    const mongod = global.__MONGOD__;
    if (mongod) {
      await mongod.stop();
      console.log('✅ Test MongoDB stopped');
    }

    info('E2E global teardown completed successfully');

  } catch (teardownError) {
    error('E2E global teardown failed', {
      error: teardownError.message,
      stack: teardownError.stack
    });
    
    console.error('❌ Global teardown failed:', teardownError.message);
    throw teardownError;
  }
}

module.exports = globalTeardown;