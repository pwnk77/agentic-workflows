import { test, expect } from '@playwright/test';

// Mock data for testing
const mockSpec = {
  id: 1,
  title: 'E2E Test Specification',
  body_md: '# Test Specification\n\nThis is a test specification for E2E testing.\n\n## Features\n- Preview mode\n- Edit mode\n- Save functionality',
  status: 'draft',
  version: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

test.describe('SpecGen Modal Workflow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/specs*', async route => {
      if (route.request().method() === 'GET' && route.request().url().includes('/specs?')) {
        await route.fulfill({
          json: {
            success: true,
            data: {
              specs: [mockSpec],
              pagination: { total: 1, limit: 10, offset: 0, has_more: false }
            },
            timestamp: '2024-01-01T00:00:00Z'
          }
        });
      } else if (route.request().method() === 'GET' && route.request().url().includes('/specs/1')) {
        await route.fulfill({
          json: {
            success: true,
            data: mockSpec,
            timestamp: '2024-01-01T00:00:00Z'
          }
        });
      } else {
        await route.continue();
      }
    });

    // Navigate to specs page
    await page.goto('/specs');
    await page.waitForLoadState('networkidle');
  });

  test('should open modal in preview mode when clicking on spec row', async ({ page }) => {
    // Wait for spec to load
    await expect(page.getByText('E2E Test Specification')).toBeVisible();

    // Click on the spec row
    const specRow = page.locator('[data-testid="spec-row"], .grid').filter({ hasText: 'E2E Test Specification' }).first();
    await specRow.click();

    // Verify modal opens in preview mode
    await expect(page.getByTestId('spec-modal')).toBeVisible();
    await expect(page.getByText('Test Specification')).toBeVisible(); // H1 from markdown
    await expect(page.getByText('This is a test specification for E2E testing.')).toBeVisible();
    
    // Verify preview mode is active
    const previewButton = page.getByRole('button', { name: /preview/i });
    await expect(previewButton).toHaveClass(/bg-white/);
    
    // Verify edit mode is not active
    const editButton = page.getByRole('button', { name: /edit/i });
    await expect(editButton).not.toHaveClass(/bg-white/);
  });

  test('should open modal in edit mode when clicking edit button', async ({ page }) => {
    await expect(page.getByText('E2E Test Specification')).toBeVisible();

    // Click on the edit button (not the row)
    const editButton = page.getByTitle('Edit').first();
    await editButton.click();

    // Verify modal opens in edit mode
    await expect(page.getByText('Edit Specification')).toBeVisible();
    await expect(page.getByDisplayValue('E2E Test Specification')).toBeVisible();
    
    // Verify edit mode is active
    const editToggle = page.getByRole('button', { name: /edit/i });
    await expect(editToggle).toHaveClass(/bg-white/);
  });

  test('should switch between preview and edit modes', async ({ page }) => {
    await expect(page.getByText('E2E Test Specification')).toBeVisible();

    // Open modal in preview mode
    const specRow = page.locator('.grid').filter({ hasText: 'E2E Test Specification' }).first();
    await specRow.click();

    // Verify starting in preview mode
    await expect(page.getByText('Test Specification')).toBeVisible();
    
    // Switch to edit mode
    await page.getByRole('button', { name: /edit/i }).click();
    await expect(page.getByText('Edit Specification')).toBeVisible();
    await expect(page.getByDisplayValue('E2E Test Specification')).toBeVisible();

    // Switch back to preview mode
    await page.getByRole('button', { name: /preview/i }).click();
    await expect(page.getByText('Test Specification')).toBeVisible();
  });

  test('should save changes and return to preview mode', async ({ page }) => {
    // Mock the update API
    await page.route('**/api/specs/1', async route => {
      if (route.request().method() === 'PUT') {
        const requestBody = route.request().postDataJSON();
        const updatedSpec = { ...mockSpec, ...requestBody };
        await route.fulfill({
          json: {
            success: true,
            data: updatedSpec,
            timestamp: '2024-01-01T00:00:00Z'
          }
        });
      } else {
        await route.continue();
      }
    });

    await expect(page.getByText('E2E Test Specification')).toBeVisible();

    // Open modal in edit mode
    await page.getByTitle('Edit').first().click();
    await expect(page.getByText('Edit Specification')).toBeVisible();

    // Make changes
    const titleInput = page.getByDisplayValue('E2E Test Specification');
    await titleInput.clear();
    await titleInput.fill('Updated E2E Test Specification');

    const contentTextarea = page.getByDisplayValue(/# Test Specification/);
    await contentTextarea.clear();
    await contentTextarea.fill('# Updated Test Specification\n\nThis specification has been updated.');

    // Save changes
    await page.getByRole('button', { name: /save/i }).click();

    // Verify it switches back to preview mode with updated content
    await expect(page.getByText('Updated Test Specification')).toBeVisible();
    await expect(page.getByText('This specification has been updated.')).toBeVisible();
    
    // Verify preview mode is active
    const previewButton = page.getByRole('button', { name: /preview/i });
    await expect(previewButton).toHaveClass(/bg-white/);
  });

  test('should close modal when clicking close button', async ({ page }) => {
    await expect(page.getByText('E2E Test Specification')).toBeVisible();

    // Open modal
    const specRow = page.locator('.grid').filter({ hasText: 'E2E Test Specification' }).first();
    await specRow.click();

    // Verify modal is open
    await expect(page.getByText('Test Specification')).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /close/i }).click();

    // Verify modal is closed
    await expect(page.getByTestId('spec-modal')).not.toBeVisible();
    await expect(page.getByText('Test Specification')).not.toBeVisible();
  });

  test('should close modal when pressing escape key', async ({ page }) => {
    await expect(page.getByText('E2E Test Specification')).toBeVisible();

    // Open modal
    const specRow = page.locator('.grid').filter({ hasText: 'E2E Test Specification' }).first();
    await specRow.click();

    // Verify modal is open
    await expect(page.getByText('Test Specification')).toBeVisible();

    // Press escape key
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(page.getByTestId('spec-modal')).not.toBeVisible();
  });

  test('should close modal when clicking backdrop', async ({ page }) => {
    await expect(page.getByText('E2E Test Specification')).toBeVisible();

    // Open modal
    const specRow = page.locator('.grid').filter({ hasText: 'E2E Test Specification' }).first();
    await specRow.click();

    // Verify modal is open
    await expect(page.getByText('Test Specification')).toBeVisible();

    // Click backdrop (outside modal content)
    await page.locator('.bg-black.bg-opacity-50').click();

    // Verify modal is closed
    await expect(page.getByTestId('spec-modal')).not.toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Override mock to return error
    await page.route('**/api/specs/1', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 500,
          json: { success: false, error: 'Internal server error' }
        });
      }
    });

    await expect(page.getByText('E2E Test Specification')).toBeVisible();

    // Try to open modal
    const specRow = page.locator('.grid').filter({ hasText: 'E2E Test Specification' }).first();
    await specRow.click();

    // Verify error is displayed
    await expect(page.getByText(/error/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
  });

  test('should prevent modal from opening when action buttons are clicked', async ({ page }) => {
    await expect(page.getByText('E2E Test Specification')).toBeVisible();

    // Click on delete button (should not open modal)
    await page.getByTitle('Delete').first().click();

    // Modal should not open (assuming user cancels delete dialog)
    await expect(page.getByTestId('spec-modal')).not.toBeVisible();
  });

  test('should maintain scroll position when modal is opened', async ({ page }) => {
    await expect(page.getByText('E2E Test Specification')).toBeVisible();

    // Scroll down a bit
    await page.evaluate(() => window.scrollTo(0, 100));
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(100);

    // Open modal
    const specRow = page.locator('.grid').filter({ hasText: 'E2E Test Specification' }).first();
    await specRow.click();

    // Verify modal is open and body scroll is locked
    await expect(page.getByText('Test Specification')).toBeVisible();
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('hidden');

    // Close modal
    await page.getByRole('button', { name: /close/i }).click();

    // Verify scroll is restored
    const restoredBodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(restoredBodyOverflow).toBe('unset');
  });

  test('should display loading state during save operation', async ({ page }) => {
    let resolveUpdate: () => void;
    const updatePromise = new Promise<void>(resolve => {
      resolveUpdate = resolve;
    });

    // Mock slow update API
    await page.route('**/api/specs/1', async route => {
      if (route.request().method() === 'PUT') {
        await updatePromise;
        await route.fulfill({
          json: {
            success: true,
            data: { ...mockSpec, title: 'Updated Title' },
            timestamp: '2024-01-01T00:00:00Z'
          }
        });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({
          json: {
            success: true,
            data: mockSpec,
            timestamp: '2024-01-01T00:00:00Z'
          }
        });
      }
    });

    await expect(page.getByText('E2E Test Specification')).toBeVisible();

    // Open modal in edit mode
    await page.getByTitle('Edit').first().click();
    await expect(page.getByDisplayValue('E2E Test Specification')).toBeVisible();

    // Make a change
    const titleInput = page.getByDisplayValue('E2E Test Specification');
    await titleInput.clear();
    await titleInput.fill('Updated Title');

    // Click save
    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    // Verify saving state
    await expect(page.getByText('Saving...')).toBeVisible();
    await expect(saveButton).toBeDisabled();

    // Resolve the update
    resolveUpdate!();

    // Verify save completed
    await expect(page.getByText('Save')).toBeVisible();
    await expect(saveButton).toBeEnabled();
  });
});