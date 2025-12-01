/**
 * API service for Instructor Portal
 */

import apiClient from '../axios';
import type { InstructorScheduleResponse } from './types';

/**
 * Fetches the instructor's schedule for the current week
 */
export async function fetchInstructorSchedule(): Promise<InstructorScheduleResponse> {
  const response = await apiClient.get<InstructorScheduleResponse>('/instructor/schedule');
  return response.data;
}
