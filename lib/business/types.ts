/**
 * Type definitions for Business Analytics Dashboard
 */

// ============================================
// Date & Filter Types
// ============================================

export type DatePreset = 'today' | '7d' | '30d' | '3m' | 'all' | 'custom';
export type Granularity = 'day' | 'week' | 'month' | 'year';

export interface DateRange {
  startDate: string;
  endDate: string;
}

// ============================================
// Overview Metrics
// ============================================

export interface BusinessOverview {
  // Current State Metrics (ignore date range)
  active_members: number;
  expiring_soon: number;
  churned: number;
  // Period Activity Metrics (use date range)
  new_users: number;
  new_members: number;
  total_revenue: number;
  total_transactions: number;
  avg_transaction: number;
}

export interface ConversionRate {
  total_registrations: number;
  converted: number;
  conversion_rate: number;
}

export interface RetentionRate {
  total_expired: number;
  retained: number;
  churned: number;
  retention_rate: number;
  churn_rate: number;
}

export interface OverviewResponse {
  success: boolean;
  overview: BusinessOverview;
  conversion: ConversionRate;
  retention: RetentionRate;
  date_range: DateRange;
}

// ============================================
// Booking Metrics
// ============================================

export interface BookingMetrics {
  total_bookings: number;
  attended: number;
  total_capacity: number;
  attendance_rate: number;
  utilization_rate: number;
}

export interface BookingsResponse {
  success: boolean;
  bookings: BookingMetrics;
  date_range: DateRange;
}

// ============================================
// Revenue Breakdown
// ============================================

export interface PlanBreakdown {
  plan_id: number;
  plan_name: string;
  class_count: number;
  plan_type: 'single_pass' | 'package';
  is_active: boolean;
  unique_members: number;
  total_purchases: number;
  total_revenue: number;
}

export interface ClassTypeBreakdown {
  class_type_id: number;
  class_type_name: string;
  attendance_count: number;
  percentage: number;
}

export interface RevenueTotals {
  single_pass_members: number;
  single_pass_purchases: number;
  single_pass_revenue: number;
  package_members: number;
  package_purchases: number;
  package_revenue: number;
}

export interface RevenueResponse {
  success: boolean;
  by_plan_type: PlanBreakdown[];
  by_class_type: ClassTypeBreakdown[];
  totals: RevenueTotals;
  date_range: DateRange;
}

// ============================================
// Heatmap Types
// ============================================

export interface HeatmapCell {
  day_of_week: number; // 0-6 (Sun-Sat)
  hour_of_day: number; // 0-23
  attendance_count: number;
}

export interface PeakTime {
  day: string;
  hour: string;
  count: number;
}

export interface HeatmapResponse {
  success: boolean;
  heatmap: HeatmapCell[];
  peak_times: PeakTime[];
  date_range: DateRange;
}

// ============================================
// Trend Types
// ============================================

export interface TrendDataPoint {
  period: string;
  total_revenue: number;
  transaction_count: number;
}

export interface TrendsResponse {
  success: boolean;
  granularity: Granularity;
  data: TrendDataPoint[];
  date_range: DateRange;
}

export interface RegistrationDataPoint {
  period: string;
  new_registrations: number;
}

export interface RegistrationsResponse {
  success: boolean;
  granularity: Granularity;
  data: RegistrationDataPoint[];
  date_range: DateRange;
}

export interface BookingTrendDataPoint {
  period: string;
  total_bookings: number;
  attended: number;
  total_capacity: number;
  attendance_rate: number;
  utilization_rate: number;
}

export interface BookingTrendsResponse {
  success: boolean;
  granularity: Granularity;
  data: BookingTrendDataPoint[];
  date_range: DateRange;
}

// ============================================
// Alert Types (Expiring & Churned)
// ============================================

export interface ExpiringMember {
  id: string;
  name: string;
  phone_number: string;
  expires_at: string;
  available_classes: number;
  days_until_expiry: number;
}

export interface ExpiringResponse {
  success: boolean;
  count: number;
  members: ExpiringMember[];
}

export interface ChurnedMember {
  id: string;
  name: string;
  phone_number: string;
  expired_at: string;
  days_since_expiry: number;
  last_check_in: string | null;
}

export interface ChurnedResponse {
  success: boolean;
  count: number;
  members: ChurnedMember[];
}

// ============================================
// Member List Types
// ============================================

export type MemberFilter = 'all' | 'active' | 'expiring' | 'new' | 'purchased' | 'churned';

export interface BusinessMember {
  id: string;
  name: string;
  phone_number: string;
  created_at: string;
  membership_status: string | null;
  membership_expires_at: string | null;
  last_check_in: string | null;
  total_purchases: number;
}

export interface MembersListResponse {
  success: boolean;
  filter: MemberFilter;
  members: BusinessMember[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
  date_range: DateRange;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get date range from preset
 */
export function getDateRangeFromPreset(preset: DatePreset): DateRange {
  const end = new Date();
  const start = new Date();

  switch (preset) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '3m':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'all':
      start.setFullYear(2020, 0, 1); // Far enough back
      break;
    default:
      start.setDate(start.getDate() - 30);
  }

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

/**
 * Get day name from day of week number
 */
export function getDayName(dayOfWeek: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayOfWeek] || '';
}

/**
 * Format hour for display
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/**
 * Get intensity level for heatmap (0-4)
 */
export function getHeatmapIntensity(count: number, maxCount: number): number {
  if (count === 0) return 0;
  if (maxCount === 0) return 0;
  const ratio = count / maxCount;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}
