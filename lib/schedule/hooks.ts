/**
 * React Query hooks for Schedule Management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchClasses,
  fetchClassDetails,
  updateClass,
  deleteClass,
  createClasses,
  uploadClassesCSV,
  fetchInstructors,
  fetchClassTypes,
  fetchClassRooms,
  fetchDailyDetailed,
  checkInMember,
  promoteFromWaitlist,
} from './api';
import type { CreateClassPayload, UpdateClassPayload } from './types';

/**
 * Hook to fetch classes for a date range
 */
export function useClasses(startDate: string, endDate: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['classes', startDate, endDate],
    queryFn: () => fetchClasses(startDate, endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && !!startDate && !!endDate,
  });
}

/**
 * Hook to fetch class details with registrations
 */
export function useClassDetails(classId: number | null) {
  return useQuery({
    queryKey: ['class-details', classId],
    queryFn: () => fetchClassDetails(classId!),
    enabled: classId !== null,
  });
}

/**
 * Hook to update a class
 */
export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, payload }: { classId: number; payload: UpdateClassPayload }) =>
      updateClass(classId, payload),
    onSuccess: () => {
      // Invalidate classes queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

/**
 * Hook to delete a class
 */
export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: number) => deleteClass(classId),
    onSuccess: () => {
      // Invalidate classes queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

/**
 * Hook to create classes
 */
export function useCreateClasses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClassPayload) => createClasses(payload),
    onSuccess: () => {
      // Invalidate classes queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

/**
 * Hook to upload classes via CSV
 */
export function useUploadClassesCSV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadClassesCSV(file),
    onSuccess: () => {
      // Invalidate classes queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

/**
 * Hook to fetch instructors
 */
export function useInstructors() {
  return useQuery({
    queryKey: ['instructors'],
    queryFn: fetchInstructors,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch class types
 */
export function useClassTypes() {
  return useQuery({
    queryKey: ['class-types'],
    queryFn: fetchClassTypes,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch class rooms
 */
export function useClassRooms() {
  return useQuery({
    queryKey: ['class-rooms'],
    queryFn: fetchClassRooms,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// ============================================
// Daily Dashboard Hooks
// ============================================

/**
 * Hook to fetch detailed daily data
 */
export function useDailyDetailed(date: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['daily-detailed', date],
    queryFn: () => fetchDailyDetailed(date),
    staleTime: 0, // Always consider data stale - ensures fresh data on navigation
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes for quick back navigation
    enabled: enabled && !!date,
    refetchOnMount: 'always', // Always refetch when component mounts (page navigation)
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 1000 * 60, // Refetch every 60 seconds for real-time updates
  });
}

/**
 * Hook to check in a member
 */
export function useCheckInMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, userId }: { classId: number; userId: number }) =>
      checkInMember(classId, userId),
    onSuccess: () => {
      // Invalidate daily detailed query to refetch data
      queryClient.invalidateQueries({ queryKey: ['daily-detailed'] });
    },
  });
}

/**
 * Hook to promote a member from waitlist
 */
export function usePromoteFromWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, memberId }: { classId: number; memberId: number }) =>
      promoteFromWaitlist(classId, memberId),
    onSuccess: () => {
      // Invalidate daily detailed query to refetch data
      queryClient.invalidateQueries({ queryKey: ['daily-detailed'] });
    },
  });
}
