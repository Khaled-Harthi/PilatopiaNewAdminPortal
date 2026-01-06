/**
 * API service for Business Analytics Dashboard
 */

import apiClient from '../axios';
import type {
  DateRange,
  Granularity,
  OverviewResponse,
  BookingsResponse,
  RevenueResponse,
  HeatmapResponse,
  TrendsResponse,
  RegistrationsResponse,
  BookingTrendsResponse,
  ExpiringResponse,
  ChurnedResponse,
  MembersListResponse,
  MemberFilter,
} from './types';

// ============================================
// Overview API
// ============================================

/**
 * Fetches main dashboard overview metrics including conversion and retention rates
 */
export async function fetchBusinessOverview(
  dateRange: DateRange
): Promise<OverviewResponse> {
  const response = await apiClient.get<OverviewResponse>(
    '/admin/business/analytics/overview',
    {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    }
  );
  return response.data;
}

// ============================================
// Booking Metrics API
// ============================================

/**
 * Fetches booking metrics (total, attended, capacity, rates)
 */
export async function fetchBookingMetrics(
  dateRange: DateRange
): Promise<BookingsResponse> {
  const response = await apiClient.get<BookingsResponse>(
    '/admin/business/analytics/bookings',
    {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    }
  );
  return response.data;
}

// ============================================
// Revenue Breakdown API
// ============================================

/**
 * Fetches revenue breakdown by plan type and class type
 */
export async function fetchRevenueBreakdown(
  dateRange: DateRange
): Promise<RevenueResponse> {
  const response = await apiClient.get<RevenueResponse>(
    '/admin/business/analytics/revenue',
    {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    }
  );
  return response.data;
}

// ============================================
// Heatmap API
// ============================================

/**
 * Fetches attendance heatmap data (day x hour grid)
 */
export async function fetchAttendanceHeatmap(
  dateRange: DateRange
): Promise<HeatmapResponse> {
  const response = await apiClient.get<HeatmapResponse>(
    '/admin/business/analytics/heatmap',
    {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    }
  );
  return response.data;
}

// ============================================
// Trends API
// ============================================

/**
 * Fetches revenue trends over time
 */
export async function fetchRevenueTrends(
  dateRange: DateRange,
  granularity: Granularity
): Promise<TrendsResponse> {
  const response = await apiClient.get<TrendsResponse>(
    '/admin/business/analytics/trends',
    {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        granularity,
      },
    }
  );
  return response.data;
}

/**
 * Fetches registration trends over time
 */
export async function fetchRegistrationTrends(
  dateRange: DateRange,
  granularity: Granularity
): Promise<RegistrationsResponse> {
  const response = await apiClient.get<RegistrationsResponse>(
    '/admin/business/analytics/registrations',
    {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        granularity,
      },
    }
  );
  return response.data;
}

/**
 * Fetches booking trends over time (bookings vs attended with rates)
 */
export async function fetchBookingTrends(
  dateRange: DateRange,
  granularity: Granularity
): Promise<BookingTrendsResponse> {
  const response = await apiClient.get<BookingTrendsResponse>(
    '/admin/business/analytics/booking-trends',
    {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        granularity,
      },
    }
  );
  return response.data;
}

// ============================================
// Alert APIs
// ============================================

/**
 * Fetches members with expiring memberships (< 5 days)
 */
export async function fetchExpiringMembers(): Promise<ExpiringResponse> {
  const response = await apiClient.get<ExpiringResponse>(
    '/admin/business/analytics/expiring'
  );
  return response.data;
}

/**
 * Fetches churned members (paid members expired 30 days, no active membership)
 */
export async function fetchChurnedMembers(): Promise<ChurnedResponse> {
  const response = await apiClient.get<ChurnedResponse>(
    '/admin/business/analytics/churned'
  );
  return response.data;
}

// ============================================
// Members List API
// ============================================

/**
 * Fetches paginated member list by filter
 */
export async function fetchMembersByFilter(
  filter: MemberFilter,
  dateRange: DateRange,
  page: number = 1,
  limit: number = 20
): Promise<MembersListResponse> {
  const response = await apiClient.get<MembersListResponse>(
    '/admin/business/analytics/members',
    {
      params: {
        filter,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page,
        limit,
      },
    }
  );
  return response.data;
}
