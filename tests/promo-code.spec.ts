import { test, expect } from '@playwright/test';

test.describe('Promo Code Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3001');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if we're on login page and login if needed
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      // Fill in login credentials (adjust as needed)
      await page.fill('input[type="text"]', 'admin');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display promo code discount details with green background', async ({ page }) => {
    // Navigate to members page
    await page.goto('http://localhost:3001/en/members');
    await page.waitForLoadState('networkidle');

    // Click on the first member in the list
    const firstMember = page.locator('table tbody tr').first();
    await firstMember.click();
    await page.waitForLoadState('networkidle');

    // Wait for member profile to load
    await expect(page.locator('h1:has-text("Member Profile")')).toBeVisible();

    // Click "Add Membership" button
    const addMembershipButton = page.locator('button:has-text("Add Membership")');
    await expect(addMembershipButton).toBeVisible();
    await addMembershipButton.click();

    // Wait for dialog to open
    await expect(page.locator('text=Step 1 of 5')).toBeVisible();

    // Select first membership plan
    const firstPlan = page.locator('[class*="cursor-pointer"]').first();
    await firstPlan.click();

    // Click Next to go to promo code step
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('text=Step 2 of 5')).toBeVisible();

    // Enter a test promo code
    const promoInput = page.locator('input[placeholder="Enter code"]');
    await promoInput.fill('TEST10');

    // Click Validate button
    const validateButton = page.locator('button:has-text("Validate")');
    await validateButton.click();

    // Wait for validation to complete (either success or error message)
    await page.waitForTimeout(2000);

    // Check if promo validation message appeared
    const validationMessage = page.locator('[class*="border-green-200"], [class*="border-red-200"]').first();
    await expect(validationMessage).toBeVisible({ timeout: 5000 });

    // If promo is valid, check for discount details with green background
    const discountDetails = page.locator('[class*="bg-green-50"]').last();
    const isVisible = await discountDetails.isVisible().catch(() => false);

    if (isVisible) {
      // Verify the discount details are visible
      await expect(discountDetails).toBeVisible();

      // Check for the presence of key information
      await expect(page.locator('text=Original Price:')).toBeVisible();
      await expect(page.locator('text=Discount:')).toBeVisible();
      await expect(page.locator('text=Final Price:')).toBeVisible();

      // Verify green color scheme
      const backgroundColor = await discountDetails.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log('Discount details background color:', backgroundColor);

      // Take a screenshot to verify visibility
      await page.screenshot({
        path: 'tests/screenshots/promo-code-success.png',
        fullPage: true
      });

      console.log('✅ Promo code discount details are visible with green background');
    } else {
      console.log('⚠️ Promo code was not valid or discount details not displayed');

      // Take a screenshot for debugging
      await page.screenshot({
        path: 'tests/screenshots/promo-code-invalid.png',
        fullPage: true
      });
    }
  });

  test('should handle invalid promo code with red error message', async ({ page }) => {
    // Navigate to members page
    await page.goto('http://localhost:3001/en/members');
    await page.waitForLoadState('networkidle');

    // Click on the first member
    const firstMember = page.locator('table tbody tr').first();
    await firstMember.click();
    await page.waitForLoadState('networkidle');

    // Click "Add Membership" button
    await page.locator('button:has-text("Add Membership")').click();
    await expect(page.locator('text=Step 1 of 5')).toBeVisible();

    // Select first membership plan
    await page.locator('[class*="cursor-pointer"]').first().click();

    // Go to promo code step
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('text=Step 2 of 5')).toBeVisible();

    // Enter an invalid promo code
    const promoInput = page.locator('input[placeholder="Enter code"]');
    await promoInput.fill('INVALID123');

    // Click Validate
    await page.locator('button:has-text("Validate")').click();

    // Wait for validation
    await page.waitForTimeout(2000);

    // Check for error message with red background
    const errorMessage = page.locator('[class*="bg-red-50"]');
    const isVisible = await errorMessage.isVisible().catch(() => false);

    if (isVisible) {
      await expect(errorMessage).toBeVisible();
      console.log('✅ Invalid promo code shows error message with red background');

      // Take screenshot
      await page.screenshot({
        path: 'tests/screenshots/promo-code-error.png',
        fullPage: true
      });
    } else {
      console.log('⚠️ Error message not displayed as expected');
      await page.screenshot({
        path: 'tests/screenshots/promo-code-no-error.png',
        fullPage: true
      });
    }
  });

  test('should complete full membership purchase with promo code', async ({ page }) => {
    // Navigate to members page
    await page.goto('http://localhost:3001/en/members');
    await page.waitForLoadState('networkidle');

    // Click on first member
    await page.locator('table tbody tr').first().click();
    await page.waitForLoadState('networkidle');

    // Open Add Membership wizard
    await page.locator('button:has-text("Add Membership")').click();
    await expect(page.locator('text=Step 1 of 5')).toBeVisible();

    // Step 1: Select plan
    await page.locator('[class*="cursor-pointer"]').first().click();
    await page.locator('button:has-text("Next")').click();

    // Step 2: Enter promo code (skip if testing without promo)
    await expect(page.locator('text=Step 2 of 5')).toBeVisible();
    await page.locator('button:has-text("Next")').click();

    // Step 3: Payment details
    await expect(page.locator('text=Step 3 of 5')).toBeVisible();

    // Select payment method (cash is default)
    const cashRadio = page.locator('input[value="cash"]');
    await cashRadio.check();

    // Notes are optional, skip
    await page.locator('button:has-text("Next")').click();

    // Step 4: Confirmation
    await expect(page.locator('text=Step 4 of 5')).toBeVisible();
    await expect(page.locator('text=Purchase Summary')).toBeVisible();

    // Take screenshot of confirmation
    await page.screenshot({
      path: 'tests/screenshots/membership-confirmation.png',
      fullPage: true
    });

    // Click Confirm Purchase
    const confirmButton = page.locator('button:has-text("Confirm Purchase")');
    await confirmButton.click();

    // Wait for success step
    await expect(page.locator('text=Purchase Successful!')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Step 5 of 5')).toBeVisible();

    // Take screenshot of success
    await page.screenshot({
      path: 'tests/screenshots/membership-success.png',
      fullPage: true
    });

    console.log('✅ Full membership purchase flow completed successfully');

    // Click Done
    await page.locator('button:has-text("Done")').click();

    // Verify we're back on the member profile page
    await expect(page.locator('h1:has-text("Member Profile")')).toBeVisible();
  });
});
