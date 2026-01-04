import { test, expect, Page } from '@playwright/test';

/**
 * Business Dashboard E2E Tests
 *
 * Tests the Business Analytics Dashboard:
 * - Dashboard access (super_admin only)
 * - Date filter functionality
 * - KPI metrics display
 * - Charts rendering
 * - Heatmap display
 * - Alert sections
 * - Navigation to member lists
 * - Responsive design
 * - RTL support (Arabic)
 */

// Helper function to login as super admin
async function loginAsSuperAdmin(page: Page) {
  await page.goto('http://localhost:3000/en/login');
  await page.waitForLoadState('networkidle');

  const email = process.env.TEST_EMAIL || 'admin@pilatopia.studio';
  const password = process.env.TEST_PASSWORD || 'testpassword';

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /login/i }).click();

  // Wait for redirect after login
  await page.waitForURL('**/en', { timeout: 15000 });
}

test.describe('Business Dashboard - Protected Routes', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Should be redirected to login page
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/business-redirect-to-login.png', fullPage: true });
  });

  test('should redirect business/members to login when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business/members');
    await page.waitForLoadState('networkidle');

    // Should be redirected to login page
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/business-members-redirect-to-login.png', fullPage: true });
  });
});

test.describe('Business Dashboard - Main Page (Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
  });

  test('should display Business Dashboard page', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page.getByRole('heading', { name: 'Business Dashboard' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Track your studio performance')).toBeVisible();

    await page.screenshot({ path: 'test-results/business-dashboard-loaded.png', fullPage: true });
  });

  test('should show Business link in sidebar for super_admin', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Check sidebar has Business link
    await expect(page.getByRole('link', { name: 'Business' })).toBeVisible();
    await page.screenshot({ path: 'test-results/business-sidebar-link.png', fullPage: true });
  });

  test('should display date filter presets', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Check date presets are visible
    await expect(page.getByRole('radio', { name: 'Today' })).toBeVisible();
    await expect(page.getByRole('radio', { name: '7d' })).toBeVisible();
    await expect(page.getByRole('radio', { name: '30d' })).toBeVisible();
    await expect(page.getByRole('radio', { name: '3m' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'All Time' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Custom/i })).toBeVisible();

    await page.screenshot({ path: 'test-results/business-date-filters.png', fullPage: true });
  });

  test('should change date preset and reload data', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Click on 7d preset
    await page.getByRole('radio', { name: '7d' }).click();
    await page.waitForTimeout(500); // Wait for data reload

    // Verify 7d is selected
    await expect(page.getByRole('radio', { name: '7d' })).toBeChecked();
    await page.screenshot({ path: 'test-results/business-7d-selected.png', fullPage: true });

    // Click on Today preset
    await page.getByRole('radio', { name: 'Today' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('radio', { name: 'Today' })).toBeChecked();
    await page.screenshot({ path: 'test-results/business-today-selected.png', fullPage: true });
  });

  test('should display KPI metrics grid', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Check Members section
    await expect(page.getByText('Members').first()).toBeVisible();
    await expect(page.getByText('Total Members')).toBeVisible();
    await expect(page.getByText('Active Members')).toBeVisible();
    await expect(page.getByText('New Registrations')).toBeVisible();
    await expect(page.getByText('Purchased')).toBeVisible();

    // Check Financials section
    await expect(page.getByText('Financials')).toBeVisible();
    await expect(page.getByText('Revenue')).toBeVisible();
    await expect(page.getByText('Transactions')).toBeVisible();
    await expect(page.getByText('Avg / Transaction')).toBeVisible();

    // Check Bookings section
    await expect(page.getByText('Bookings & Attendance')).toBeVisible();
    await expect(page.getByText('Total Bookings')).toBeVisible();
    await expect(page.getByText('Attended')).toBeVisible();
    await expect(page.getByText('Attendance Rate')).toBeVisible();
    await expect(page.getByText('Utilization')).toBeVisible();

    await page.screenshot({ path: 'test-results/business-metrics-grid.png', fullPage: true });
  });

  test('should display conversion and retention rate cards', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Check rates cards
    await expect(page.getByText('Conversion Rate')).toBeVisible();
    await expect(page.getByText('Registration → Purchase')).toBeVisible();
    await expect(page.getByText('Retention Rate')).toBeVisible();
    await expect(page.getByText('Expired → Still Active')).toBeVisible();

    await page.screenshot({ path: 'test-results/business-rates-cards.png', fullPage: true });
  });

  test('should display charts section', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Check chart titles
    await expect(page.getByText('Revenue Over Time')).toBeVisible();
    await expect(page.getByText('New Registrations')).toBeVisible();
    await expect(page.getByText('Bookings Over Time')).toBeVisible();
    await expect(page.getByText('Rates Over Time')).toBeVisible();
    await expect(page.getByText('Package Breakdown')).toBeVisible();
    await expect(page.getByText('Class Type Distribution')).toBeVisible();
    await expect(page.getByText('Attendance Patterns')).toBeVisible();

    await page.screenshot({ path: 'test-results/business-charts-section.png', fullPage: true });
  });

  test('should have chart granularity toggles', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Find Revenue Over Time chart and check for D/W/M/Y toggles
    const revenueChartCard = page.locator('text=Revenue Over Time').locator('..');
    await expect(revenueChartCard.getByRole('radio', { name: 'D' })).toBeVisible();
    await expect(revenueChartCard.getByRole('radio', { name: 'W' })).toBeVisible();
    await expect(revenueChartCard.getByRole('radio', { name: 'M' })).toBeVisible();
    await expect(revenueChartCard.getByRole('radio', { name: 'Y' })).toBeVisible();

    await page.screenshot({ path: 'test-results/business-chart-granularity.png', fullPage: true });
  });

  test('should display attendance heatmap', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Check heatmap section
    await expect(page.getByText('Attendance Patterns')).toBeVisible();
    await expect(page.getByText('When members attend classes')).toBeVisible();

    // Check for legend
    await expect(page.getByText('Less')).toBeVisible();
    await expect(page.getByText('More')).toBeVisible();

    // Check for day labels
    await expect(page.getByText('Sun').first()).toBeVisible();
    await expect(page.getByText('Mon').first()).toBeVisible();

    await page.screenshot({ path: 'test-results/business-heatmap.png', fullPage: true });
  });

  test('should navigate to member list when clicking metric card', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Click on Active Members card
    await page.getByText('Active Members').click();
    await page.waitForURL('**/business/members**', { timeout: 10000 });

    // Should be on members list page with active filter
    await expect(page.getByRole('heading', { name: /Member List/i })).toBeVisible();
    await expect(page.url()).toContain('filter=active');

    await page.screenshot({ path: 'test-results/business-navigate-to-active-members.png', fullPage: true });
  });

  test('should open custom date picker', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Click custom date button
    await page.getByRole('button', { name: /Custom/i }).click();

    // Popover should be visible with calendars
    await expect(page.getByText('Start Date')).toBeVisible();
    await expect(page.getByText('End Date')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Apply' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

    await page.screenshot({ path: 'test-results/business-custom-date-picker.png', fullPage: true });
  });
});

