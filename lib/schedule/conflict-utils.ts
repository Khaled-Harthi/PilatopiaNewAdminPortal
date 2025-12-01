/**
 * Conflict detection utilities for Schedule Management
 */

import type { PilatesClass } from './types';

export interface ScheduleConflict {
  type: 'instructor' | 'room';
  conflictingClass: PilatesClass;
  message: string;
}

interface NewClassInfo {
  instructorId: number;
  classRoomId: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (local time)
  durationMinutes: number;
  excludeClassId?: number; // When editing, exclude the class being edited
}

/**
 * Converts time string (HH:mm) to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Checks if two time ranges overlap
 */
function timeRangesOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Checks for scheduling conflicts when creating or editing a class
 * @param newClass - The class being created/edited
 * @param existingClasses - All existing classes to check against
 * @returns Array of conflicts found
 */
export function checkScheduleConflicts(
  newClass: NewClassInfo,
  existingClasses: PilatesClass[]
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  const newStartMinutes = timeToMinutes(newClass.time);
  const newEndMinutes = newStartMinutes + newClass.durationMinutes;

  // Filter classes on the same date
  const classesOnSameDate = existingClasses.filter((cls) => {
    // Skip the class being edited
    if (newClass.excludeClassId && cls.id === newClass.excludeClassId) {
      return false;
    }

    // Check if class is on the same date
    const classDate = new Date(cls.schedule_time);
    const classDateStr = classDate.toISOString().split('T')[0];

    // Also check local date
    const classLocalDate = `${classDate.getFullYear()}-${String(classDate.getMonth() + 1).padStart(2, '0')}-${String(classDate.getDate()).padStart(2, '0')}`;

    return classDateStr === newClass.date || classLocalDate === newClass.date;
  });

  for (const existingClass of classesOnSameDate) {
    const existingDate = new Date(existingClass.schedule_time);
    const existingStartMinutes = existingDate.getHours() * 60 + existingDate.getMinutes();
    const existingEndMinutes = existingStartMinutes + existingClass.duration_minutes;

    // Check if times overlap
    if (!timeRangesOverlap(newStartMinutes, newEndMinutes, existingStartMinutes, existingEndMinutes)) {
      continue;
    }

    // Check instructor conflict
    if (existingClass.instructor_id === newClass.instructorId) {
      const existingTime = `${Math.floor(existingStartMinutes / 60)}:${String(existingStartMinutes % 60).padStart(2, '0')}`;
      const displayHour = Math.floor(existingStartMinutes / 60);
      const ampm = displayHour >= 12 ? 'PM' : 'AM';
      const hour12 = displayHour > 12 ? displayHour - 12 : displayHour === 0 ? 12 : displayHour;
      const timeDisplay = `${hour12}:${String(existingStartMinutes % 60).padStart(2, '0')} ${ampm}`;

      conflicts.push({
        type: 'instructor',
        conflictingClass: existingClass,
        message: `${existingClass.instructor} is teaching "${existingClass.name || existingClass.class_type}" at ${timeDisplay}`,
      });
    }

    // Check room conflict
    if (existingClass.class_room_id === newClass.classRoomId) {
      const existingStartMinutes2 = existingDate.getHours() * 60 + existingDate.getMinutes();
      const displayHour = Math.floor(existingStartMinutes2 / 60);
      const ampm = displayHour >= 12 ? 'PM' : 'AM';
      const hour12 = displayHour > 12 ? displayHour - 12 : displayHour === 0 ? 12 : displayHour;
      const timeDisplay = `${hour12}:${String(existingStartMinutes2 % 60).padStart(2, '0')} ${ampm}`;

      conflicts.push({
        type: 'room',
        conflictingClass: existingClass,
        message: `${existingClass.class_room_name} is booked for "${existingClass.name || existingClass.class_type}" at ${timeDisplay}`,
      });
    }
  }

  return conflicts;
}
