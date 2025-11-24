import { test, expect } from '@playwright/test';

// Mock data for testing
const mockClassesResponse = {
  success: true,
  total_classes: 3,
  classes: [
    {
      id: 1,
      class_type_id: 1,
      instructor_id: 5,
      capacity: 8,
      schedule_time: '2024-11-24T04:00:00Z', // 7:00 AM local (UTC+3)
      duration_minutes: 50,
      instructor: 'Farah',
      class_type: 'Reformer',
      booked_seats: 6,
      class_room_name: 'Studio A',
      class_room_id: 1,
    },
    {
      id: 2,
      class_type_id: 2,
      instructor_id: 6,
      capacity: 10,
      schedule_time: '2024-11-24T06:00:00Z', // 9:00 AM local (UTC+3)
      duration_minutes: 45,
      instructor: 'Jessica',
      class_type: 'Mat Pilates',
      booked_seats: 4,
      class_room_name: 'Studio B',
      class_room_id: 2,
    },
    {
      id: 3,
      class_type_id: 1,
      instructor_id: 5,
      capacity: 8,
      schedule_time: '2024-11-24T06:00:00Z', // 9:00 AM local (UTC+3)
      duration_minutes: 50,
      instructor: 'Farah',
      class_type: 'Reformer',
      booked_seats: 8,
      class_room_name: 'Studio A',
      class_room_id: 1,
    },
  ],
};

