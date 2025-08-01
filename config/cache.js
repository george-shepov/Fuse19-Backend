const redis = require('redis');
let client;

async function connectCache() {
  try {
    if (!process.env.REDIS_URL) {
      console.log('⚠️  Redis URL not provided, skipping cache connection');
      return null;
    }

    client = redis.createClient({ 
      url: process.env.REDIS_URL,
      retry_strategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    client.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
    });

    client.on('connect', () => {
      console.log('🔄 Redis connecting...');
    });

    client.on('ready', () => {
      console.log('✅ Redis connected and ready');
    });

    client.on('end', () => {
      console.log('Redis connection closed');
    });

    await client.connect();
    
    // Test the connection
    await client.ping();
    
    return client;
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message);
    console.log('⚠️  Continuing without cache...');
    client = null;
    return null;
  }
}

function getCacheClient() {
  return client;
}

async function setCache(key, value, expireInSeconds = 3600) {
  if (!client) return false;
  
  try {
    const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
    await client.setEx(key, expireInSeconds, serializedValue);
    return true;
  } catch (err) {
    console.error('Cache set error:', err.message);
    return false;
  }
}

async function getCache(key) {
  if (!client) return null;
  
  try {
    const value = await client.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (err) {
    console.error('Cache get error:', err.message);
    return null;
  }
}

async function deleteCache(key) {
  if (!client) return false;
  
  try {
    await client.del(key);
    return true;
  } catch (err) {
    console.error('Cache delete error:', err.message);
    return false;
  }
}

async function flushCache() {
  if (!client) return false;
  
  try {
    await client.flushAll();
    return true;
  } catch (err) {
    console.error('Cache flush error:', err.message);
    return false;
  }
}

module.exports = { 
  connectCache, 
  getCacheClient, 
  setCache, 
  getCache, 
  deleteCache, 
  flushCache 
};