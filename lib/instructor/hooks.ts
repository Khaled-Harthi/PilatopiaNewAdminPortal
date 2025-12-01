/**
 * React Query hooks for Instructor Portal
 */

import { useQuery } from '@tanstack/react-query';
import { fetchInstructorSchedule } from './api';
import type { InstructorScheduleResponse, InstructorWeekSummary } from './types';

/**
 * Hook to fetch instructor's weekly schedule
 */
export function useInstructorSchedule() {
  return useQuery<InstructorScheduleResponse>({
    queryKey: ['instructor', 'schedule'],
    queryFn: fetchInstructorSchedule,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Calculate week summary from schedule data
 */
export function calculateWeekSummary(data: InstructorScheduleResponse | undefined): InstructorWeekSummary {
  if (!data?.data?.classes) {
    return {
      totalClasses: 0,
      totalBooked: 0,
      totalCapacity: 0,
      fillRate: 0,
    };
  }

  const classes = data.data.classes;
  const totalClasses = classes.length;
  const totalBooked = classes.reduce((sum, cls) => sum + cls.booked_count, 0);
  const totalCapacity = classes.reduce((sum, cls) => sum + cls.capacity, 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  return {
    totalClasses,
    totalBooked,
    totalCapacity,
    fillRate,
  };
}
