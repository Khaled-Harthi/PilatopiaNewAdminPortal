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

test.describe('Home Layouts - Navigation', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await login(page);
  });

  test('settings nav shows Home Layouts link', async ({ page }) => {
    await page.goto('/en/settings/content');
    await page.waitForLoadState('networkidle');

    // Home Layouts link should be visible in the sidebar
    const homeLayoutsLink = page.getByRole('link', { name: /home layouts/i });
    await expect(homeLayoutsLink).toBeVisible();

    await page.screenshot({ path: 'test-results/home-layouts-nav.png' });
  });

  test('clicking Home Layouts navigates to list page', async ({ page }) => {
    await page.goto('/en/settings/content');
    await page.waitForLoadState('networkidle');

    // Click on Home Layouts link
    await page.getByRole('link', { name: /home layouts/i }).click();
    await page.waitForURL(/\/settings\/content\/home-layouts$/);

    // Page heading should be visible
    await expect(page.getByRole('heading', { name: /home layouts/i })).toBeVisible();
  });
});

test.describe('Home Layouts - List Page', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await login(page);
  });

  test('home layouts list page loads correctly', async ({ page }) => {
    await page.goto('/en/settings/content/home-layouts');
    await page.waitForLoadState('networkidle');

    // Page heading should be visible
    await expect(page.getByRole('heading', { name: /home layouts/i })).toBeVisible();

    // Description text should be visible
    await expect(page.getByText(/manage mobile app home screen layouts/i)).toBeVisible();

    // New Layout button should be visible
    const newButton = page.getByRole('link', { name: /new layout/i });
    await expect(newButton).toBeVisible();

    await page.screenshot({ path: 'test-results/home-layouts-list.png' });
  });

  test('new layout button navigates to create form', async ({ page }) => {
    await page.goto('/en/settings/content/home-layouts');
    await page.waitForLoadState('networkidle');

    // Click new layout button
    await page.getByRole('link', { name: /new layout/i }).click();
    await page.waitForURL(/\/settings\/content\/home-layouts\/new$/);

    // Should see create form heading
    await expect(page.getByRole('heading', { name: /new layout/i })).toBeVisible();
  });
});

test.describe('Home Layouts - Create Form', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await login(page);
  });

  test('new layout form page loads correctly', async ({ page }) => {
    await page.goto('/en/settings/content/home-layouts/new');
    await page.waitForLoadState('networkidle');

    // Page heading should be visible
    await expect(page.getByRole('heading', { name: /new layout/i })).toBeVisible();

    // Description should be visible
    await expect(page.getByText(/enter a name for your new layout/i)).toBeVisible();

    // Layout Name input should be visible
    await expect(page.getByLabel(/layout name/i)).toBeVisible();

    // Submit and Cancel buttons should be visible
    await expect(page.getByRole('button', { name: /create & continue/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();

    await page.screenshot({ path: 'test-results/home-layouts-new-form.png' });
  });

  test('layout name field shows validation on empty submit', async ({ page }) => {
    await page.goto('/en/settings/content/home-layouts/new');
    await page.waitForLoadState('networkidle');

    // Leave name empty and try to submit
    await page.getByRole('button', { name: /create & continue/i }).click();

    // Should show validation error
    await expect(page.getByText(/name is required/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/home-layouts-validation.png' });
  });

  test('cancel button navigates back to list', async ({ page }) => {
    await page.goto('/en/settings/content/home-layouts/new');
    await page.waitForLoadState('networkidle');

    // Click cancel button
    await page.getByRole('button', { name: /cancel/i }).click();

    // Should navigate back to layouts list
    await page.waitForURL(/\/settings\/content\/home-layouts$/);
    await expect(page.getByRole('heading', { name: /home layouts/i })).toBeVisible();
  });

  test('back button navigates to layouts list', async ({ page }) => {
    await page.goto('/en/settings/content/home-layouts/new');
    await page.waitForLoadState('networkidle');

    // Click back button (Layouts link)
    await page.getByRole('button', { name: /layouts/i }).click();

    // Should navigate back to layouts list
    await page.waitForURL(/\/settings\/content\/home-layouts$/);
  });
});

test.describe('Home Layouts - Mobile View', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page);
  });

  test('home layouts list is usable on mobile', async ({ page }) => {
    await page.goto('/en/settings/content/home-layouts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Page heading should be visible
    await expect(page.getByRole('heading', { name: /home layouts/i })).toBeVisible();

    // New layout button should be visible and accessible
    const newButton = page.getByRole('link', { name: /new layout/i });
    await expect(newButton).toBeVisible();

    // Page should not have horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(380);

    await page.screenshot({ path: 'test-results/home-layouts-mobile-list.png' });
  });

  test('create form is usable on mobile', async ({ page }) => {
    await page.goto('/en/settings/content/home-layouts/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Page heading should be visible
    await expect(page.getByRole('heading', { name: /new layout/i })).toBeVisible();

    // Form elements should be accessible
    await expect(page.getByLabel(/layout name/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create & continue/i })).toBeVisible();

    // Page should not have horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(380);

    await page.screenshot({ path: 'test-results/home-layouts-mobile-form.png', fullPage: true });
  });
});

test.describe('Home Layouts - RTL Support', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await login(page);
  });

  test('Arabic list page has RTL layout', async ({ page }) => {
    await page.goto('/ar/settings/content/home-layouts');
    await page.waitForLoadState('networkidle');

    // Page should be RTL
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');

    // Arabic heading should be visible
    await expect(page.getByRole('heading', { name: /تخطيطات الرئيسية/i })).toBeVisible();

    // Arabic button text
    await expect(page.getByRole('link', { name: /تخطيط جديد/i })).toBeVisible();

    await page.screenshot({ path: 'test-results/home-layouts-rtl-list.png' });
  });

  test('Arabic create form has RTL layout', async ({ page }) => {
    await page.goto('/ar/settings/content/home-layouts/new');
    await page.waitForLoadState('networkidle');

    // Page should be RTL
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');

    // Arabic heading should be visible
    await expect(page.getByRole('heading', { name: /تخطيط جديد/i })).toBeVisible();

    // Arabic label
    await expect(page.getByText(/اسم التخطيط/i)).toBeVisible();

    await page.screenshot({ path: 'test-results/home-layouts-rtl-form.png' });
  });
});
