const { expect } = require('@playwright/test');

class PageHelpers {
  constructor(page) {
    this.page = page;
  }

  /**
   * Wait for Angular to be ready
   */
  async waitForAngular() {
    await this.page.waitForFunction(() => {
      return window.getAllAngularTestabilities &&
             window.getAllAngularTestabilities().findIndex(x => !x.isStable()) === -1;
    }, { timeout: 10000 });
  }

  /**
   * Navigate and wait for page to be ready
   */
  async navigateAndWait(url, options = {}) {
    await this.page.goto(url, { waitUntil: 'networkidle', ...options });
    await this.waitForAngular();
  }

  /**
   * Fill form with data
   */
  async fillForm(formData) {
    for (const [field, value] of Object.entries(formData)) {
      const input = this.page.locator(`[name="${field}"], [formControlName="${field}"], [data-testid="${field}"]`).first();
      await expect(input).toBeVisible();
      
      if (await input.getAttribute('type') === 'checkbox') {
        if (value) await input.check();
        else await input.uncheck();
      } else {
        await input.fill(String(value));
      }
    }
  }

  /**
   * Click button by text or selector
   */
  async clickButton(buttonText) {
    const button = this.page.locator(`button:has-text("${buttonText}"), [data-testid="${buttonText}"]`).first();
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await button.click();
  }

  /**
   * Wait for toast/notification message
   */
  async waitForNotification(message, type = 'success') {
    const notification = this.page.locator(`.toast-${type}, .notification-${type}, .alert-${type}`);
    await expect(notification).toBeVisible();
    
    if (message) {
      await expect(notification).toContainText(message);
    }
    
    return notification;
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoading() {
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('.loading, .spinner, mat-spinner', { state: 'detached', timeout: 30000 });
    
    // Wait for Angular to be stable
    await this.waitForAngular();
  }

  /**
   * Take screenshot with timestamp
   */
  async takeTimestampedScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors() {
    const errors = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  /**
   * Wait for URL pattern
   */
  async waitForURL(pattern, options = {}) {
    await this.page.waitForURL(pattern, { timeout: 10000, ...options });
  }

  /**
   * Get table data
   */
  async getTableData(tableSelector = 'table') {
    const table = this.page.locator(tableSelector);
    await expect(table).toBeVisible();

    const headers = await table.locator('thead th, thead td').allTextContents();
    const rows = await table.locator('tbody tr').count();
    
    const data = [];
    for (let i = 0; i < rows; i++) {
      const rowData = {};
      const cells = await table.locator(`tbody tr:nth-child(${i + 1}) td`).allTextContents();
      
      headers.forEach((header, index) => {
        rowData[header.trim()] = cells[index]?.trim() || '';
      });
      
      data.push(rowData);
    }

    return data;
  }

  /**
   * Select from dropdown/select
   */
  async selectOption(selector, option) {
    const select = this.page.locator(selector);
    await expect(select).toBeVisible();
    
    // Handle Angular Material select
    if (await select.locator('mat-select').count() > 0) {
      await select.locator('mat-select').click();
      await this.page.locator(`mat-option:has-text("${option}")`).click();
    } else {
      await select.selectOption(option);
    }
  }

  /**
   * Upload file
   */
  async uploadFile(fileInputSelector, filePath) {
    const fileInput = this.page.locator(fileInputSelector);
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Drag and drop
   */
  async dragAndDrop(sourceSelector, targetSelector) {
    const source = this.page.locator(sourceSelector);
    const target = this.page.locator(targetSelector);
    
    await expect(source).toBeVisible();
    await expect(target).toBeVisible();
    
    await source.dragTo(target);
  }

  /**
   * Wait for element to be stable (not moving)
   */
  async waitForElementStable(selector, timeout = 5000) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    
    let lastPosition = await element.boundingBox();
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      await this.page.waitForTimeout(100);
      const currentPosition = await element.boundingBox();
      
      if (JSON.stringify(lastPosition) === JSON.stringify(currentPosition)) {
        return; // Element is stable
      }
      
      lastPosition = currentPosition;
    }
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector) {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Get element text content
   */
  async getTextContent(selector) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    return await element.textContent();
  }

  /**
   * Check if element exists
   */
  async elementExists(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = { PageHelpers };