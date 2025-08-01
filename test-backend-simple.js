#!/usr/bin/env node

/**
 * Simple backend API test script
 * Tests the Fuse19 backend APIs directly without Playwright
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:5000';

// Simple HTTP request helper
function makeRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  try {
    const response = await makeRequest('GET', `${BASE_URL}/health`);
    if (response.status === 200) {
      console.log('✅ Health check passed');
      return true;
    } else {
      console.log(`❌ Health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}`);
    return false;
  }
}

async function testLogin() {
  console.log('🔍 Testing login...');
  try {
    const response = await makeRequest('POST', `${BASE_URL}/api/auth/login`, {
      email: 'hughes.brian@company.com',
      password: 'admin'
    });
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Login test passed');
      console.log(`   User: ${response.data.data.user.name}`);
      console.log(`   Token: ${response.data.data.accessToken ? 'Present' : 'Missing'}`);
      return response.data.data.accessToken;
    } else {
      console.log(`❌ Login test failed: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Login test error: ${error.message}`);
    return null;
  }
}

async function testDashboard(token) {
  console.log('🔍 Testing dashboard API...');
  try {
    const response = await makeRequest('GET', `${BASE_URL}/api/dashboards/project`);
    
    if (response.status === 200) {
      console.log('✅ Dashboard test passed');
      console.log(`   GitHub Issues: ${response.data.githubIssues ? 'Present' : 'Missing'}`);
      console.log(`   Task Distribution: ${response.data.taskDistribution ? 'Present' : 'Missing'}`);
      console.log(`   Schedule: ${response.data.schedule ? 'Present' : 'Missing'}`);
      return true;
    } else {
      console.log(`❌ Dashboard test failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Dashboard test error: ${error.message}`);
    return false;
  }
}

async function testNavigation() {
  console.log('🔍 Testing navigation API...');
  try {
    const response = await makeRequest('GET', `${BASE_URL}/api/common/navigation`);
    
    if (response.status === 200 && response.data.default) {
      console.log('✅ Navigation test passed');
      console.log(`   Navigation sections: ${response.data.default.length}`);
      const dashboards = response.data.default.find(section => section.id === 'dashboards');
      const apps = response.data.default.find(section => section.id === 'apps');
      console.log(`   Dashboards: ${dashboards ? dashboards.children.length + ' items' : 'Missing'}`);
      console.log(`   Applications: ${apps ? apps.children.length + ' items' : 'Missing'}`);
      return true;
    } else {
      console.log(`❌ Navigation test failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Navigation test error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Fuse19 Backend API Tests');
  console.log('=====================================');
  
  let passed = 0;
  let total = 0;
  
  // Test 1: Health Check
  total++;
  if (await testHealthCheck()) passed++;
  
  // Test 2: Login
  total++;
  const token = await testLogin();
  if (token) passed++;
  
  // Test 3: Dashboard
  total++;
  if (await testDashboard(token)) passed++;
  
  // Test 4: Navigation
  total++;
  if (await testNavigation()) passed++;
  
  console.log('=====================================');
  console.log(`🎯 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Backend is working correctly.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Check the backend server.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});
