const path = require('path');
const fs = require('fs');

console.log('🚀 Testing Fuse19 Backend Setup\n');

// Test 1: Check project structure
console.log('1. Checking project structure...');
const requiredFiles = [
  'server.js',
  'package.json',
  '.env',
  'models/User.js',
  'controllers/auth.js',
  'routes/auth.js',
  'middleware/auth.js',
  'config/db.js'
];

let structureOk = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    structureOk = false;
  }
});

// Test 2: Check package.json dependencies
console.log('\n2. Checking package.json dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'express', 'mongoose', 'jsonwebtoken', 'bcrypt', 
  'cors', 'dotenv', 'helmet', 'express-validator'
];

let depsOk = true;
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`   ❌ ${dep} - MISSING`);
    depsOk = false;
  }
});

// Test 3: Check environment variables
console.log('\n3. Checking environment configuration...');
require('dotenv').config();

const requiredEnvVars = [
  'JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI', 'PORT'
];

let envOk = true;
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}: ${envVar === 'JWT_SECRET' || envVar === 'JWT_REFRESH_SECRET' ? '***hidden***' : process.env[envVar]}`);
  } else {
    console.log(`   ❌ ${envVar} - MISSING`);
    envOk = false;
  }
});

// Test 4: Load and validate models
console.log('\n4. Testing model loading...');
let modelsOk = true;
try {
  // Test loading models without connecting to database
  const models = ['User', 'Chat', 'Contact', 'Note', 'Task'];
  models.forEach(model => {
    try {
      const ModelClass = require(`./models/${model}.js`);
      console.log(`   ✅ ${model} model loaded successfully`);
    } catch (err) {
      console.log(`   ❌ ${model} model failed: ${err.message}`);
      modelsOk = false;
    }
  });
} catch (err) {
  console.log(`   ❌ Model loading failed: ${err.message}`);
  modelsOk = false;
}

// Test 5: Check middleware and utilities
console.log('\n5. Testing middleware and utilities...');
let middlewareOk = true;
try {
  const authMiddleware = require('./middleware/auth.js');
  const errorMiddleware = require('./middleware/error.js');
  const crypto = require('./utils/crypto.js');
  
  console.log('   ✅ Auth middleware loaded');
  console.log('   ✅ Error middleware loaded');
  console.log('   ✅ Crypto utilities loaded');
} catch (err) {
  console.log(`   ❌ Middleware/utilities failed: ${err.message}`);
  middlewareOk = false;
}

// Final summary
console.log('\n' + '='.repeat(50));
console.log('📊 SETUP VALIDATION SUMMARY');
console.log('='.repeat(50));
console.log(`Project Structure: ${structureOk ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Dependencies: ${depsOk ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Environment: ${envOk ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Models: ${modelsOk ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Middleware: ${middlewareOk ? '✅ PASS' : '❌ FAIL'}`);

const overallSuccess = structureOk && depsOk && envOk && modelsOk && middlewareOk;
console.log(`\nOverall Status: ${overallSuccess ? '🎉 READY TO START' : '⚠️  NEEDS ATTENTION'}`);

if (overallSuccess) {
  console.log('\n💡 Next steps:');
  console.log('   1. Start MongoDB: docker run -d --name mongodb -p 27017:27017 mongo:6.0');
  console.log('   2. Start the server: npm run dev');
  console.log('   3. Test API endpoints with Postman or curl');
  console.log('   4. Integrate with Fuse Angular frontend');
} else {
  console.log('\n🔧 Fix the issues above before starting the server.');
}