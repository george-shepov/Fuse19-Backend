const { test } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');

test('cleanup', async ({ }) => {
  console.log('🧹 Running test cleanup...');

  try {
    // Clean up authentication files
    const authDir = path.join(__dirname, '../.auth');
    try {
      await fs.rmdir(authDir, { recursive: true });
      console.log('✅ Authentication files cleaned up');
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.warn('⚠️  Could not clean up auth directory:', err.message);
      }
    }

    // Clean up any test uploads
    const testUploadsDir = path.join(__dirname, '../../uploads/test');
    try {
      await fs.rmdir(testUploadsDir, { recursive: true });
      console.log('✅ Test uploads cleaned up');
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.warn('⚠️  Could not clean up test uploads:', err.message);
      }
    }

    console.log('✅ Test cleanup completed');

  } catch (error) {
    console.error('❌ Test cleanup failed:', error.message);
  }
});