test.describe('Business Dashboard - Member List Page (Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
  });

  test('should display member list page with filter tabs', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business/members');
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page.getByRole('heading', { name: /Member List/i })).toBeVisible({ timeout: 10000 });

    // Check filter tabs
    await expect(page.getByRole('radio', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Active' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Expiring' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'New' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Purchased' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Churned' })).toBeVisible();

    await page.screenshot({ path: 'test-results/business-members-list.png', fullPage: true });
  });

  test('should filter members by clicking tabs', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business/members?filter=all');
    await page.waitForLoadState('networkidle');

    // Click on Active tab
    await page.getByRole('radio', { name: 'Active' }).click();
    await page.waitForTimeout(500);

    // URL should change
    await expect(page.url()).toContain('filter=active');
    await page.screenshot({ path: 'test-results/business-members-active-filter.png', fullPage: true });

    // Click on Expiring tab
    await page.getByRole('radio', { name: 'Expiring' }).click();
    await page.waitForTimeout(500);
    await expect(page.url()).toContain('filter=expiring');
    await page.screenshot({ path: 'test-results/business-members-expiring-filter.png', fullPage: true });
  });

  test('should display member table headers', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business/members');
    await page.waitForLoadState('networkidle');

    // Check table headers (visible on desktop)
    await expect(page.getByText('Member').first()).toBeVisible();
    await expect(page.getByText('Status').first()).toBeVisible();
    await expect(page.getByText('Expires').first()).toBeVisible();
    await expect(page.getByText('Last Check-in').first()).toBeVisible();
    await expect(page.getByText('Actions').first()).toBeVisible();

    await page.screenshot({ path: 'test-results/business-members-table-headers.png', fullPage: true });
  });

  test('should have back button to dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business/members');
    await page.waitForLoadState('networkidle');

    // Find and click back button
    await page.getByRole('button').filter({ has: page.locator('svg') }).first().click();
    await page.waitForURL('**/business', { timeout: 10000 });

    // Should be back on dashboard
    await expect(page.getByRole('heading', { name: 'Business Dashboard' })).toBeVisible();
    await page.screenshot({ path: 'test-results/business-back-to-dashboard.png', fullPage: true });
  });

  test('should load with filter from URL param', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business/members?filter=churned');
    await page.waitForLoadState('networkidle');

    // Churned tab should be selected
    await expect(page.getByRole('radio', { name: 'Churned' })).toBeChecked();
    await page.screenshot({ path: 'test-results/business-members-churned-from-url.png', fullPage: true });
  });
});

