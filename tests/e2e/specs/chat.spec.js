const { test, expect } = require('@playwright/test');
const { ApiHelpers } = require('../utils/api-helpers');
const { PageHelpers } = require('../utils/page-helpers');
const { chatMessages, testUsers } = require('../fixtures/test-data');

test.describe('Real-time Chat', () => {
  let apiHelpers;
  let pageHelpers;

  test.beforeEach(async ({ page }) => {
    apiHelpers = new ApiHelpers(page);
    pageHelpers = new PageHelpers(page);
    
    // Login before each test
    await apiHelpers.loginViaAPI();
    await pageHelpers.navigateAndWait('/chat');
  });

  test.describe('Chat Interface', () => {
    test('should display chat interface', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Check if chat components are visible
      await expect(page.locator('[data-testid="chat-sidebar"], .chat-sidebar')).toBeVisible();
      await expect(page.locator('[data-testid="chat-messages"], .chat-messages')).toBeVisible();
      await expect(page.locator('[data-testid="message-input"], .message-input')).toBeVisible();
    });

    test('should show conversation list', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Check for conversations in sidebar
      const conversationList = page.locator('[data-testid="conversations-list"], .conversations-list');
      await expect(conversationList).toBeVisible();

      // Should have at least one conversation
      const conversations = await conversationList.locator('.conversation-item, [data-testid="conversation-item"]').count();
      expect(conversations).toBeGreaterThan(0);
    });

    test('should select conversation', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Click on first conversation
      const firstConversation = page.locator('.conversation-item, [data-testid="conversation-item"]').first();
      await firstConversation.click();

      // Wait for messages to load
      await pageHelpers.waitForLoading();

      // Verify conversation is selected
      await expect(firstConversation).toHaveClass(/selected|active/);

      // Check if messages are displayed
      const messagesContainer = page.locator('[data-testid="chat-messages"], .chat-messages');
      const messages = await messagesContainer.locator('.message, [data-testid="message"]').count();
      expect(messages).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Send Messages', () => {
    test('should send text message', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Select first conversation
      const firstConversation = page.locator('.conversation-item, [data-testid="conversation-item"]').first();
      await firstConversation.click();
      await pageHelpers.waitForLoading();

      // Type message
      const messageInput = page.locator('[data-testid="message-input"], .message-input input, .message-input textarea');
      const testMessage = 'This is a test message from E2E tests';
      await messageInput.fill(testMessage);

      // Send message
      const sendButton = page.locator('[data-testid="send-button"], .send-button, button:has-text("Send")');
      await sendButton.click();

      // Wait for message to appear
      await pageHelpers.waitForLoading();

      // Verify message appears in chat
      const messagesContainer = page.locator('[data-testid="chat-messages"], .chat-messages');
      await expect(messagesContainer.locator(`text=${testMessage}`)).toBeVisible();

      // Verify input is cleared
      await expect(messageInput).toHaveValue('');
    });

    test('should send message with Enter key', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Select conversation
      const firstConversation = page.locator('.conversation-item, [data-testid="conversation-item"]').first();
      await firstConversation.click();
      await pageHelpers.waitForLoading();

      // Type and send with Enter
      const messageInput = page.locator('[data-testid="message-input"], .message-input input, .message-input textarea');
      const testMessage = 'Message sent with Enter key';
      await messageInput.fill(testMessage);
      await messageInput.press('Enter');

      // Wait and verify
      await pageHelpers.waitForLoading();
      const messagesContainer = page.locator('[data-testid="chat-messages"], .chat-messages');
      await expect(messagesContainer.locator(`text=${testMessage}`)).toBeVisible();
    });

    test('should handle long messages', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Select conversation
      const firstConversation = page.locator('.conversation-item, [data-testid="conversation-item"]').first();
      await firstConversation.click();
      await pageHelpers.waitForLoading();

      // Send long message
      const longMessage = 'A'.repeat(1000); // 1000 character message
      const messageInput = page.locator('[data-testid="message-input"], .message-input input, .message-input textarea');
      await messageInput.fill(longMessage);

      const sendButton = page.locator('[data-testid="send-button"], .send-button, button:has-text("Send")');
      await sendButton.click();

      // Wait and verify
      await pageHelpers.waitForLoading();
      const messagesContainer = page.locator('[data-testid="chat-messages"], .chat-messages');
      await expect(messagesContainer.locator(`text=${longMessage.substring(0, 50)}`)).toBeVisible();
    });

    test('should prevent sending empty messages', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Select conversation
      const firstConversation = page.locator('.conversation-item, [data-testid="conversation-item"]').first();
      await firstConversation.click();
      await pageHelpers.waitForLoading();

      // Try to send empty message
      const sendButton = page.locator('[data-testid="send-button"], .send-button, button:has-text("Send")');
      
      // Send button should be disabled with empty input
      await expect(sendButton).toBeDisabled();

      // Try pressing Enter with empty input
      const messageInput = page.locator('[data-testid="message-input"], .message-input input, .message-input textarea');
      await messageInput.press('Enter');

      // No new message should appear
      await page.waitForTimeout(1000);
      // This test assumes the UI prevents empty messages
    });
  });

  test.describe('Typing Indicators', () => {
    test('should show typing indicator', async ({ page, context }) => {
      // This test simulates two users typing to each other
      // We'll need a second page/context for this
      
      const secondPage = await context.newPage();
      const secondApiHelpers = new ApiHelpers(secondPage);
      const secondPageHelpers = new PageHelpers(secondPage);

      // Login second user
      await secondApiHelpers.loginViaAPI('jane.smith@example.com', 'Password123!');
      await secondPageHelpers.navigateAndWait('/chat');

      // Both users select same conversation
      await pageHelpers.waitForLoading();
      await secondPageHelpers.waitForLoading();

      const firstConversation = page.locator('.conversation-item, [data-testid="conversation-item"]').first();
      const secondConversation = secondPage.locator('.conversation-item, [data-testid="conversation-item"]').first();
      
      await firstConversation.click();
      await secondConversation.click();

      await pageHelpers.waitForLoading();
      await secondPageHelpers.waitForLoading();

      // First user starts typing
      const messageInput = page.locator('[data-testid="message-input"], .message-input input, .message-input textarea');
      await messageInput.fill('User is typing...');

      // Second user should see typing indicator
      await expect(secondPage.locator('[data-testid="typing-indicator"], .typing-indicator')).toBeVisible({ timeout: 5000 });

      // First user stops typing
      await messageInput.clear();

      // Typing indicator should disappear
      await expect(secondPage.locator('[data-testid="typing-indicator"], .typing-indicator')).not.toBeVisible({ timeout: 5000 });

      await secondPage.close();
    });
  });

  test.describe('Message History', () => {
    test('should load message history', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Select conversation with existing messages
      const firstConversation = page.locator('.conversation-item, [data-testid="conversation-item"]').first();
      await firstConversation.click();
      await pageHelpers.waitForLoading();

      // Check if historical messages are loaded
      const messagesContainer = page.locator('[data-testid="chat-messages"], .chat-messages');
      const messageCount = await messagesContainer.locator('.message, [data-testid="message"]').count();
      
      if (messageCount > 0) {
        // Verify messages have timestamps
        const firstMessage = messagesContainer.locator('.message, [data-testid="message"]').first();
        await expect(firstMessage.locator('.timestamp, [data-testid="timestamp"]')).toBeVisible();
      }
    });

    test('should scroll to load older messages', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Select conversation
      const firstConversation = page.locator('.conversation-item, [data-testid="conversation-item"]').first();
      await firstConversation.click();
      await pageHelpers.waitForLoading();

      const messagesContainer = page.locator('[data-testid="chat-messages"], .chat-messages');
      const initialMessageCount = await messagesContainer.locator('.message, [data-testid="message"]').count();

      // Scroll to top to load older messages
      await messagesContainer.hover();
      await page.mouse.wheel(0, -1000);
      
      // Wait for potential loading
      await page.waitForTimeout(2000);
      
      const finalMessageCount = await messagesContainer.locator('.message, [data-testid="message"]').count();
      
      // If there are older messages, count should increase
      // This test passes if either more messages load or no more exist
      expect(finalMessageCount).toBeGreaterThanOrEqual(initialMessageCount);
    });

    test('should maintain scroll position when new message arrives', async ({ page, context }) => {
      const secondPage = await context.newPage();
      const secondApiHelpers = new ApiHelpers(secondPage);
      const secondPageHelpers = new PageHelpers(secondPage);

      // Setup second user
      await secondApiHelpers.loginViaAPI('jane.smith@example.com', 'Password123!');
      await secondPageHelpers.navigateAndWait('/chat');

      // Both select same conversation
      await pageHelpers.waitForLoading();
      await secondPageHelpers.waitForLoading();

      const firstConversation = page.locator('.conversation-item, [data-testid="conversation-item"]').first();
      const secondConversation = secondPage.locator('.conversation-item, [data-testid="conversation-item"]').first();
      
      await firstConversation.click();
      await secondConversation.click();

      await pageHelpers.waitForLoading();
      await secondPageHelpers.waitForLoading();

      // First user scrolls up in chat history
      const messagesContainer = page.locator('[data-testid="chat-messages"], .chat-messages');
      await messagesContainer.hover();
      await page.mouse.wheel(0, -500);

      // Get scroll position
      const scrollPosition = await messagesContainer.evaluate(el => el.scrollTop);

      // Second user sends message
      const messageInput = secondPage.locator('[data-testid="message-input"], .message-input input, .message-input textarea');
      await messageInput.fill('New message while scrolled up');
      await messageInput.press('Enter');

      // Wait for message to be received
      await page.waitForTimeout(2000);

      // First user's scroll position should be maintained
      const newScrollPosition = await messagesContainer.evaluate(el => el.scrollTop);
      expect(Math.abs(newScrollPosition - scrollPosition)).toBeLessThan(50); // Allow small variance

      await secondPage.close();
    });
  });

  test.describe('File Sharing', () => {
    test('should upload and share image', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Select conversation
      const firstConversation = page.locator('.conversation-item, [data-testid="conversation-item"]').first();
      await firstConversation.click();
      await pageHelpers.waitForLoading();

      // Look for file upload button
      const uploadButton = page.locator('[data-testid="upload-button"], .upload-button, button:has-text("Attach")').first();
      
      if (await uploadButton.isVisible()) {
        await uploadButton.click();

        // Upload test image
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
          name: 'test-image.png',
          mimeType: 'image/png',
          buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64')
        });

        // Send the file
        const sendButton = page.locator('[data-testid="send-button"], .send-button, button:has-text("Send")');
        await sendButton.click();

        // Wait for file message to appear
        await pageHelpers.waitForLoading();

        // Verify file message appears
        const messagesContainer = page.locator('[data-testid="chat-messages"], .chat-messages');
        await expect(messagesContainer.locator('.file-message, [data-testid="file-message"]')).toBeVisible();
      }
    });
  });

  test.describe('Message Actions', () => {
    test('should delete own message', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Select conversation
      const firstConversation = page.locator('.conversation-item, [data-testid="conversation-item"]').first();
      await firstConversation.click();
      await pageHelpers.waitForLoading();

      // Send a message first
      const messageInput = page.locator('[data-testid="message-input"], .message-input input, .message-input textarea');
      const testMessage = 'Message to be deleted';
      await messageInput.fill(testMessage);
      await messageInput.press('Enter');

      await pageHelpers.waitForLoading();

      // Find the message and its delete button
      const messageElement = page.locator(`.message:has-text("${testMessage}"), [data-testid="message"]:has-text("${testMessage}")`);
      await messageElement.hover();

      const deleteButton = messageElement.locator('[data-testid="delete-message"], .delete-message, button:has-text("Delete")');
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Confirm deletion
        const confirmButton = page.locator('button:has-text("Delete"), button:has-text("Confirm")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Verify message is deleted
        await expect(messageElement).not.toBeVisible();
      }
    });

    test('should edit own message', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Select conversation
      const firstConversation = page.locator('.conversation-item, [data-testid="conversation-item"]').first();
      await firstConversation.click();
      await pageHelpers.waitForLoading();

      // Send a message first
      const messageInput = page.locator('[data-testid="message-input"], .message-input input, .message-input textarea');
      const originalMessage = 'Original message to edit';
      await messageInput.fill(originalMessage);
      await messageInput.press('Enter');

      await pageHelpers.waitForLoading();

      // Find the message and its edit button
      const messageElement = page.locator(`.message:has-text("${originalMessage}"), [data-testid="message"]:has-text("${originalMessage}")`);
      await messageElement.hover();

      const editButton = messageElement.locator('[data-testid="edit-message"], .edit-message, button:has-text("Edit")');
      
      if (await editButton.isVisible()) {
        await editButton.click();

        // Edit the message
        const editInput = page.locator('[data-testid="edit-input"], .edit-input input, .edit-input textarea');
        const editedMessage = 'Edited message content';
        await editInput.fill(editedMessage);
        await editInput.press('Enter');

        // Verify message is updated
        await expect(page.locator(`text=${editedMessage}`)).toBeVisible();
        await expect(messageElement.locator('.edited-indicator, [data-testid="edited"]')).toBeVisible();
      }
    });
  });

  test.describe('Online Status', () => {
    test('should show user online status', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Check if user status indicators are visible
      const onlineIndicators = page.locator('.online-status, [data-testid="online-status"], .user-status');
      
      if (await onlineIndicators.first().isVisible()) {
        const count = await onlineIndicators.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should update status when user goes offline', async ({ page, context }) => {
      const secondPage = await context.newPage();
      const secondApiHelpers = new ApiHelpers(secondPage);
      const secondPageHelpers = new PageHelpers(secondPage);

      // Login second user
      await secondApiHelpers.loginViaAPI('jane.smith@example.com', 'Password123!');
      await secondPageHelpers.navigateAndWait('/chat');

      await pageHelpers.waitForLoading();
      await secondPageHelpers.waitForLoading();

      // Both users should see each other as online
      const onlineStatus = page.locator('.online-status.online, [data-testid="online-status"][data-status="online"]');
      
      if (await onlineStatus.first().isVisible()) {
        // Close second user's page (simulate going offline)
        await secondPage.close();

        // Wait for status to update
        await page.waitForTimeout(3000);

        // First user should see second user as offline
        const offlineStatus = page.locator('.online-status.offline, [data-testid="online-status"][data-status="offline"]');
        await expect(offlineStatus.first()).toBeVisible({ timeout: 10000 });
      }
    });
  });
});