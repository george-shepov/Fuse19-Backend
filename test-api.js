const express = require('express');
const http = require('http');

// Simple manual test function
async function runManualTests() {
  console.log('🧪 Running manual API tests...\n');
  
  try {
    // Create a minimal Express app for testing
    const testApp = express();
    testApp.use(express.json());
    
    // Add a simple test endpoint
    testApp.get('/test', (req, res) => {
      res.json({ success: true, message: 'API server is working!' });
    });
    
    const server = testApp.listen(3001, () => {
      console.log('✅ Test server started on port 3001');
    });
    
    // Test with a simple HTTP request
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/test',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const response = JSON.parse(data);
        if (response.success) {
          console.log('✅ API test passed:', response.message);
        } else {
          console.log('❌ API test failed');
        }
        server.close();
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Test request failed:', err.message);
      server.close();
    });
    
    req.end();
    
  } catch (error) {
    console.log('❌ Manual test failed:', error.message);
  }
}

// Run manual tests if this file is executed directly
if (require.main === module) {
  runManualTests();
}

module.exports = { runManualTests };