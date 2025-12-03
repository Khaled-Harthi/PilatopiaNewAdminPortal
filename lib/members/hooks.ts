/**
 * React Query hooks for Members Management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMembers,
  fetchMemberStats,
  fetchMemberProfile,
  fetchMemberActivity,
  fetchMemberMemberships,
  fetchMemberBookings,
  fetchVisitHistory,
  createMember,
  updateMember,
  deleteMember,
  createMemberBooking,
  cancelMemberBooking,
  purchaseMembership,
  renewMembership,
  lookupMemberByPhone,
} from './api';
import type {
  MemberQueryParams,
  CreateMemberPayload,
  UpdateMemberPayload,
} from './types';

// ============================================
// Members List Hooks
// ============================================

/**
 * Hook to fetch paginated list of members
 */
export function useMembers(params: MemberQueryParams = {}, enabled: boolean = true) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: () => fetchMembers(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled,
  });
}

/**
 * Hook to fetch member statistics (segment counts)
 */
export function useMemberStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ['member-stats'],
    queryFn: fetchMemberStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
}

// ============================================
// Member Profile Hooks
// ============================================

/**
 * Hook to fetch member profile
 */
export function useMemberProfile(memberId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['member-profile', memberId],
    queryFn: () => fetchMemberProfile(memberId!),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: enabled && !!memberId,
  });
}

/**
 * Hook to lookup member by phone number
 */
export function useLookupMemberByPhone(phoneNumber: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['member-phone-lookup', phoneNumber],
    queryFn: () => lookupMemberByPhone(phoneNumber!),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && !!phoneNumber,
  });
}

/**
 * Hook to fetch member activity summary
 */
export function useMemberActivity(memberId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['member-activity', memberId],
    queryFn: () => fetchMemberActivity(memberId!),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && !!memberId,
  });
}

// ============================================
// Member Memberships Hooks
// ============================================

/**
 * Hook to fetch member's memberships
 */
export function useMemberMemberships(memberId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['member-memberships', memberId],
    queryFn: () => fetchMemberMemberships(memberId!),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: enabled && !!memberId,
  });
}

// ============================================
// Member Bookings Hooks
// ============================================

/**
 * Hook to fetch member's bookings
 */
export function useMemberBookings(
  memberId: string | null,
  page: number = 1,
  limit: number = 10,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['member-bookings', memberId, page, limit],
    queryFn: () => fetchMemberBookings(memberId!, page, limit),
    staleTime: 1000 * 60 * 1, // 1 minute
    enabled: enabled && !!memberId,
  });
}

/**
 * Hook to create a booking for a member
 */
export function useCreateMemberBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, classId }: { memberId: string; classId: number }) =>
      createMemberBooking(memberId, classId),
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ['member-bookings', memberId] });
      queryClient.invalidateQueries({ queryKey: ['member-profile', memberId] });
      queryClient.invalidateQueries({ queryKey: ['member-memberships', memberId] });
    },
  });
}

/**
 * Hook to cancel a member's booking
 */
export function useCancelMemberBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, bookingId }: { memberId: string; bookingId: string }) =>
      cancelMemberBooking(memberId, bookingId),
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ['member-bookings', memberId] });
      queryClient.invalidateQueries({ queryKey: ['member-profile', memberId] });
      queryClient.invalidateQueries({ queryKey: ['member-memberships', memberId] });
    },
  });
}

// ============================================
// Visit History Hooks
// ============================================

/**
 * Hook to fetch member's visit history
 */
export function useVisitHistory(
  memberId: string | null,
  page: number = 1,
  limit: number = 10,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['visit-history', memberId, page, limit],
    queryFn: () => fetchVisitHistory(memberId!, page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && !!memberId,
  });
}

// ============================================
// Member CRUD Hooks
// ============================================

/**
 * Hook to create a new member
 */
export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMemberPayload) => createMember(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member-stats'] });
    },
  });
}

/**
 * Hook to update a member
 */
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, payload }: { memberId: string; payload: UpdateMemberPayload }) =>
      updateMember(memberId, payload),
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ['member-profile', memberId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

/**
 * Hook to delete a member
 */
export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => deleteMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member-stats'] });
    },
  });
}

// ============================================
// Membership Purchase Hooks
// ============================================

/**
 * Hook to purchase a membership for a member
 */
export function usePurchaseMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      payload,
    }: {
      memberId: string;
      payload: {
        planId: number;
        paymentMethod: string;
        startDate: string;
        promoCode?: string;
        notes?: string;
      };
    }) => purchaseMembership(memberId, payload),
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ['member-memberships', memberId] });
      queryClient.invalidateQueries({ queryKey: ['member-profile', memberId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member-stats'] });
    },
  });
}

/**
 * Hook to renew/extend a membership
 */
export function useRenewMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      membershipId,
      payload,
    }: {
      memberId: string;
      membershipId: string;
      payload: {
        planId: number;
        paymentMethod: string;
        startDate?: string;
      };
    }) => renewMembership(memberId, membershipId, payload),
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ['member-memberships', memberId] });
      queryClient.invalidateQueries({ queryKey: ['member-profile', memberId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member-stats'] });
    },
  });
}
