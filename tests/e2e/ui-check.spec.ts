import { test, expect } from '@playwright/test';

test('capture members page UI', async ({ page }) => {
  // Go to login
  await page.goto('http://localhost:3000/en/login');
  await page.waitForLoadState('networkidle');

  // Login with provided credentials
  await page.getByLabel(/email/i).fill('admin@test.com');
  await page.getByLabel(/password/i).fill('admin123');
  await page.getByRole('button', { name: /login/i }).click();

  // Wait for redirect after login
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');

  // Take screenshot after login
  await page.screenshot({ path: 'test-results/after-login-home.png', fullPage: true });

  // Navigate to members page
  const membersLink = page.getByRole('link', { name: /members|الأعضاء/i });
  if (await membersLink.isVisible()) {
    await membersLink.click();
    await page.waitForLoadState('networkidle');
  } else {
    await page.goto('http://localhost:3000/en/members');
    await page.waitForLoadState('networkidle');
  }

  // Wait for content to load
  await page.waitForTimeout(2000);

  // Take screenshot of members page
  await page.screenshot({ path: 'test-results/members-ui.png', fullPage: true });

  // Take mobile screenshot
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'test-results/members-mobile.png', fullPage: true });
});
