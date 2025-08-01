const mongoose = require('mongoose');

async function connectDB() {
  try {
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGO_TEST_URI 
      : process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI not provided in environment variables');
    }

    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    };

    await mongoose.connect(mongoURI, options);
    
    console.log(`📦 MongoDB connected: ${mongoose.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (err) {
    console.error('❌ DB connection error:', err.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err.message);
  }
}

module.exports = { connectDB, disconnectDB };