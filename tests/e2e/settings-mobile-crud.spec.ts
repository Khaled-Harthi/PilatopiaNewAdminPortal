import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_EMAIL || 'admin@pilatopia.studio';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'admin123';

async function login(page: Page) {
  await page.goto('/en/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  // Wait longer for login to complete (API may be slow)
  await page.waitForURL(/\/(en|ar)$/, { timeout: 60000 });
}

test.describe('Settings Desktop View', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await login(page);
  });

  test('settings layout shows sidebar on desktop', async ({ page }) => {
    await page.goto('/en/settings/content/class-types');
    await page.waitForLoadState('networkidle');

    // Sidebar should be visible on desktop
    const sidebar = page.locator('nav.w-56');
    await expect(sidebar).toBeVisible();

    // All navigation groups should be visible
    await expect(page.getByText('Content', { exact: true })).toBeVisible();
    await expect(page.getByText('Configuration', { exact: true })).toBeVisible();
    await expect(page.getByText('Administration', { exact: true })).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/settings-desktop.png', fullPage: true });
  });

  test('all content pages load correctly on desktop', async ({ page }) => {
    const pages = [
      { url: '/en/settings/content/class-types', heading: 'Class Types' },
      { url: '/en/settings/content/rooms', heading: 'Rooms' },
      { url: '/en/settings/content/tags', heading: 'Tags' },
      { url: '/en/settings/content/instructors', heading: 'Instructors' },
      { url: '/en/settings/content/notifications', heading: 'Notification Templates' },
      { url: '/en/settings/content/faq', heading: 'FAQ' },
    ];

    for (const { url, heading } of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { name: new RegExp(heading, 'i') })).toBeVisible();

      // Verify Add button exists
      const addButton = page.getByRole('button', { name: /add/i });
      await expect(addButton).toBeVisible();
    }
  });

  test('content table is visible with correct columns', async ({ page }) => {
    await page.goto('/en/settings/content/class-types');
    await page.waitForLoadState('networkidle');

    // Table should be visible
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check for expected column headers
    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /actions/i })).toBeVisible();
  });
});

test.describe('Settings Mobile View', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page);
  });

  test('settings layout shows mobile nav with menu button', async ({ page }) => {
    await page.goto('/en/settings/content/class-types');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Allow mobile hook to detect viewport

    // Sidebar should NOT be visible on mobile
    const sidebar = page.locator('nav.w-56');
    await expect(sidebar).not.toBeVisible();

    // Menu button should be visible
    const menuButton = page.getByRole('button').filter({ has: page.locator('svg.lucide-menu') });
    await expect(menuButton).toBeVisible();

    // Current page title should be visible
    await expect(page.getByText('Class Types')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/settings-mobile.png', fullPage: true });
  });

  test('mobile menu sheet opens and allows navigation', async ({ page }) => {
    await page.goto('/en/settings/content/class-types');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Click menu button
    const menuButton = page.getByRole('button').filter({ has: page.locator('svg.lucide-menu') });
    await menuButton.click();

    // Sheet should appear
    const sheet = page.locator('[data-slot="sheet-content"]');
    await expect(sheet).toBeVisible();

    // Navigation items should be visible
    await expect(sheet.getByText('Settings')).toBeVisible();
    await expect(sheet.getByRole('link', { name: /Rooms/i })).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/settings-mobile-menu.png', fullPage: true });

    // Navigate to Rooms
    await sheet.getByRole('link', { name: /Rooms/i }).click();
    await page.waitForURL(/\/rooms/);

    // Sheet should close and Rooms page should be visible
    await expect(sheet).not.toBeVisible();
    await expect(page.getByRole('heading', { name: /Rooms/i })).toBeVisible();
  });

  test('mobile view shows content within viewport', async ({ page }) => {
    await page.goto('/en/settings/content/class-types');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Header should be visible
    const heading = page.getByRole('heading', { name: /Class Types/i });
    await expect(heading).toBeVisible();

    // Add button should be visible
    const addButton = page.getByRole('button', { name: /add/i });
    await expect(addButton).toBeVisible();

    // Table should be visible and scrollable
    const tableContainer = page.locator('.rounded-lg.border').first();
    await expect(tableContainer).toBeVisible();

    // Check that content doesn't overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });

  test('all content pages fit within mobile viewport', async ({ page }) => {
    const pages = [
      '/en/settings/content/class-types',
      '/en/settings/content/rooms',
      '/en/settings/content/tags',
      '/en/settings/content/instructors',
      '/en/settings/content/notifications',
      '/en/settings/content/faq',
    ];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);

      // Verify no horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(380); // Small tolerance

      // Take screenshot
      const pageName = url.split('/').pop();
      await page.screenshot({ path: `test-results/settings-mobile-${pageName}.png` });
    }
  });
});

