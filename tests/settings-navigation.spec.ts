import { test, expect } from '@playwright/test';

test.describe('Settings Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login as super_admin
    await page.goto('/en/login');
    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'admin@pilatopia.studio');
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(en|ar)$/);
  });

  test('super_admin can access settings and navigate sections', async ({ page }) => {
    // Navigate to settings
    await page.click('a[href*="/settings"]');
    await page.waitForURL(/\/settings/);

    // Should redirect to /settings/content/class-types
    await expect(page).toHaveURL(/\/settings\/content\/class-types/);

    // Verify left navigation exists
    const settingsNav = page.locator('nav').filter({ hasText: 'Content' });
    await expect(settingsNav).toBeVisible();

    // Verify all Content section links
    await expect(page.getByRole('link', { name: /Class Types/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Rooms/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Tags/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Instructors/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Notifications/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /FAQ/i })).toBeVisible();

    // Verify Configuration section
    await expect(page.getByRole('link', { name: /Membership Plans/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Loyalty Program/i })).toBeVisible();

    // Verify Administration section
    await expect(page.getByRole('link', { name: /Admin Users/i })).toBeVisible();
  });

  test('navigate through Content section pages', async ({ page }) => {
    await page.goto('/en/settings/content/class-types');
    await expect(page.getByRole('heading', { name: /Class Types/i })).toBeVisible();

    await page.click('a[href*="/settings/content/rooms"]');
    await expect(page.getByRole('heading', { name: /Rooms/i })).toBeVisible();

    await page.click('a[href*="/settings/content/tags"]');
    await expect(page.getByRole('heading', { name: /Tags/i })).toBeVisible();

    await page.click('a[href*="/settings/content/instructors"]');
    await expect(page.getByRole('heading', { name: /Instructors/i })).toBeVisible();

    await page.click('a[href*="/settings/content/notifications"]');
    await expect(page.getByRole('heading', { name: /Notifications/i })).toBeVisible();

    await page.click('a[href*="/settings/content/faq"]');
    await expect(page.getByRole('heading', { name: /FAQ/i })).toBeVisible();
  });

  test('navigate through Configuration section pages', async ({ page }) => {
    await page.goto('/en/settings/config/plans');
    await expect(page.getByRole('heading', { name: /Membership Plans/i })).toBeVisible();

    // Navigate to loyalty program (should redirect to tiers)
    await page.click('a[href*="/settings/config/loyalty"]');
    await expect(page).toHaveURL(/\/settings\/config\/loyalty\/tiers/);
    await expect(page.getByRole('heading', { name: /Loyalty Tiers/i })).toBeVisible();
  });

  test('navigate to Admin Users page', async ({ page }) => {
    await page.goto('/en/settings/admins');
    await expect(page.getByRole('heading', { name: /Admin Users/i })).toBeVisible();
  });

  test('RTL support in Arabic', async ({ page }) => {
    await page.goto('/ar/settings/content/class-types');

    // Should show Arabic titles
    await expect(page.getByRole('heading', { name: /أنواع الحصص/i })).toBeVisible();

    // Navigation should have RTL direction
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
  });
});
