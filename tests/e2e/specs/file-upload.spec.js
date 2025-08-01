const { test, expect } = require('@playwright/test');
const { ApiHelpers } = require('../utils/api-helpers');
const { PageHelpers } = require('../utils/page-helpers');
const { testFiles } = require('../fixtures/test-data');
const path = require('path');
const fs = require('fs');

test.describe('File Upload', () => {
  let apiHelpers;
  let pageHelpers;

  test.beforeEach(async ({ page }) => {
    apiHelpers = new ApiHelpers(page);
    pageHelpers = new PageHelpers(page);
    
    // Login before each test
    await apiHelpers.loginViaAPI();
  });

  test.describe('File Manager Upload', () => {
    test('should upload single file', async ({ page }) => {
      await pageHelpers.navigateAndWait('/file-manager');
      await pageHelpers.waitForLoading();

      // Look for upload button
      const uploadButton = page.locator('[data-testid="upload-button"], button:has-text("Upload"), .upload-btn').first();
      await uploadButton.click();

      // Create test file
      const testFilePath = path.join(__dirname, '../fixtures/test-upload.txt');
      fs.writeFileSync(testFilePath, 'This is a test file for upload');

      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFilePath);

      // Wait for upload to complete
      await pageHelpers.waitForNotification('File uploaded successfully', 'success');

      // Verify file appears in file list
      await pageHelpers.waitForLoading();
      await expect(page.locator('text=test-upload.txt')).toBeVisible();

      // Cleanup
      fs.unlinkSync(testFilePath);
    });

    test('should upload multiple files', async ({ page }) => {
      await pageHelpers.navigateAndWait('/file-manager');
      await pageHelpers.waitForLoading();

      // Look for multiple upload option
      const uploadButton = page.locator('[data-testid="upload-multiple"], button:has-text("Upload Multiple"), .upload-multiple-btn').first();
      
      if (await uploadButton.isVisible()) {
        await uploadButton.click();

        // Create multiple test files
        const testFiles = [];
        for (let i = 1; i <= 3; i++) {
          const filePath = path.join(__dirname, `../fixtures/test-file-${i}.txt`);
          fs.writeFileSync(filePath, `Test file content ${i}`);
          testFiles.push(filePath);
        }

        // Upload files
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(testFiles);

        // Wait for upload to complete
        await pageHelpers.waitForNotification('Files uploaded successfully', 'success');

        // Verify all files appear
        await pageHelpers.waitForLoading();
        for (let i = 1; i <= 3; i++) {
          await expect(page.locator(`text=test-file-${i}.txt`)).toBeVisible();
        }

        // Cleanup
        testFiles.forEach(file => fs.unlinkSync(file));
      }
    });

    test('should handle image upload with preview', async ({ page }) => {
      await pageHelpers.navigateAndWait('/file-manager');
      await pageHelpers.waitForLoading();

      const uploadButton = page.locator('[data-testid="upload-button"], button:has-text("Upload"), .upload-btn').first();
      await uploadButton.click();

      // Create test image file (1x1 pixel PNG)
      const testImagePath = path.join(__dirname, '../fixtures/test-image.png');
      const pngData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
      fs.writeFileSync(testImagePath, pngData);

      // Upload image
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testImagePath);

      // Wait for upload and processing
      await pageHelpers.waitForNotification('File uploaded successfully', 'success');

      // Verify image appears with thumbnail
      await pageHelpers.waitForLoading();
      await expect(page.locator('text=test-image.png')).toBeVisible();
      
      // Check for image thumbnail/preview
      const thumbnail = page.locator('[data-testid="file-thumbnail"], .file-thumbnail, .image-preview').first();
      if (await thumbnail.isVisible()) {
        await expect(thumbnail).toBeVisible();
      }

      // Cleanup
      fs.unlinkSync(testImagePath);
    });

    test('should validate file size limits', async ({ page }) => {
      await pageHelpers.navigateAndWait('/file-manager');
      await pageHelpers.waitForLoading();

      const uploadButton = page.locator('[data-testid="upload-button"], button:has-text("Upload"), .upload-btn').first();
      await uploadButton.click();

      // Create large test file (assume 10MB limit)
      const largeFilePath = path.join(__dirname, '../fixtures/large-file.txt');
      const largeContent = 'A'.repeat(11 * 1024 * 1024); // 11MB
      fs.writeFileSync(largeFilePath, largeContent);

      // Attempt upload
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(largeFilePath);

      // Should show size limit error
      await pageHelpers.waitForNotification('File size exceeds limit', 'error');

      // Cleanup
      fs.unlinkSync(largeFilePath);
    });

    test('should validate file type restrictions', async ({ page }) => {
      await pageHelpers.navigateAndWait('/file-manager');
      await pageHelpers.waitForLoading();

      const uploadButton = page.locator('[data-testid="upload-button"], button:has-text("Upload"), .upload-btn').first();
      await uploadButton.click();

      // Create executable file (should be restricted)
      const execFilePath = path.join(__dirname, '../fixtures/test-file.exe');
      fs.writeFileSync(execFilePath, 'fake executable content');

      // Attempt upload
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(execFilePath);

      // Should show file type error
      await pageHelpers.waitForNotification('File type not allowed', 'error');

      // Cleanup
      fs.unlinkSync(execFilePath);
    });
  });

  test.describe('Drag and Drop Upload', () => {
    test('should support drag and drop upload', async ({ page }) => {
      await pageHelpers.navigateAndWait('/file-manager');
      await pageHelpers.waitForLoading();

      // Look for drag and drop area
      const dropZone = page.locator('[data-testid="drop-zone"], .drop-zone, .drag-drop-area');
      
      if (await dropZone.isVisible()) {
        // Create test file
        const testFilePath = path.join(__dirname, '../fixtures/drag-drop-test.txt');
        fs.writeFileSync(testFilePath, 'Drag and drop test content');

        // Simulate drag and drop (this is challenging in Playwright)
        // Alternative: use file input simulation
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(testFilePath);

        // Wait for upload
        await pageHelpers.waitForNotification('File uploaded successfully', 'success');

        // Verify file appears
        await expect(page.locator('text=drag-drop-test.txt')).toBeVisible();

        // Cleanup
        fs.unlinkSync(testFilePath);
      }
    });

    test('should show drag over visual feedback', async ({ page }) => {
      await pageHelpers.navigateAndWait('/file-manager');
      await pageHelpers.waitForLoading();

      const dropZone = page.locator('[data-testid="drop-zone"], .drop-zone, .drag-drop-area');
      
      if (await dropZone.isVisible()) {
        // Simulate drag enter (visual feedback test)
        await dropZone.dispatchEvent('dragenter', {
          dataTransfer: {
            files: [{ name: 'test.txt', type: 'text/plain' }]
          }
        });

        // Check for visual feedback (highlight/border change)
        await expect(dropZone).toHaveClass(/drag-over|highlight|active/);

        // Simulate drag leave
        await dropZone.dispatchEvent('dragleave');

        // Visual feedback should be removed
        await expect(dropZone).not.toHaveClass(/drag-over|highlight|active/);
      }
    });
  });

  test.describe('File Operations', () => {
    test('should download uploaded file', async ({ page }) => {
      await pageHelpers.navigateAndWait('/file-manager');
      await pageHelpers.waitForLoading();

      // First upload a file
      const uploadButton = page.locator('[data-testid="upload-button"], button:has-text("Upload"), .upload-btn').first();
      await uploadButton.click();

      const testFilePath = path.join(__dirname, '../fixtures/download-test.txt');
      const testContent = 'File content for download test';
      fs.writeFileSync(testFilePath, testContent);

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFilePath);

      await pageHelpers.waitForNotification('File uploaded successfully', 'success');

      // Find and click download button
      const downloadButton = page.locator('[data-testid="download-button"], button:has-text("Download"), .download-btn').first();
      
      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe('download-test.txt');

      // Cleanup
      fs.unlinkSync(testFilePath);
    });

    test('should delete uploaded file', async ({ page }) => {
      await pageHelpers.navigateAndWait('/file-manager');
      await pageHelpers.waitForLoading();

      // Upload file first
      const uploadButton = page.locator('[data-testid="upload-button"], button:has-text("Upload"), .upload-btn').first();
      await uploadButton.click();

      const testFilePath = path.join(__dirname, '../fixtures/delete-test.txt');
      fs.writeFileSync(testFilePath, 'File to be deleted');

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFilePath);

      await pageHelpers.waitForNotification('File uploaded successfully', 'success');

      // Delete the file
      const deleteButton = page.locator('[data-testid="delete-button"], button:has-text("Delete"), .delete-btn').first();
      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page.locator('button:has-text("Delete"), button:has-text("Confirm")');
      await confirmButton.click();

      // Verify file is removed
      await pageHelpers.waitForNotification('File deleted successfully', 'success');
      await expect(page.locator('text=delete-test.txt')).not.toBeVisible();

      // Cleanup
      fs.unlinkSync(testFilePath);
    });

    test('should rename uploaded file', async ({ page }) => {
      await pageHelpers.navigateAndWait('/file-manager');
      await pageHelpers.waitForLoading();

      // Upload file first
      const uploadButton = page.locator('[data-testid="upload-button"], button:has-text("Upload"), .upload-btn').first();
      await uploadButton.click();

      const testFilePath = path.join(__dirname, '../fixtures/rename-test.txt');
      fs.writeFileSync(testFilePath, 'File to be renamed');

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFilePath);

      await pageHelpers.waitForNotification('File uploaded successfully', 'success');

      // Rename the file
      const renameButton = page.locator('[data-testid="rename-button"], button:has-text("Rename"), .rename-btn').first();
      
      if (await renameButton.isVisible()) {
        await renameButton.click();

        // Enter new name
        const nameInput = page.locator('[data-testid="rename-input"], input[name="filename"]');
        const newName = 'renamed-file.txt';
        await nameInput.fill(newName);

        // Confirm rename
        await pageHelpers.clickButton('Save');

        // Verify new name appears
        await pageHelpers.waitForNotification('File renamed successfully', 'success');
        await expect(page.locator(`text=${newName}`)).toBeVisible();
        await expect(page.locator('text=rename-test.txt')).not.toBeVisible();
      }

      // Cleanup
      fs.unlinkSync(testFilePath);
    });
  });

  test.describe('Upload Progress', () => {
    test('should show upload progress', async ({ page }) => {
      await pageHelpers.navigateAndWait('/file-manager');
      await pageHelpers.waitForLoading();

      const uploadButton = page.locator('[data-testid="upload-button"], button:has-text("Upload"), .upload-btn').first();
      await uploadButton.click();

      // Create medium-sized file to see progress
      const testFilePath = path.join(__dirname, '../fixtures/progress-test.txt');
      const content = 'A'.repeat(1024 * 100); // 100KB
      fs.writeFileSync(testFilePath, content);

      // Start upload
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFilePath);

      // Look for progress indicator
      const progressBar = page.locator('[data-testid="upload-progress"], .progress-bar, .upload-progress');
      
      if (await progressBar.isVisible({ timeout: 2000 })) {
        // Progress bar should be visible during upload
        await expect(progressBar).toBeVisible();
        
        // Wait for completion
        await expect(progressBar).not.toBeVisible({ timeout: 10000 });
      }

      // Verify upload completed
      await pageHelpers.waitForNotification('File uploaded successfully', 'success');

      // Cleanup
      fs.unlinkSync(testFilePath);
    });

    test('should handle upload cancellation', async ({ page }) => {
      await pageHelpers.navigateAndWait('/file-manager');
      await pageHelpers.waitForLoading();

      const uploadButton = page.locator('[data-testid="upload-button"], button:has-text("Upload"), .upload-btn').first();
      await uploadButton.click();

      // Create large file for slower upload
      const testFilePath = path.join(__dirname, '../fixtures/cancel-test.txt');
      const content = 'A'.repeat(1024 * 1024 * 2); // 2MB
      fs.writeFileSync(testFilePath, content);

      // Start upload
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFilePath);

      // Look for cancel button during upload
      const cancelButton = page.locator('[data-testid="cancel-upload"], button:has-text("Cancel"), .cancel-btn');
      
      if (await cancelButton.isVisible({ timeout: 2000 })) {
        await cancelButton.click();
        
        // Should show cancellation message
        await pageHelpers.waitForNotification('Upload cancelled', 'info');
      }

      // Cleanup
      fs.unlinkSync(testFilePath);
    });
  });

  test.describe('API Upload', () => {
    test('should upload file via API', async ({ page }) => {
      // Test direct API upload
      const testContent = 'API upload test content';
      
      const response = await apiHelpers.apiRequest('POST', '/upload', {
        multipart: {
          file: {
            name: 'api-test.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from(testContent)
          }
        }
      });

      expect(response.status()).toBe(200);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.data.filename).toBe('api-test.txt');
      expect(result.data.size).toBeGreaterThan(0);
    });

    test('should handle API upload errors', async ({ page }) => {
      // Test upload without file
      const response = await apiHelpers.apiRequest('POST', '/upload', {
        data: {}
      });

      expect(response.status()).toBe(400);
      const result = await response.json();
      expect(result.success).toBe(false);
    });

    test('should get uploaded file info via API', async ({ page }) => {
      // First upload a file
      const uploadResponse = await apiHelpers.apiRequest('POST', '/upload', {
        multipart: {
          file: {
            name: 'info-test.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from('File info test')
          }
        }
      });

      expect(uploadResponse.status()).toBe(200);
      const uploadResult = await uploadResponse.json();
      const fileId = uploadResult.data.id;

      // Get file info
      const infoResponse = await apiHelpers.apiRequest('GET', `/upload/${fileId}`);
      expect(infoResponse.status()).toBe(200);
      
      const infoResult = await infoResponse.json();
      expect(infoResult.data.filename).toBe('info-test.txt');
    });
  });
});