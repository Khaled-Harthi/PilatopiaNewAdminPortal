import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_EMAIL || 'admin@pilatopia.studio';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'admin123';

async function login(page: Page) {
  await page.goto('/en/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(en|ar)$/, { timeout: 60000 });
}

test.describe('Banner Management', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await login(page);
  });

  test('banner list page loads correctly', async ({ page }) => {
    await page.goto('/en/settings/content/banners');
    await page.waitForLoadState('networkidle');

    // Page heading should be visible
    await expect(page.getByRole('heading', { name: /banners/i })).toBeVisible();

    // Add button should be visible
    const addButton = page.getByRole('link', { name: /add banner/i });
    await expect(addButton).toBeVisible();

    await page.screenshot({ path: 'test-results/banner-list.png' });
  });

  test('new banner form page loads correctly', async ({ page }) => {
    await page.goto('/en/settings/content/banners/new');
    await page.waitForLoadState('networkidle');

    // Page heading should be visible
    await expect(page.getByRole('heading', { name: /add new banner/i })).toBeVisible();

    // Image upload area should be visible
    await expect(page.getByText(/banner image/i)).toBeVisible();
    await expect(page.getByText(/drag and drop/i)).toBeVisible();

    // Language tabs should be visible
    await expect(page.getByRole('tab', { name: /english/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /arabic/i })).toBeVisible();

    // Form fields should be visible
    await expect(page.getByLabel(/title.*en/i)).toBeVisible();
    await expect(page.getByText(/content.*en/i)).toBeVisible();

    // Display type radio should be visible
    await expect(page.getByText(/display type/i)).toBeVisible();
    await expect(page.getByLabel(/modal/i)).toBeVisible();
    await expect(page.getByLabel(/full screen/i)).toBeVisible();

    // CTA destination should be visible
    await expect(page.getByText(/cta destination/i)).toBeVisible();

    // Submit button should be visible
    await expect(page.getByRole('button', { name: /create banner/i })).toBeVisible();

    await page.screenshot({ path: 'test-results/banner-new-form.png', fullPage: true });
  });

  test('banner form shows validation errors without image', async ({ page }) => {
    await page.goto('/en/settings/content/banners/new');
    await page.waitForLoadState('networkidle');

    // Fill in required text fields
    await page.getByLabel(/title.*en/i).fill('Test Banner Title');

    // Fill in rich text content (we need to click into the editor)
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await editor.fill('Test banner content');

    // Try to submit without an image
    await page.getByRole('button', { name: /create banner/i }).click();

    // Should show error toast for missing image
    await expect(page.getByText(/please upload an image/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/banner-form-validation.png' });
  });

  test('banner form switches between language tabs', async ({ page }) => {
    await page.goto('/en/settings/content/banners/new');
    await page.waitForLoadState('networkidle');

    // Should start on English tab
    await expect(page.getByLabel(/title.*en/i)).toBeVisible();

    // Switch to Arabic tab
    await page.getByRole('tab', { name: /arabic/i }).click();

    // Arabic fields should be visible
    await expect(page.getByLabel(/title.*ar/i)).toBeVisible();
    await expect(page.getByPlaceholder(/عرض الصيف/i)).toBeVisible();

    // Switch back to English
    await page.getByRole('tab', { name: /english/i }).click();
    await expect(page.getByLabel(/title.*en/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/banner-form-tabs.png' });
  });

  test('banner form CTA destination dropdown works', async ({ page }) => {
    await page.goto('/en/settings/content/banners/new');
    await page.waitForLoadState('networkidle');

    // Click on CTA destination dropdown
    const ctaSelect = page.locator('button').filter({ hasText: /select destination/i });
    await ctaSelect.click();

    // Options should be visible
    await expect(page.getByRole('option', { name: /no link/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /custom url/i })).toBeVisible();

    // Select custom URL
    await page.getByRole('option', { name: /custom url/i }).click();

    // Custom URL input should appear
    await expect(page.getByLabel(/custom url/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/banner-form-cta.png' });
  });

  test('cancel button navigates back to banner list', async ({ page }) => {
    await page.goto('/en/settings/content/banners/new');
    await page.waitForLoadState('networkidle');

    // Click cancel button
    await page.getByRole('button', { name: /cancel/i }).click();

    // Should navigate back to banner list
    await page.waitForURL(/\/settings\/content\/banners$/);
    await expect(page.getByRole('heading', { name: /banners/i })).toBeVisible();
  });

  test('back button navigates to banner list', async ({ page }) => {
    await page.goto('/en/settings/content/banners/new');
    await page.waitForLoadState('networkidle');

    // Click back button (Banners link)
    await page.getByRole('button', { name: /banners/i }).click();

    // Should navigate back to banner list
    await page.waitForURL(/\/settings\/content\/banners$/);
  });
});

test.describe('Banner Mobile View', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page);
  });

  test('banner form is usable on mobile', async ({ page }) => {
    await page.goto('/en/settings/content/banners/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Page heading should be visible
    await expect(page.getByRole('heading', { name: /add new banner/i })).toBeVisible();

    // Image upload should be visible
    await expect(page.getByText(/banner image/i)).toBeVisible();

    // Form should fit within viewport (no horizontal overflow)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(380);

    await page.screenshot({ path: 'test-results/banner-mobile-form.png', fullPage: true });
  });

  test('banner form tabs work on mobile', async ({ page }) => {
    await page.goto('/en/settings/content/banners/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Tabs should be visible and usable
    const arabicTab = page.getByRole('tab', { name: /arabic/i });
    await expect(arabicTab).toBeVisible();
    await arabicTab.click();

    // Arabic content should be visible
    await expect(page.getByPlaceholder(/عرض الصيف/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/banner-mobile-arabic.png' });
  });
});

test.describe('Banner RTL Support', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await login(page);
  });

  test('Arabic banner form has RTL layout', async ({ page }) => {
    await page.goto('/ar/settings/content/banners/new');
    await page.waitForLoadState('networkidle');

    // Page should be RTL
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');

    // Arabic heading should be visible
    await expect(page.getByRole('heading', { name: /إضافة بانر جديد/i })).toBeVisible();

    // Arabic labels should be visible
    await expect(page.getByText(/صورة البانر/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/banner-rtl.png', fullPage: true });
  });
});