test.describe('Business Dashboard - Arabic (RTL)', () => {
  test.beforeEach(async ({ page }) => {
    // Login with Arabic locale
    await page.goto('http://localhost:3000/ar/login');
    await page.waitForLoadState('networkidle');

    const email = process.env.TEST_EMAIL || 'admin@pilatopia.studio';
    const password = process.env.TEST_PASSWORD || 'testpassword';

    await page.getByLabel(/البريد الإلكتروني/i).fill(email);
    await page.getByLabel(/كلمة المرور/i).fill(password);
    await page.getByRole('button', { name: /تسجيل الدخول/i }).click();
    await page.waitForURL('**/ar', { timeout: 15000 });
  });

  test('should display Arabic Business Dashboard with RTL layout', async ({ page }) => {
    await page.goto('http://localhost:3000/ar/business');
    await page.waitForLoadState('networkidle');

    // Check RTL direction
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');

    // Check Arabic title
    await expect(page.getByRole('heading', { name: 'لوحة الأعمال' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('تتبع أداء الاستوديو الخاص بك')).toBeVisible();

    await page.screenshot({ path: 'test-results/business-dashboard-arabic.png', fullPage: true });
  });

  test('should display Arabic date presets', async ({ page }) => {
    await page.goto('http://localhost:3000/ar/business');
    await page.waitForLoadState('networkidle');

    // Check Arabic date presets
    await expect(page.getByRole('radio', { name: 'اليوم' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'كل الوقت' })).toBeVisible();

    await page.screenshot({ path: 'test-results/business-arabic-date-filters.png', fullPage: true });
  });

  test('should display Arabic metrics', async ({ page }) => {
    await page.goto('http://localhost:3000/ar/business');
    await page.waitForLoadState('networkidle');

    // Check Arabic metrics
    await expect(page.getByText('الأعضاء')).toBeVisible();
    await expect(page.getByText('إجمالي الأعضاء')).toBeVisible();
    await expect(page.getByText('الأعضاء النشطين')).toBeVisible();
    await expect(page.getByText('تسجيلات جديدة')).toBeVisible();
    await expect(page.getByText('المالية')).toBeVisible();
    await expect(page.getByText('الإيرادات')).toBeVisible();

    await page.screenshot({ path: 'test-results/business-arabic-metrics.png', fullPage: true });
  });

  test('should display Arabic member list', async ({ page }) => {
    await page.goto('http://localhost:3000/ar/business/members');
    await page.waitForLoadState('networkidle');

    // Check Arabic title
    await expect(page.getByRole('heading', { name: /قائمة الأعضاء/i })).toBeVisible({ timeout: 10000 });

    // Check Arabic filter tabs
    await expect(page.getByRole('radio', { name: 'الكل' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'نشط' })).toBeVisible();

    await page.screenshot({ path: 'test-results/business-members-arabic.png', fullPage: true });
  });
});

test.describe('Business Dashboard - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
  });

  test('should display correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Dashboard should still be visible
    await expect(page.getByRole('heading', { name: 'Business Dashboard' })).toBeVisible({ timeout: 10000 });

    // Mobile sidebar trigger should be visible
    await expect(page.locator('[data-slot="trigger"]').first()).toBeVisible();

    await page.screenshot({ path: 'test-results/business-mobile-dashboard.png', fullPage: true });
  });

  test('should display metrics in grid on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Metrics should still be visible
    await expect(page.getByText('Total Members')).toBeVisible();
    await expect(page.getByText('Revenue')).toBeVisible();

    await page.screenshot({ path: 'test-results/business-mobile-metrics.png', fullPage: true });
  });

  test('should display member list correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:3000/en/business/members');
    await page.waitForLoadState('networkidle');

    // Member list should be visible
    await expect(page.getByRole('heading', { name: /Member List/i })).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/business-mobile-members.png', fullPage: true });
  });

  test('should display correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Business Dashboard' })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/business-tablet-dashboard.png', fullPage: true });
  });
});

test.describe('Business Dashboard - Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
  });

  test('should show loading skeletons initially', async ({ page }) => {
    // Navigate without waiting for network idle to catch loading state
    await page.goto('http://localhost:3000/en/business');

    // Take screenshot during loading (may capture skeleton)
    await page.screenshot({ path: 'test-results/business-loading-state.png', fullPage: true });

    // Wait for content to load
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Business Dashboard' })).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Business Dashboard - Alerts Section', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
  });

  test('should display alerts section if there are expiring or churned members', async ({ page }) => {
    await page.goto('http://localhost:3000/en/business');
    await page.waitForLoadState('networkidle');

    // Take screenshot - alerts may or may not be visible depending on data
    await page.screenshot({ path: 'test-results/business-alerts-section.png', fullPage: true });

    // If alerts are present, they should have the correct text
    const expiringAlert = page.getByText('Expiring Soon');
    const churnedAlert = page.getByText('Did Not Renew');

    // These may or may not be visible depending on real data
    if (await expiringAlert.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(page.getByText(/member.*need attention/i)).toBeVisible();
    }

    if (await churnedAlert.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(page.getByText(/member.*churned/i)).toBeVisible();
    }
  });
});
