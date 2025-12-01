import { test, expect } from '@playwright/test';

test.describe('Instructor Portal', () => {
  test('instructor can login and see schedule', async ({ page }) => {
    // Go to login page
    await page.goto('/en/login');

    // Fill in instructor credentials
    await page.fill('input[type="email"]', 'instructor@test.com');
    await page.fill('input[type="password"]', 'test123');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation to instructor schedule
    await page.waitForURL('**/instructor/schedule', { timeout: 10000 });

    // Verify we're on the instructor schedule page
    expect(page.url()).toContain('/instructor/schedule');

    // Verify the page title shows "My Schedule"
    await expect(page.locator('h1')).toContainText(/My Schedule|جدولي/);

    // Verify header shows instructor name
    await expect(page.getByText('Test Instructor')).toBeVisible();

    // Verify stats bar is visible (use exact text match)
    await expect(page.getByText('Classes', { exact: true })).toBeVisible();
    await expect(page.getByText('Booked', { exact: true })).toBeVisible();
    await expect(page.getByText('Fill Rate')).toBeVisible();
  });

  test('instructor cannot access admin pages', async ({ page }) => {
    // Login as instructor
    await page.goto('/en/login');
    await page.fill('input[type="email"]', 'instructor@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/instructor/schedule', { timeout: 10000 });

    // Verify we're on the instructor page first
    expect(page.url()).toContain('/instructor/schedule');

    // Try to access admin page directly
    await page.goto('/en/schedule');

    // Wait a bit for redirect to happen
    await page.waitForTimeout(2000);

    // Should redirect back to instructor schedule (or stay on login if session issues)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(instructor\/schedule|login)/);
  });

  test('mobile view has expandable class cards', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Login as instructor
    await page.goto('/en/login');
    await page.fill('input[type="email"]', 'instructor@test.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/instructor/schedule', { timeout: 10000 });

    // Wait for schedule to load
    await page.waitForSelector('text=My Schedule');

    // Verify mobile list view is showing (day headers visible)
    await expect(page.getByText('Saturday')).toBeVisible();
    await expect(page.getByText('Sunday')).toBeVisible();

    // Find a visible class card and click to expand
    const classCard = page.getByRole('button', { name: /Beginners Reformer.*Fuyu Room/i }).first();
    await expect(classCard).toBeVisible();
    await classCard.click();

    // Verify expanded content shows (Bookings header or No bookings message)
    await expect(page.getByText(/Bookings|No bookings yet/)).toBeVisible();
  });
});
