const { test, expect } = require('@playwright/test');
const { ApiHelpers } = require('../utils/api-helpers');
const { PageHelpers } = require('../utils/page-helpers');
const { testContacts, uiSelectors } = require('../fixtures/test-data');

test.describe('Contacts Management', () => {
  let apiHelpers;
  let pageHelpers;

  test.beforeEach(async ({ page }) => {
    apiHelpers = new ApiHelpers(page);
    pageHelpers = new PageHelpers(page);
    
    // Login before each test
    await apiHelpers.loginViaAPI();
    await pageHelpers.navigateAndWait('/contacts');
  });

  test.describe('Contacts List', () => {
    test('should display contacts list', async ({ page }) => {
      // Wait for contacts to load
      await pageHelpers.waitForLoading();

      // Check if contacts table is visible
      const contactsTable = page.locator(uiSelectors.tables.contactsTable);
      await expect(contactsTable).toBeVisible();

      // Verify table has data
      const rows = await contactsTable.locator('tbody tr').count();
      expect(rows).toBeGreaterThan(0);
    });

    test('should search contacts', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Search for specific contact
      const searchInput = page.locator('input[placeholder*="search"], input[name="search"]').first();
      await searchInput.fill('John');

      // Wait for search results
      await pageHelpers.waitForLoading();

      // Verify filtered results
      const tableData = await pageHelpers.getTableData(uiSelectors.tables.contactsTable);
      const hasJohn = tableData.some(row => 
        Object.values(row).some(value => 
          value.toLowerCase().includes('john')
        )
      );
      expect(hasJohn).toBe(true);
    });

    test('should sort contacts by name', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Click on name column header to sort
      const nameHeader = page.locator('th:has-text("Name"), th:has-text("Contact")').first();
      await nameHeader.click();

      await pageHelpers.waitForLoading();

      // Get sorted data
      const tableData = await pageHelpers.getTableData(uiSelectors.tables.contactsTable);
      const names = tableData.map(row => row.Name || row.Contact || '').filter(name => name);
      
      // Verify sorted order
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    test('should paginate contacts list', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Check if pagination controls exist (if there are enough contacts)
      const paginationNext = page.locator('[aria-label="Next page"], .pagination-next').first();
      
      if (await paginationNext.isVisible()) {
        const initialData = await pageHelpers.getTableData(uiSelectors.tables.contactsTable);
        
        await paginationNext.click();
        await pageHelpers.waitForLoading();
        
        const nextPageData = await pageHelpers.getTableData(uiSelectors.tables.contactsTable);
        
        // Data should be different on next page
        expect(initialData).not.toEqual(nextPageData);
      }
    });
  });

  test.describe('Create Contact', () => {
    test('should create new contact successfully', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Click add new contact button
      await pageHelpers.clickButton('Add Contact');

      // Wait for form modal
      const formModal = page.locator(uiSelectors.modals.formModal);
      await expect(formModal).toBeVisible();

      // Fill contact form
      const newContact = testContacts[0];
      await pageHelpers.fillForm({
        name: newContact.name,
        email: newContact.email,
        phone: newContact.phone,
        company: newContact.company,
        position: newContact.position,
        notes: newContact.notes
      });

      // Save contact
      await pageHelpers.clickButton('Save');

      // Wait for success notification
      await pageHelpers.waitForNotification('Contact created successfully', 'success');

      // Verify contact appears in list
      await pageHelpers.waitForLoading();
      const tableData = await pageHelpers.getTableData(uiSelectors.tables.contactsTable);
      const hasNewContact = tableData.some(row => 
        Object.values(row).some(value => value.includes(newContact.name))
      );
      expect(hasNewContact).toBe(true);
    });

    test('should validate required fields', async ({ page }) => {
      await pageHelpers.waitForLoading();
      await pageHelpers.clickButton('Add Contact');

      const formModal = page.locator(uiSelectors.modals.formModal);
      await expect(formModal).toBeVisible();

      // Try to save without required fields
      await pageHelpers.clickButton('Save');

      // Should show validation errors
      const nameInput = page.locator('input[name="name"]');
      const emailInput = page.locator('input[name="email"]');
      
      await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('should validate email format', async ({ page }) => {
      await pageHelpers.waitForLoading();
      await pageHelpers.clickButton('Add Contact');

      const formModal = page.locator(uiSelectors.modals.formModal);
      await expect(formModal).toBeVisible();

      // Fill form with invalid email
      await pageHelpers.fillForm({
        name: 'Test Contact',
        email: 'invalid-email-format',
        phone: '+1234567890'
      });

      await pageHelpers.clickButton('Save');

      // Should show email validation error
      const emailInput = page.locator('input[name="email"]');
      await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('should prevent duplicate email', async ({ page }) => {
      await pageHelpers.waitForLoading();
      await pageHelpers.clickButton('Add Contact');

      const formModal = page.locator(uiSelectors.modals.formModal);
      await expect(formModal).toBeVisible();

      // Try to create contact with existing email
      await pageHelpers.fillForm({
        name: 'Duplicate Contact',
        email: 'john.doe@example.com', // Existing email from seeded data
        phone: '+1234567890'
      });

      await pageHelpers.clickButton('Save');

      // Should show error for duplicate email
      await pageHelpers.waitForNotification('Email already exists', 'error');
    });
  });

  test.describe('Edit Contact', () => {
    test('should edit contact successfully', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Click edit button on first contact
      const editButton = page.locator(uiSelectors.buttons.edit).first();
      await editButton.click();

      // Wait for form modal
      const formModal = page.locator(uiSelectors.modals.formModal);
      await expect(formModal).toBeVisible();

      // Modify contact data
      const updatedName = 'Updated Contact Name';
      await pageHelpers.fillForm({
        name: updatedName
      });

      // Save changes
      await pageHelpers.clickButton('Save');

      // Wait for success notification
      await pageHelpers.waitForNotification('Contact updated successfully', 'success');

      // Verify updated data appears in list
      await pageHelpers.waitForLoading();
      const tableData = await pageHelpers.getTableData(uiSelectors.tables.contactsTable);
      const hasUpdatedContact = tableData.some(row => 
        Object.values(row).some(value => value.includes(updatedName))
      );
      expect(hasUpdatedContact).toBe(true);
    });

    test('should cancel edit without saving changes', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Get original data
      const originalData = await pageHelpers.getTableData(uiSelectors.tables.contactsTable);
      const firstContact = originalData[0];

      // Click edit button
      const editButton = page.locator(uiSelectors.buttons.edit).first();
      await editButton.click();

      const formModal = page.locator(uiSelectors.modals.formModal);
      await expect(formModal).toBeVisible();

      // Make some changes
      await pageHelpers.fillForm({
        name: 'Should Not Be Saved'
      });

      // Cancel instead of saving
      await pageHelpers.clickButton('Cancel');

      // Verify data unchanged
      await pageHelpers.waitForLoading();
      const currentData = await pageHelpers.getTableData(uiSelectors.tables.contactsTable);
      expect(currentData[0]).toEqual(firstContact);
    });
  });

  test.describe('Delete Contact', () => {
    test('should delete contact successfully', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Get initial count
      const initialData = await pageHelpers.getTableData(uiSelectors.tables.contactsTable);
      const initialCount = initialData.length;

      // Click delete button on first contact
      const deleteButton = page.locator(uiSelectors.buttons.delete).first();
      await deleteButton.click();

      // Confirm deletion
      const confirmDialog = page.locator(uiSelectors.modals.confirmDialog);
      await expect(confirmDialog).toBeVisible();
      await page.locator('button:has-text("Delete"), button:has-text("Confirm")').click();

      // Wait for success notification
      await pageHelpers.waitForNotification('Contact deleted successfully', 'success');

      // Verify contact count decreased
      await pageHelpers.waitForLoading();
      const finalData = await pageHelpers.getTableData(uiSelectors.tables.contactsTable);
      expect(finalData.length).toBe(initialCount - 1);
    });

    test('should cancel contact deletion', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Get initial count
      const initialData = await pageHelpers.getTableData(uiSelectors.tables.contactsTable);
      const initialCount = initialData.length;

      // Click delete button
      const deleteButton = page.locator(uiSelectors.buttons.delete).first();
      await deleteButton.click();

      // Cancel deletion
      const confirmDialog = page.locator(uiSelectors.modals.confirmDialog);
      await expect(confirmDialog).toBeVisible();
      await page.locator('button:has-text("Cancel")').click();

      // Verify contact count unchanged
      await pageHelpers.waitForLoading();
      const finalData = await pageHelpers.getTableData(uiSelectors.tables.contactsTable);
      expect(finalData.length).toBe(initialCount);
    });
  });

  test.describe('Contact Details', () => {
    test('should view contact details', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Click on first contact name to view details
      const firstContactName = page.locator(`${uiSelectors.tables.contactsTable} tbody tr:first-child td`).first();
      await firstContactName.click();

      // Wait for details view or modal
      await expect(page.locator('[data-testid="contact-details"], .contact-details')).toBeVisible();

      // Verify contact information is displayed
      await expect(page.locator('text=Email:')).toBeVisible();
      await expect(page.locator('text=Phone:')).toBeVisible();
    });

    test('should export contacts', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Look for export button
      const exportButton = page.locator('button:has-text("Export"), [data-testid="export-button"]').first();
      
      if (await exportButton.isVisible()) {
        // Start download
        const downloadPromise = page.waitForEvent('download');
        await exportButton.click();
        
        const download = await downloadPromise;
        
        // Verify download
        expect(download.suggestedFilename()).toMatch(/contacts.*\.(csv|xlsx)$/);
      }
    });
  });

  test.describe('Contact Import', () => {
    test('should import contacts from CSV', async ({ page }) => {
      await pageHelpers.waitForLoading();

      // Look for import button
      const importButton = page.locator('button:has-text("Import"), [data-testid="import-button"]').first();
      
      if (await importButton.isVisible()) {
        await importButton.click();

        // Wait for import modal
        const importModal = page.locator('[data-testid="import-modal"], .import-modal');
        await expect(importModal).toBeVisible();

        // Create test CSV content
        const csvContent = 'Name,Email,Phone,Company\nTest Import,test@import.com,+1234567890,Test Company';
        
        // Upload CSV file (this might need adjustment based on your implementation)
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
          name: 'test-contacts.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(csvContent)
        });

        // Submit import
        await pageHelpers.clickButton('Import');

        // Wait for success notification
        await pageHelpers.waitForNotification('Contacts imported successfully', 'success');
      }
    });
  });
});