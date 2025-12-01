import { test, expect } from '@playwright/test';

test('capture member detail page', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // Go to login
  await page.goto('http://localhost:3000/en/login');
  await page.waitForLoadState('networkidle');

  // Login
  await page.getByLabel(/email/i).fill('admin@test.com');
  await page.getByLabel(/password/i).fill('admin123');
  await page.getByRole('button', { name: /login/i }).click();

  // Wait for redirect
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');

  // Navigate to members page
  await page.goto('http://localhost:3000/en/members');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Try to find a member with an active membership (look for one showing classes remaining)
  // Or just click on the second member to see different data
  const memberLinks = page.locator('a[href*="/members/"]');
  const count = await memberLinks.count();
  console.log('Found', count, 'members');

  // Click on second member if available, otherwise first
  const memberIndex = count > 1 ? 1 : 0;
  await memberLinks.nth(memberIndex).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Capture desktop screenshot
  await page.screenshot({ path: 'test-results/member-detail.png', fullPage: true });

  // Capture mobile screenshot
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'test-results/member-detail-mobile.png', fullPage: true });
});
