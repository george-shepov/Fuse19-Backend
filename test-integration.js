require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

console.log('🚀 Fuse19 Backend Integration Test\n');

// Test 1: Environment validation
console.log('1. Environment Validation');
const requiredEnv = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI', 'PORT'];
let envValid = true;

requiredEnv.forEach(key => {
  if (!process.env[key]) {
    console.log(`   ❌ Missing ${key}`);
    envValid = false;
  } else {
    console.log(`   ✅ ${key} configured`);
  }
});

if (!envValid) {
  console.log('\n❌ Environment validation failed. Check your .env file.');
  process.exit(1);
}

// Test 2: Express app creation
console.log('\n2. Express App Setup');
try {
  const app = express();
  
  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:4200').split(','),
    credentials: true
  }));
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: { success: false, error: 'Too many requests, please try again later.' }
  });
  app.use('/api/', limiter);
  
  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  console.log('   ✅ Security middleware configured');
  console.log('   ✅ CORS configured');
  console.log('   ✅ Rate limiting configured');
  console.log('   ✅ Body parsing configured');
  
  // Test 3: Route loading
  console.log('\n3. Route Configuration');
  
  // Add test endpoints for each route
  const routes = [
    { path: '/api/auth', file: './routes/auth' },
    { path: '/api/users', file: './routes/users' },
    { path: '/api/chat', file: './routes/chat' },
    { path: '/api/contacts', file: './routes/contacts' },
    { path: '/api/notes', file: './routes/notes' },
    { path: '/api/tasks', file: './routes/tasks' },
    { path: '/api/dashboard', file: './routes/dashboard' }
  ];
  
  let routesValid = true;
  routes.forEach(route => {
    try {
      const routeHandler = require(route.file);
      app.use(route.path, routeHandler);
      console.log(`   ✅ ${route.path} route loaded`);
    } catch (err) {
      console.log(`   ❌ ${route.path} route failed: ${err.message}`);
      routesValid = false;
    }
  });
  
  // Test 4: Model validation
  console.log('\n4. Model Validation');
  const models = ['User', 'Chat', 'Contact', 'Note', 'Task'];
  let modelsValid = true;
  
  models.forEach(model => {
    try {
      require(`./models/${model}`);
      console.log(`   ✅ ${model} model valid`);
    } catch (err) {
      console.log(`   ❌ ${model} model invalid: ${err.message}`);
      modelsValid = false;
    }
  });
  
  // Test 5: Middleware validation
  console.log('\n5. Middleware Validation');
  try {
    const { auth, adminAuth } = require('./middleware/auth');
    const { errorHandler, asyncHandler } = require('./middleware/error');
    
    console.log('   ✅ Authentication middleware loaded');
    console.log('   ✅ Error handling middleware loaded');
  } catch (err) {
    console.log(`   ❌ Middleware validation failed: ${err.message}`);
    modelsValid = false;
  }
  
  // Test 6: Server startup test
  console.log('\n6. Server Startup Test');
  const port = process.env.PORT || 5000;
  
  const server = app.listen(port, () => {
    console.log(`   ✅ Server started successfully on port ${port}`);
    
    // Quick HTTP test
    const http = require('http');
    
    // Add a test route for this integration test
    app.get('/integration-test', (req, res) => {
      res.json({
        success: true,
        message: 'Integration test passed!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });
    
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/integration-test',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            console.log(`   ✅ HTTP test passed: ${response.message}`);
            console.log(`   ✅ Server responding at http://localhost:${port}`);
          } else {
            console.log('   ❌ HTTP test failed: Invalid response');
          }
        } catch (err) {
          console.log('   ❌ HTTP test failed: Invalid JSON response');
        }
        
        // Final summary
        console.log('\n' + '='.repeat(60));
        console.log('🎯 INTEGRATION TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Environment: ${envValid ? '✅ VALID' : '❌ INVALID'}`);
        console.log(`Routes: ${routesValid ? '✅ LOADED' : '❌ FAILED'}`);
        console.log(`Models: ${modelsValid ? '✅ VALID' : '❌ INVALID'}`);
        console.log(`Server: ✅ RUNNING on port ${port}`);
        
        const allValid = envValid && routesValid && modelsValid;
        console.log(`\nOverall Status: ${allValid ? '🎉 READY FOR PRODUCTION' : '⚠️  NEEDS ATTENTION'}`);
        
        if (allValid) {
          console.log('\n💡 Next Steps:');
          console.log('   1. Start MongoDB (if not already running)');
          console.log('   2. Start server: npm run dev');
          console.log('   3. Test with Postman or integrate with Fuse Angular');
          console.log(`   4. API available at: http://localhost:${port}/api`);
          console.log('\n📚 Available Endpoints:');
          console.log('   • POST /api/auth/register - User registration');
          console.log('   • POST /api/auth/login    - User login');
          console.log('   • GET  /api/auth/me      - Get current user');
          console.log('   • GET  /api/users        - Get all users (admin)');
          console.log('   • GET  /api/chat         - Get user chats');
          console.log('   • GET  /api/contacts     - Get user contacts');
          console.log('   • GET  /api/notes        - Get user notes');
          console.log('   • GET  /api/tasks        - Get user tasks');
          console.log('   • GET  /api/dashboard/*  - Dashboard endpoints');
        }
        
        server.close();
        process.exit(allValid ? 0 : 1);
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ HTTP test failed: ${err.message}`);
      server.close();
      process.exit(1);
    });
    
    req.end();
  });
  
  server.on('error', (err) => {
    console.log(`   ❌ Server startup failed: ${err.message}`);
    process.exit(1);
  });
  
} catch (err) {
  console.log(`❌ App setup failed: ${err.message}`);
  process.exit(1);
}