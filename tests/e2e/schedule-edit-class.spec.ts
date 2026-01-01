import { test, expect, Page } from '@playwright/test';
import { format, startOfWeek, addDays } from 'date-fns';

// Get dynamic dates for current week
function getCurrentWeekDates() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
  return {
    // Create a date in the current week (Tuesday)
    classDate: addDays(weekStart, 2),
    // Format for mock data (ISO string in UTC)
    getUTCString: (date: Date, hour: number) => {
      const d = new Date(date);
      d.setHours(hour - 3, 0, 0, 0); // Convert local (UTC+3) to UTC
      return d.toISOString();
    }
  };
}

// Generate mock data with dynamic dates
function getMockClassesResponse() {
  const { classDate, getUTCString } = getCurrentWeekDates();

  return {
    success: true,
    total_classes: 2,
    classes: [
      {
        id: 1,
        class_type_id: 1,
        instructor_id: 5,
        capacity: 8,
        schedule_time: getUTCString(classDate, 7), // 7:00 AM local
        duration_minutes: 50,
        instructor: 'Farah',
        name: 'Reformer',
        booked_seats: 6,
        class_room_name: 'Studio A',
        class_room_id: 1,
        fake_booked_seats: null,
      },
      {
        id: 2,
        class_type_id: 2,
        instructor_id: 6,
        capacity: 10,
        schedule_time: getUTCString(classDate, 9), // 9:00 AM local
        duration_minutes: 45,
        instructor: 'Jessica',
        name: 'Mat Pilates',
        booked_seats: 4,
        class_room_name: 'Studio B',
        class_room_id: 2,
        fake_booked_seats: 7,
      },
    ],
  };
}

const mockClassDetailsResponse = {
  success: true,
  class: {
    id: 1,
    instructor_id: 5,
    capacity: 8,
    schedule_time: '2024-11-24T04:00:00Z',
    duration_minutes: 50,
    instructor: 'Farah',
    name: 'Reformer',
    class_room_name: 'Studio A',
    booked_seats: '6',
  },
  total_bookings: 6,
  bookings: [],
  waitlist: [],
};

const mockInstructorsResponse = {
  success: true,
  instructors: [
    { id: 5, name: 'Farah' },
    { id: 6, name: 'Jessica' },
  ],
};

const mockClassTypesResponse = {
  success: true,
  data: [
    { id: 1, name: 'Reformer' },
    { id: 2, name: 'Mat Pilates' },
  ],
};

const mockClassRoomsResponse = {
  success: true,
  data: [
    { id: 1, name: 'Studio A' },
    { id: 2, name: 'Studio B' },
  ],
};

async function setupRouteMocks(page: Page, customClassesResponse?: object) {
  const classesResponse = customClassesResponse || getMockClassesResponse();

  // Mock classes list
  await page.route('**/admin/schedules/classes/by-date-range*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(classesResponse),
    });
  });

  // Mock class details
  await page.route('**/admin/attendance/classes/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockClassDetailsResponse),
    });
  });

  // Mock instructors
  await page.route('**/admin/instructors', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockInstructorsResponse),
    });
  });

  // Mock class types
  await page.route('**/admin/class-types/all', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockClassTypesResponse),
    });
  });

  // Mock class rooms
  await page.route('**/admin/classes/rooms', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockClassRoomsResponse),
    });
  });
}

async function navigateAndSetAuth(page: Page, locale = 'en') {
  // Navigate first to get to the domain
  await page.goto(`http://localhost:3000/${locale}/schedule`);

  // Set auth tokens
  await page.evaluate(() => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('admin', JSON.stringify({ name: 'Test Admin' }));
  });

  // Reload to apply auth
  await page.reload();

  // Wait for page to be ready - look for the schedule page elements
  await page.waitForSelector('text=Class Schedule', { timeout: 15000 });
}

async function openClassEditMode(page: Page, locale = 'en', className = 'Reformer') {
  // Wait for any class event to appear
  await page.waitForTimeout(1000); // Give time for calendar to render

  // Try to find the class by name
  const classLocator = page.locator(`text=${className}`).first();

  try {
    // Wait for the class to be visible (might need scrolling)
    await classLocator.waitFor({ state: 'visible', timeout: 10000 });
    await classLocator.click();
  } catch {
    // If not found, try clicking any class event
    const anyClass = page.locator('.font-medium.truncate').first();
    await anyClass.click();
  }

  // Wait for the detail popover/sheet to appear
  await page.waitForTimeout(500);

  // Click Edit button
  const editButton = locale === 'ar'
    ? page.locator('button:has-text("تعديل"), text=تعديل')
    : page.locator('button:has-text("Edit"), text=Edit');
  await editButton.first().click();

  // Wait for edit form to load
  await page.waitForTimeout(500);
}

