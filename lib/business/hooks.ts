/**
 * React Query hooks for Business Analytics Dashboard
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchBusinessOverview,
  fetchBookingMetrics,
  fetchRevenueBreakdown,
  fetchAttendanceHeatmap,
  fetchRevenueTrends,
  fetchRegistrationTrends,
  fetchBookingTrends,
  fetchExpiringMembers,
  fetchChurnedMembers,
  fetchMembersByFilter,
} from './api';
import type { DateRange, Granularity, MemberFilter } from './types';

// ============================================
// Overview Hooks
// ============================================

/**
 * Hook to fetch main dashboard overview metrics
 */
export function useBusinessOverview(dateRange: DateRange, enabled: boolean = true) {
  return useQuery({
    queryKey: ['business-overview', dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchBusinessOverview(dateRange),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled,
  });
}

// ============================================
// Booking Metrics Hooks
// ============================================

/**
 * Hook to fetch booking metrics
 */
export function useBookingMetrics(dateRange: DateRange, enabled: boolean = true) {
  return useQuery({
    queryKey: ['business-bookings', dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchBookingMetrics(dateRange),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled,
  });
}

// ============================================
// Revenue Breakdown Hooks
// ============================================

/**
 * Hook to fetch revenue breakdown
 */
export function useRevenueBreakdown(dateRange: DateRange, enabled: boolean = true) {
  return useQuery({
    queryKey: ['business-revenue', dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchRevenueBreakdown(dateRange),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled,
  });
}

// ============================================
// Heatmap Hooks
// ============================================

/**
 * Hook to fetch attendance heatmap
 */
export function useAttendanceHeatmap(dateRange: DateRange, enabled: boolean = true) {
  return useQuery({
    queryKey: ['business-heatmap', dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchAttendanceHeatmap(dateRange),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
}

// ============================================
// Trends Hooks
// ============================================

/**
 * Hook to fetch revenue trends
 */
export function useRevenueTrends(
  dateRange: DateRange,
  granularity: Granularity,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['business-revenue-trends', dateRange.startDate, dateRange.endDate, granularity],
    queryFn: () => fetchRevenueTrends(dateRange, granularity),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled,
  });
}

/**
 * Hook to fetch registration trends
 */
export function useRegistrationTrends(
  dateRange: DateRange,
  granularity: Granularity,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['business-registration-trends', dateRange.startDate, dateRange.endDate, granularity],
    queryFn: () => fetchRegistrationTrends(dateRange, granularity),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled,
  });
}

/**
 * Hook to fetch booking trends
 */
export function useBookingTrends(
  dateRange: DateRange,
  granularity: Granularity,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['business-booking-trends', dateRange.startDate, dateRange.endDate, granularity],
    queryFn: () => fetchBookingTrends(dateRange, granularity),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled,
  });
}

// ============================================
// Alert Hooks
// ============================================

/**
 * Hook to fetch expiring members
 */
export function useExpiringMembers(enabled: boolean = true) {
  return useQuery({
    queryKey: ['business-expiring-members'],
    queryFn: fetchExpiringMembers,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
}

/**
 * Hook to fetch churned members
 */
export function useChurnedMembers(enabled: boolean = true) {
  return useQuery({
    queryKey: ['business-churned-members'],
    queryFn: fetchChurnedMembers,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
}

// ============================================
// Members List Hooks
// ============================================

/**
 * Hook to fetch filtered members list
 */
export function useMembersByFilter(
  filter: MemberFilter,
  dateRange: DateRange,
  page: number = 1,
  limit: number = 20,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [
      'business-members-list',
      filter,
      dateRange.startDate,
      dateRange.endDate,
      page,
      limit,
    ],
    queryFn: () => fetchMembersByFilter(filter, dateRange, page, limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled,
  });
}
