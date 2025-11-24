/**
 * Type definitions for Schedule Management
 */

export interface PilatesClass {
  id: number;
  class_type_id: number;
  instructor_id: number;
  capacity: number;
  schedule_time: string; // ISO datetime string in UTC
  duration_minutes: number;
  instructor: string;
  name: string | null; // class type name from API
  class_type?: string; // legacy field, same as name
  booked_seats: number;
  class_room_name: string;
  class_room_id?: number;
}

export interface ClassesResponse {
  success: boolean;
  total_classes: number;
  classes: PilatesClass[];
}

export interface ClassRegistration {
  booking_id: number;
  user_id: number;
  user_name: string;
  phone_number: string;
  attendance_id: number | null;
  check_in_time: string | null; // ISO datetime string
  notes: string | null;
}

export interface WaitlistEntry {
  member_id: number;
  member_name: string;
  joined_at: string; // ISO datetime string
}

export interface ClassDetailsResponse {
  success: boolean;
  class: {
    id: number;
    instructor_id: number;
    capacity: number;
    schedule_time: string; // ISO datetime string in UTC
    duration_minutes: number;
    instructor: string;
    name: string; // class type name
    class_room_name: string;
    booked_seats: string;
  };
  total_bookings: number;
  bookings: ClassRegistration[];
  waitlist?: WaitlistEntry[];
}

export interface Instructor {
  id: number;
  name: string;
}

export interface ClassType {
  id: number;
  name: string;
}

export interface ClassRoom {
  id: number;
  name: string;
}

export interface CreateClassPayload {
  classesConfig: {
    classTypeId: number;
    instructorId: number;
    classRoomId: number;
    capacity: number;
    durationMinutes: number;
  };
  dates: string[]; // Array of dates in YYYY-MM-DD format
  startTime: string; // Time in HH:mm format (UTC)
}

export interface UpdateClassPayload {
  time?: string; // HH:mm format (UTC)
  date?: string; // YYYY-MM-DD format
  class_type_id?: number;
  instructor_id?: number;
  duration?: number;
  capacity?: number;
  class_room_id?: number;
}

// For react-big-calendar
export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: PilatesClass; // Store full class data in resource
}

export interface Conflict {
  type: 'instructor' | 'room';
  class: PilatesClass;
  message: string;
}

export interface TimeSlot {
  day: number; // 0-6 (Sunday-Saturday)
  time: string; // HH:mm format
}

export interface RepeatPattern {
  type: 'one-time' | 'weekly';
  startDate?: string; // YYYY-MM-DD format
  weeks?: number; // Number of weeks to repeat
}

export interface BulkClassConfig {
  classTypeId: number;
  instructorId: number;
  classRoomId: number;
  capacity: number;
  durationMinutes: number;
  timeSlots: TimeSlot[];
  repeatPattern: RepeatPattern;
}