test.describe('Schedule - Edit Class with Fake Booked Seats', () => {
  // Run tests serially to avoid race conditions with shared mocks
  test.describe.configure({ mode: 'serial' });

  test('should display fake booked seats field in edit mode', async ({ page }) => {
    await setupRouteMocks(page);
    await navigateAndSetAuth(page);
    await openClassEditMode(page);

    // Check that the Display seats field is visible
    await expect(page.locator('text=Display seats')).toBeVisible();
    await expect(page.locator('input[placeholder="Auto"]')).toBeVisible();
  });

  test('should save class with fake booked seats value', async ({ page }) => {
    let capturedPayload: Record<string, unknown> | null = null;

    await setupRouteMocks(page);

    // Mock update endpoint and capture payload
    await page.route('**/admin/schedules/classes/*', async (route, request) => {
      if (request.method() === 'PUT') {
        capturedPayload = request.postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    await navigateAndSetAuth(page);
    await openClassEditMode(page);

    // Enter fake booked seats value
    const fakeSeatsInput = page.locator('input[placeholder="Auto"]');
    await fakeSeatsInput.fill('5');

    // Click Save
    await page.click('button:has-text("Save")');

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Verify payload included fakeBookedSeats
    expect(capturedPayload).not.toBeNull();
    expect(capturedPayload?.fakeBookedSeats).toBe(5);
  });

  test('should not include fakeBookedSeats in payload when field is empty', async ({ page }) => {
    let capturedPayload: Record<string, unknown> | null = null;

    await setupRouteMocks(page);

    // Mock update endpoint and capture payload
    await page.route('**/admin/schedules/classes/*', async (route, request) => {
      if (request.method() === 'PUT') {
        capturedPayload = request.postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    await navigateAndSetAuth(page);
    await openClassEditMode(page);

    // Ensure fake seats field is empty
    const fakeSeatsInput = page.locator('input[placeholder="Auto"]');
    await fakeSeatsInput.clear();

    // Click Save
    await page.click('button:has-text("Save")');

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Verify payload does NOT include fakeBookedSeats
    expect(capturedPayload).not.toBeNull();
    expect(capturedPayload).not.toHaveProperty('fakeBookedSeats');
  });

  test('should load existing fake booked seats value when editing', async ({ page }) => {
    // Use mock with fake_booked_seats set
    const { classDate, getUTCString } = getCurrentWeekDates();
    const mockWithFakeSeats = {
      success: true,
      total_classes: 1,
      classes: [
        {
          id: 2,
          class_type_id: 2,
          instructor_id: 6,
          capacity: 10,
          schedule_time: getUTCString(classDate, 9),
          duration_minutes: 45,
          instructor: 'Jessica',
          name: 'Mat Pilates',
          booked_seats: 4,
          class_room_name: 'Studio B',
          class_room_id: 2,
          fake_booked_seats: 7,
        },
      ],
    };

    await setupRouteMocks(page, mockWithFakeSeats);
    await navigateAndSetAuth(page);

    // Click on the class with fake seats
    await page.waitForSelector('text=Mat Pilates', { timeout: 10000 });
    await page.click('text=Mat Pilates');

    // Click Edit
    await page.waitForTimeout(500);
    await page.click('text=Edit');
    await page.waitForTimeout(500);

    // Check that the fake seats input has the existing value
    const fakeSeatsInput = page.locator('input[placeholder="Auto"]');
    await expect(fakeSeatsInput).toHaveValue('7');
  });

  test('should clear fake booked seats when input is cleared', async ({ page }) => {
    let capturedPayload: Record<string, unknown> | null = null;

    // Use mock with fake_booked_seats set
    const { classDate, getUTCString } = getCurrentWeekDates();
    const mockWithFakeSeats = {
      success: true,
      total_classes: 1,
      classes: [
        {
          id: 2,
          class_type_id: 2,
          instructor_id: 6,
          capacity: 10,
          schedule_time: getUTCString(classDate, 9),
          duration_minutes: 45,
          instructor: 'Jessica',
          name: 'Mat Pilates',
          booked_seats: 4,
          class_room_name: 'Studio B',
          class_room_id: 2,
          fake_booked_seats: 7,
        },
      ],
    };

    await setupRouteMocks(page, mockWithFakeSeats);

    // Mock update endpoint and capture payload
    await page.route('**/admin/schedules/classes/*', async (route, request) => {
      if (request.method() === 'PUT') {
        capturedPayload = request.postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    await navigateAndSetAuth(page);

    // Click on the class
    await page.waitForSelector('text=Mat Pilates', { timeout: 10000 });
    await page.click('text=Mat Pilates');

    // Click Edit
    await page.waitForTimeout(500);
    await page.click('text=Edit');
    await page.waitForTimeout(500);

    // Clear the fake seats input
    const fakeSeatsInput = page.locator('input[placeholder="Auto"]');
    await fakeSeatsInput.clear();

    // Click Save
    await page.click('button:has-text("Save")');

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Verify payload does NOT include fakeBookedSeats (cleared)
    expect(capturedPayload).not.toBeNull();
    expect(capturedPayload).not.toHaveProperty('fakeBookedSeats');
  });

  test('should display fake seats field in Arabic locale', async ({ page }) => {
    await setupRouteMocks(page);
    await navigateAndSetAuth(page, 'ar');

    // Click on class
    await page.waitForSelector('text=Reformer', { timeout: 10000 });
    await page.click('text=Reformer');

    // Click Edit (Arabic)
    await page.waitForTimeout(500);
    await page.click('text=تعديل');
    await page.waitForTimeout(500);

    // Check that the Arabic labels are visible
    await expect(page.locator('text=عرض المقاعد')).toBeVisible();
    await expect(page.locator('input[placeholder="تلقائي"]')).toBeVisible();
  });
});
