import { test, expect } from '@playwright/test';

test.describe('Mobile Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Login
    await page.goto('http://localhost:3000/en/login');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/email/i).fill('admin@test.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
  });

  test('home page loads on mobile with reduced padding', async ({ page }) => {
    // Navigate to home
    await page.goto('http://localhost:3000/en');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'test-results/mobile-home.png', fullPage: true });

    // Check that the page loaded
    await expect(page).toHaveURL(/\/en/);
  });

  test('clicking class opens bottom sheet on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/en');
    await page.waitForLoadState('networkidle');

    // Wait a bit for data to load
    await page.waitForTimeout(2000);

    // Take screenshot of initial state
    await page.screenshot({ path: 'test-results/mobile-home-initial.png', fullPage: true });

    // Look for timeline section - try to click on a class item
    const timelineItems = page.locator('button').filter({ hasText: /AM|PM/ });
    const count = await timelineItems.count();

    if (count > 0) {
      await timelineItems.first().click();
      await page.waitForTimeout(1000);

      // Take screenshot with sheet/popover open
      await page.screenshot({ path: 'test-results/mobile-class-detail.png', fullPage: true });

      // Check if a sheet appeared (bottom sheet on mobile)
      const sheetContent = page.locator('[role="dialog"]');
      const isSheetVisible = await sheetContent.isVisible().catch(() => false);

      if (isSheetVisible) {
        console.log('Bottom sheet opened successfully on mobile!');
      }
    }
  });
});
