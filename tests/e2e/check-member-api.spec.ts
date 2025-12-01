import { test, expect } from '@playwright/test';

test('check member API response', async ({ page }) => {
  // Listen for API responses
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/admin/members/') && !url.includes('/memberships') && !url.includes('/bookings')) {
      console.log('\n=== MEMBER PROFILE API RESPONSE ===');
      console.log('URL:', url);
      try {
        const json = await response.json();
        console.log('Response:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Could not parse JSON');
      }
    }
  });

  // Login
  await page.goto('http://localhost:3000/en/login');
  await page.waitForLoadState('networkidle');
  await page.getByLabel(/email/i).fill('admin@test.com');
  await page.getByLabel(/password/i).fill('admin123');
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForTimeout(3000);

  // Navigate to members
  await page.goto('http://localhost:3000/en/members');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click first member
  const firstMemberLink = page.locator('a[href*="/members/"]').first();
  await firstMemberLink.click();
  await page.waitForTimeout(5000);
});
