/**
 * Type definitions for Instructor Portal
 */

export interface InstructorClass {
  id: number;
  schedule_time: string; // ISO datetime string in UTC
  duration_minutes: number;
  capacity: number;
  class_type: string;
  class_room: string;
  clients: string[]; // Array of client names
  booked_count: number;
}

export interface InstructorScheduleResponse {
  success: boolean;
  data: {
    start_date: string; // ISO datetime string
    end_date: string; // ISO datetime string
    classes: InstructorClass[];
  };
}

export interface InstructorWeekSummary {
  totalClasses: number;
  totalBooked: number;
  totalCapacity: number;
  fillRate: number;
}