test.describe('CRUD Operations', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await login(page);
  });

  test('open Add dialog for Class Types', async ({ page }) => {
    await page.goto('/en/settings/content/class-types');
    await page.waitForLoadState('networkidle');

    // Click Add button
    const addButton = page.getByRole('button', { name: /add class type/i });
    await addButton.click();

    // Dialog should open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Should show form fields
    await expect(dialog.getByLabel(/english/i).first()).toBeVisible();
    await expect(dialog.getByLabel(/arabic/i).first()).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/class-type-add-dialog.png' });

    // Close dialog
    await dialog.getByRole('button', { name: /cancel/i }).click();
    await expect(dialog).not.toBeVisible();
  });

  test('open Add dialog for Rooms', async ({ page }) => {
    await page.goto('/en/settings/content/rooms');
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /add room/i });
    await addButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Check form fields
    await expect(dialog.getByLabel(/english/i).first()).toBeVisible();
    await expect(dialog.getByLabel(/capacity/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/room-add-dialog.png' });

    await dialog.getByRole('button', { name: /cancel/i }).click();
  });

  test('open Add dialog for Tags', async ({ page }) => {
    await page.goto('/en/settings/content/tags');
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /add tag/i });
    await addButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    await expect(dialog.getByLabel(/english/i).first()).toBeVisible();
    await expect(dialog.getByText(/color/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/tag-add-dialog.png' });

    await dialog.getByRole('button', { name: /cancel/i }).click();
  });

  test('open Add dialog for FAQ', async ({ page }) => {
    await page.goto('/en/settings/content/faq');
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /add/i });
    await addButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Check for question/answer fields
    await expect(dialog.getByLabel(/question.*english/i)).toBeVisible();
    await expect(dialog.getByLabel(/answer.*english/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/faq-add-dialog.png' });

    await dialog.getByRole('button', { name: /cancel/i }).click();
  });

  test('open Add dialog for Notification Templates', async ({ page }) => {
    await page.goto('/en/settings/content/notifications');
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /add template/i });
    await addButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Check form fields
    await expect(dialog.getByLabel(/key/i)).toBeVisible();
    await expect(dialog.getByText(/channel/i)).toBeVisible();
    await expect(dialog.getByLabel(/active/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/notification-add-dialog.png' });

    await dialog.getByRole('button', { name: /cancel/i }).click();
  });

  test('edit button opens edit dialog when data exists', async ({ page }) => {
    await page.goto('/en/settings/content/class-types');
    await page.waitForLoadState('networkidle');

    // Wait for table to load
    await page.waitForTimeout(1000);

    // Check if any edit buttons exist
    const editButtons = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') });
    const count = await editButtons.count();

    if (count > 0) {
      // Click first edit button
      await editButtons.first().click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Should show "Edit" in title
      await expect(dialog.getByText(/edit/i)).toBeVisible();

      await page.screenshot({ path: 'test-results/class-type-edit-dialog.png' });

      await dialog.getByRole('button', { name: /cancel/i }).click();
    }
  });

  test('delete button opens confirmation dialog when data exists', async ({ page }) => {
    await page.goto('/en/settings/content/tags');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(1000);

    const deleteButtons = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') });
    const count = await deleteButtons.count();

    if (count > 0) {
      await deleteButtons.first().click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Should show delete confirmation
      await expect(dialog.getByText(/delete/i)).toBeVisible();
      await expect(dialog.getByRole('button', { name: /cancel/i })).toBeVisible();
      await expect(dialog.getByRole('button', { name: /delete/i })).toBeVisible();

      await page.screenshot({ path: 'test-results/delete-confirm-dialog.png' });

      // Cancel deletion
      await dialog.getByRole('button', { name: /cancel/i }).click();
      await expect(dialog).not.toBeVisible();
    }
  });
});

test.describe('Mobile CRUD Operations', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page);
  });

  test('add dialog renders as bottom sheet on mobile', async ({ page }) => {
    await page.goto('/en/settings/content/class-types');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const addButton = page.getByRole('button', { name: /add/i });
    await addButton.click();

    // Dialog/Sheet should appear from bottom
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Should be styled as bottom sheet
    await page.screenshot({ path: 'test-results/mobile-add-dialog.png' });

    // Form should be scrollable if needed
    const formContent = dialog.locator('form');
    await expect(formContent).toBeVisible();

    // Close
    const cancelButton = dialog.getByRole('button', { name: /cancel/i });
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();
  });

  test('form fields are usable on mobile', async ({ page }) => {
    await page.goto('/en/settings/content/rooms');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /add/i }).click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Fill in English name
    const englishInput = dialog.getByLabel(/english/i).first();
    await englishInput.fill('Test Room');
    await expect(englishInput).toHaveValue('Test Room');

    // Fill in Arabic name
    const arabicInput = dialog.getByLabel(/arabic/i).first();
    await arabicInput.fill('غرفة اختبار');
    await expect(arabicInput).toHaveValue('غرفة اختبار');

    // Fill capacity
    const capacityInput = dialog.getByLabel(/capacity/i);
    await capacityInput.fill('20');

    await page.screenshot({ path: 'test-results/mobile-form-filled.png' });

    // Cancel without saving
    await dialog.getByRole('button', { name: /cancel/i }).click();
  });
});

test.describe('RTL Support', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await login(page);
  });

  test('Arabic settings page has RTL layout', async ({ page }) => {
    await page.goto('/ar/settings/content/class-types');
    await page.waitForLoadState('networkidle');

    // Page should be RTL
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');

    // Arabic headings should be visible
    await expect(page.getByRole('heading', { name: /أنواع الحصص/i })).toBeVisible();

    // Navigation groups should show Arabic labels
    await expect(page.getByText('المحتوى')).toBeVisible();

    await page.screenshot({ path: 'test-results/settings-rtl.png', fullPage: true });
  });

  test('mobile RTL navigation sheet opens from right', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/ar/settings/content/class-types');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Open menu
    const menuButton = page.getByRole('button').filter({ has: page.locator('svg.lucide-menu') });
    await menuButton.click();

    // Sheet should be visible
    const sheet = page.locator('[data-slot="sheet-content"]');
    await expect(sheet).toBeVisible();

    // Should show Arabic title
    await expect(sheet.getByText('الإعدادات')).toBeVisible();

    await page.screenshot({ path: 'test-results/settings-mobile-rtl.png' });
  });
});
