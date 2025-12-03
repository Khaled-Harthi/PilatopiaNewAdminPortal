import { test, expect } from '@playwright/test';

test.describe('Loyalty Tiers CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/en/login');
    await page.fill('input[placeholder="Enter your email"]', process.env.TEST_EMAIL || 'admin@pilatopia.studio');
    await page.fill('input[placeholder="Enter your password"]', process.env.TEST_PASSWORD || 'admin123');
    await page.click('button:has-text("Login")');

    // Wait for login to complete
    await page.waitForURL(/\/(en|ar)\/?$/);

    // Navigate to Loyalty Tiers
    await page.goto('/en/settings/config/loyalty/tiers');
    await page.waitForLoadState('networkidle');
  });

  test('should load the loyalty tiers page', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'Loyalty Tiers' })).toBeVisible();

    // Check Add Tier button exists
    await expect(page.getByRole('button', { name: /Add Tier/i })).toBeVisible();

    // Check table headers
    await expect(page.getByRole('columnheader', { name: 'Color' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Min Classes' })).toBeVisible();
  });

  test('should open add tier dialog', async ({ page }) => {
    await page.click('button:has-text("Add Tier")');

    // Check dialog opens
    await expect(page.getByRole('heading', { name: 'Add Tier' })).toBeVisible();

    // Check form fields
    await expect(page.getByLabel('Tier Name')).toBeVisible();
    await expect(page.getByLabel('Minimum Classes')).toBeVisible();
    await expect(page.getByLabel('Color')).toBeVisible();

    // Cancel button should close the dialog
    await page.click('button:has-text("Cancel")');
    await expect(page.getByRole('heading', { name: 'Add Tier' })).not.toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('button:has-text("Add Tier")');
    await page.waitForSelector('text=Add Tier');

    // Try to submit empty form
    await page.click('button:has-text("Add"):not(:has-text("Add Tier"))');

    // Should show validation error
    await expect(page.getByText('Required')).toBeVisible();
  });
});

test.describe('Loyalty Redemptions CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/en/login');
    await page.fill('input[placeholder="Enter your email"]', process.env.TEST_EMAIL || 'admin@pilatopia.studio');
    await page.fill('input[placeholder="Enter your password"]', process.env.TEST_PASSWORD || 'admin123');
    await page.click('button:has-text("Login")');

    // Wait for login to complete
    await page.waitForURL(/\/(en|ar)\/?$/);

    // Navigate to Loyalty Redemptions
    await page.goto('/en/settings/config/loyalty/redemptions');
    await page.waitForLoadState('networkidle');
  });

  test('should load the loyalty redemptions page', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'Loyalty Redemptions' })).toBeVisible();

    // Check Add Redemption button exists
    await expect(page.getByRole('button', { name: /Add Redemption/i })).toBeVisible();

    // Check table headers
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Type' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Points' })).toBeVisible();
  });

  test('should open add redemption dialog with tabs', async ({ page }) => {
    await page.click('button:has-text("Add Redemption")');

    // Check dialog opens
    await expect(page.getByRole('heading', { name: 'Add Redemption' })).toBeVisible();

    // Check language tabs
    await expect(page.getByRole('tab', { name: 'English' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'العربية' })).toBeVisible();

    // Check form fields
    await expect(page.getByLabel('Name (English)')).toBeVisible();
    await expect(page.getByLabel('Points Required')).toBeVisible();

    // Switch to Arabic tab
    await page.click('role=tab[name="العربية"]');
    await expect(page.getByLabel('Name (Arabic)')).toBeVisible();

    // Cancel button should close the dialog
    await page.click('button:has-text("Cancel")');
    await expect(page.getByRole('heading', { name: 'Add Redemption' })).not.toBeVisible();
  });

  test('should show redemption type selector', async ({ page }) => {
    await page.click('button:has-text("Add Redemption")');
    await page.waitForSelector('text=Add Redemption');

    // Check type selector
    await page.click('[data-slot="select-trigger"]');
    await expect(page.getByRole('option', { name: 'Discount Code' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Free Class' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Merchandise' })).toBeVisible();
  });
});

test.describe('Loyalty Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('loyalty tiers page should be mobile responsive', async ({ page }) => {
    // Login first
    await page.goto('/en/login');
    await page.fill('input[placeholder="Enter your email"]', process.env.TEST_EMAIL || 'admin@pilatopia.studio');
    await page.fill('input[placeholder="Enter your password"]', process.env.TEST_PASSWORD || 'admin123');
    await page.click('button:has-text("Login")');
    await page.waitForURL(/\/(en|ar)\/?$/);

    await page.goto('/en/settings/config/loyalty/tiers');
    await page.waitForLoadState('networkidle');

    // Check page loads
    await expect(page.getByRole('heading', { name: 'Loyalty Tiers' })).toBeVisible();

    // Open add dialog - should show as bottom sheet on mobile
    await page.click('button:has-text("Add Tier")');
    await expect(page.getByRole('heading', { name: 'Add Tier' })).toBeVisible();
  });

  test('loyalty redemptions page should be mobile responsive', async ({ page }) => {
    // Login first
    await page.goto('/en/login');
    await page.fill('input[placeholder="Enter your email"]', process.env.TEST_EMAIL || 'admin@pilatopia.studio');
    await page.fill('input[placeholder="Enter your password"]', process.env.TEST_PASSWORD || 'admin123');
    await page.click('button:has-text("Login")');
    await page.waitForURL(/\/(en|ar)\/?$/);

    await page.goto('/en/settings/config/loyalty/redemptions');
    await page.waitForLoadState('networkidle');

    // Check page loads
    await expect(page.getByRole('heading', { name: 'Loyalty Redemptions' })).toBeVisible();

    // Open add dialog
    await page.click('button:has-text("Add Redemption")');
    await expect(page.getByRole('heading', { name: 'Add Redemption' })).toBeVisible();
  });
});
