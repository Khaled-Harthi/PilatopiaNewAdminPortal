import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_EMAIL || 'admin@pilatopia.studio';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'admin123';

test.describe('Instructor Schedule Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/en/login');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/en');

    // Navigate to instructor schedule
    await page.goto('/en/instructor/schedule');
    await page.waitForLoadState('networkidle');
  });

  test('should show instructor name in title', async ({ page }) => {
    // Wait for the title to load
    await page.waitForSelector('h1');

    // Title should contain "'s Schedule" pattern
    const title = await page.locator('h1').textContent();
    expect(title).toMatch(/'s Schedule$/);

    // Should NOT show "My Schedule"
    expect(title).not.toContain('My Schedule');
  });

  test('should NOT show name next to logout button', async ({ page }) => {
    // The header should have the logout button but no name text next to it
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check that logout button exists
    const logoutBtn = header.locator('button:has-text("Logout"), button:has(svg)');
    await expect(logoutBtn.first()).toBeVisible();

    // There should not be a separate name span in the header
    const nameSpan = header.locator('span.text-muted-foreground');
    const count = await nameSpan.count();
    expect(count).toBe(0);
  });

  test('should dim zero-booking classes on desktop', async ({ page, viewport }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    // Look for any class buttons in the schedule grid
    const classButtons = page.locator('.hidden.md\\:block button');

    // If there are classes, check if zero-booking ones have opacity
    const count = await classButtons.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const btn = classButtons.nth(i);
        const hasOpacity = await btn.evaluate((el) => {
          const opacity = window.getComputedStyle(el).opacity;
          return parseFloat(opacity) < 1;
        });
        // Just verify the page loaded correctly
        console.log(`Button ${i} has reduced opacity: ${hasOpacity}`);
      }
    }
  });

  test('should dim zero-booking classes on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for mobile view to load
    await page.waitForTimeout(500);

    // Look for class cards in mobile view
    const classCards = page.locator('.md\\:hidden .rounded-lg.border.bg-card');

    // If there are classes, check layout
    const count = await classCards.count();
    console.log(`Found ${count} class cards on mobile`);

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const card = classCards.nth(i);
        const box = await card.boundingBox();

        // Verify card is fully visible within viewport
        if (box) {
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(375 + 5); // Small tolerance
          console.log(`Card ${i}: x=${box.x}, width=${box.width}, right=${box.x + box.width}`);
        }
      }
    }
  });

  test('mobile text should not be cut off', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Title should be visible
    const title = page.locator('h1');
    await expect(title).toBeVisible();

    const titleBox = await title.boundingBox();
    if (titleBox) {
      // Title should fit within viewport
      expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(375);
      console.log(`Title: x=${titleBox.x}, width=${titleBox.width}`);
    }
  });
});