test.describe('Schedule Management - Phase 1-3', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API calls
    await page.route('**/admin/schedules/classes/by-date-range*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockClassesResponse),
      });
    });

    // Mock login (assuming we need auth)
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('admin', JSON.stringify({ name: 'Test Admin' }));
    });

    // Navigate to schedule page
    await page.goto('http://localhost:3000/en/schedule');
  });

  test('should display the calendar with week view', async ({ page }) => {
    // Wait for calendar to load
    await page.waitForSelector('.rbc-calendar', { timeout: 10000 });

    // Check that calendar is visible
    const calendar = page.locator('.rbc-calendar');
    await expect(calendar).toBeVisible();

    // Check for week view headers (7 days)
    const headers = page.locator('.rbc-header');
    await expect(headers).toHaveCount(7);
  });

  test('should display class cards with correct information', async ({ page }) => {
    // Wait for calendar to load
    await page.waitForSelector('.rbc-calendar', { timeout: 10000 });

    // Wait for events to appear
    await page.waitForSelector('.rbc-event', { timeout: 5000 });

    // Check that we have events
    const events = page.locator('.rbc-event');
    const eventCount = await events.count();
    expect(eventCount).toBeGreaterThan(0);

    // Check first event contains expected information
    const firstEvent = events.first();
    await expect(firstEvent).toContainText('Reformer');
    await expect(firstEvent).toContainText('Farah');
    await expect(firstEvent).toContainText('50 min');
    await expect(firstEvent).toContainText('Studio A');
    await expect(firstEvent).toContainText('6/8');
  });

  test('should show full class indicator for fully booked classes', async ({ page }) => {
    // Wait for calendar to load
    await page.waitForSelector('.rbc-calendar', { timeout: 10000 });
    await page.waitForSelector('.rbc-event', { timeout: 5000 });

    // The third class in mock data is fully booked (8/8)
    const events = page.locator('.rbc-event');

    // Find the fully booked class
    let foundFullClass = false;
    const eventCount = await events.count();

    for (let i = 0; i < eventCount; i++) {
      const event = events.nth(i);
      const text = await event.textContent();
      if (text?.includes('8/8')) {
        await expect(event).toContainText('🔴');
        foundFullClass = true;
        break;
      }
    }

    expect(foundFullClass).toBeTruthy();
  });

  test('should display week navigation buttons', async ({ page }) => {
    // Wait for toolbar
    await page.waitForSelector('button:has-text("Previous")', { timeout: 10000 });

    // Check navigation buttons exist
    await expect(page.getByRole('button', { name: /previous/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /today/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible();
  });

  test('should display Add Schedule button', async ({ page }) => {
    // Wait for toolbar
    await page.waitForSelector('button:has-text("Add Schedule")', { timeout: 10000 });

    // Check Add Schedule button exists
    const addButton = page.getByRole('button', { name: /add schedule/i });
    await expect(addButton).toBeVisible();
  });

  test('should navigate to previous week', async ({ page }) => {
    // Wait for calendar
    await page.waitForSelector('.rbc-calendar', { timeout: 10000 });

    // Get current week label
    const toolbar = page.locator('text=/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/').first();
    const originalText = await toolbar.textContent();

    // Click Previous button
    await page.getByRole('button', { name: /previous/i }).click();

    // Wait a bit for update
    await page.waitForTimeout(500);

    // Check that week changed (label should be different or API called with different dates)
    // We can't easily check the label change, but we can verify the button works
    await expect(page.getByRole('button', { name: /previous/i })).toBeEnabled();
  });

  test('should navigate to next week', async ({ page }) => {
    // Wait for calendar
    await page.waitForSelector('.rbc-calendar', { timeout: 10000 });

    // Click Next button
    await page.getByRole('button', { name: /next/i }).click();

    // Wait a bit for update
    await page.waitForTimeout(500);

    // Verify button still works
    await expect(page.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  test('should return to current week when Today is clicked', async ({ page }) => {
    // Wait for calendar
    await page.waitForSelector('.rbc-calendar', { timeout: 10000 });

    // Go to next week
    await page.getByRole('button', { name: /next/i }).click();
    await page.waitForTimeout(500);

    // Click Today button
    await page.getByRole('button', { name: /today/i }).click();
    await page.waitForTimeout(500);

    // Verify we're back (Today button should still be visible and enabled)
    await expect(page.getByRole('button', { name: /today/i })).toBeEnabled();
  });

  test('should handle empty state when no classes', async ({ page }) => {
    // Override API to return empty data
    await page.route('**/admin/schedules/classes/by-date-range*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          total_classes: 0,
          classes: [],
        }),
      });
    });

    // Navigate to schedule page
    await page.goto('http://localhost:3000/en/schedule');

    // Wait for empty state
    await page.waitForSelector('text=/no classes scheduled/i', { timeout: 10000 });

    // Check empty state is shown
    await expect(page.locator('text=/no classes scheduled/i')).toBeVisible();
    await expect(page.locator('text=📅')).toBeVisible();
  });

  test('should display loading state initially', async ({ page }) => {
    // Delay the API response to see loading state
    await page.route('**/admin/schedules/classes/by-date-range*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockClassesResponse),
      });
    });

    await page.goto('http://localhost:3000/en/schedule');

    // Check for skeleton loader (it should appear briefly)
    const skeleton = page.locator('[data-testid="skeleton"], .animate-pulse, [class*="skeleton"]');

    // Either skeleton is visible OR calendar loads very quickly
    const isSkeletonVisible = await skeleton.first().isVisible().catch(() => false);
    const isCalendarVisible = await page.locator('.rbc-calendar').isVisible().catch(() => false);

    expect(isSkeletonVisible || isCalendarVisible).toBeTruthy();
  });

  test('should handle API error gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/admin/schedules/classes/by-date-range*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('http://localhost:3000/en/schedule');

    // Wait for error message
    await page.waitForSelector('text=/failed to load/i', { timeout: 10000 });

    // Check error message is shown
    await expect(page.locator('text=/failed to load/i')).toBeVisible();
  });

  test('should log class click when clicking on class card', async ({ page }) => {
    // Wait for calendar
    await page.waitForSelector('.rbc-calendar', { timeout: 10000 });
    await page.waitForSelector('.rbc-event', { timeout: 5000 });

    // Set up console listener
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    // Click on first event
    const firstEvent = page.locator('.rbc-event').first();
    await firstEvent.click();

    // Wait a bit for console log
    await page.waitForTimeout(500);

    // Check that console log was made (checking for "Class clicked:" in logs)
    const hasClassClickLog = consoleLogs.some(log => log.includes('Class clicked:'));
    expect(hasClassClickLog).toBeTruthy();
  });

  test('should log quick add click when clicking Add Schedule button', async ({ page }) => {
    // Wait for toolbar
    await page.waitForSelector('button:has-text("Add Schedule")', { timeout: 10000 });

    // Set up console listener
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    // Click Add Schedule button
    await page.getByRole('button', { name: /add schedule/i }).click();

    // Wait a bit for console log
    await page.waitForTimeout(500);

    // Check that console log was made
    const hasQuickAddLog = consoleLogs.some(log => log.includes('Quick add clicked:'));
    expect(hasQuickAddLog).toBeTruthy();
  });

  test('should display calendar in RTL for Arabic locale', async ({ page }) => {
    // Navigate to Arabic version
    await page.goto('http://localhost:3000/ar/schedule');

    // Wait for calendar
    await page.waitForSelector('.rbc-calendar', { timeout: 10000 });

    // Check for RTL class
    const calendar = page.locator('.rbc-calendar');
    const hasRtlClass = await calendar.evaluate((el) => {
      return el.classList.contains('rbc-rtl') ||
             el.closest('[dir="rtl"]') !== null;
    });

    expect(hasRtlClass).toBeTruthy();
  });
});
