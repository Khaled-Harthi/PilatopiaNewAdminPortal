/**
 * API service for Schedule Management
 */

import apiClient from '../axios';
import type {
  ClassesResponse,
  ClassDetailsResponse,
  Instructor,
  ClassType,
  ClassRoom,
  CreateClassPayload,
  UpdateClassPayload,
  DailyDetailedResponse,
  PromoteFromWaitlistResponse,
} from './types';

/**
 * Fetches classes for a date range
 */
export async function fetchClasses(startDate: string, endDate: string): Promise<ClassesResponse> {
  const response = await apiClient.get<ClassesResponse>(
    `/admin/schedules/classes/by-date-range`,
    {
      params: { startDate, endDate },
    }
  );
  return response.data;
}

/**
 * Fetches class details with registrations and waitlist
 */
export async function fetchClassDetails(classId: number): Promise<ClassDetailsResponse> {
  const response = await apiClient.get<ClassDetailsResponse>(
    `/admin/attendance/classes/${classId}`
  );
  return response.data;
}

/**
 * Updates a class (edit or drag-drop)
 */
export async function updateClass(
  classId: number,
  payload: UpdateClassPayload
): Promise<{ success: boolean }> {
  const response = await apiClient.put(`/admin/schedules/classes/${classId}`, payload);
  return response.data;
}

/**
 * Deletes/cancels a class
 */
export async function deleteClass(classId: number): Promise<{ success: boolean }> {
  const response = await apiClient.delete(`/admin/schedules/classes/${classId}`);
  return response.data;
}

/**
 * Creates one or more classes (bulk endpoint)
 */
export async function createClasses(payload: CreateClassPayload): Promise<{ success: boolean }> {
  const response = await apiClient.post(`/admin/schedules/classes/bulk`, payload);
  return response.data;
}

/**
 * Uploads classes via CSV file
 */
export async function uploadClassesCSV(file: File): Promise<{ success: boolean }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(`/admin/schedules/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Fetches all instructors
 */
export async function fetchInstructors(): Promise<Instructor[]> {
  const response = await apiClient.get<{ success: boolean; instructors: Instructor[] }>(`/admin/instructors`);
  return response.data.instructors;
}

/**
 * Fetches all class types
 */
export async function fetchClassTypes(): Promise<ClassType[]> {
  const response = await apiClient.get<{ success: boolean; data: ClassType[] }>(`/admin/class-types/all`);
  return response.data.data;
}

/**
 * Fetches all class rooms
 */
export async function fetchClassRooms(): Promise<ClassRoom[]> {
  const response = await apiClient.get<{ success: boolean; data: ClassRoom[] }>(`/admin/classes/rooms`);
  return response.data.data;
}

// ============================================
// Daily Dashboard API Functions
// ============================================

/**
 * Fetches detailed daily data including all classes, bookings, and waitlists
 */
export async function fetchDailyDetailed(date: string): Promise<DailyDetailedResponse> {
  const response = await apiClient.get<DailyDetailedResponse>(
    `/admin/attendance/daily/detailed`,
    {
      params: { date },
    }
  );
  return response.data;
}

/**
 * Records attendance (check-in) for a member
 */
export async function checkInMember(
  classId: number,
  userId: number
): Promise<{ success: boolean; attendance_id: number }> {
  const response = await apiClient.post(
    `/admin/attendance/classes/${classId}/users/${userId}`
  );
  return response.data;
}

/**
 * Promotes a member from waitlist to booking
 */
export async function promoteFromWaitlist(
  classId: number,
  memberId: number
): Promise<PromoteFromWaitlistResponse> {
  const response = await apiClient.post<PromoteFromWaitlistResponse>(
    `/admin/classes/${classId}/waitlist/${memberId}/promote`
  );
  return response.data;
}
