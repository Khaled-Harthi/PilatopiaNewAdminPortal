/**
 * Time conversion utilities for Schedule Management
 * Local time is UTC+3 (Saudi Arabia timezone)
 */

/**
 * Converts local time (UTC+3) to UTC for API requests
 * @param localTime - Time in HH:mm format (e.g., "07:00")
 * @param localDate - Date in YYYY-MM-DD format (e.g., "2024-01-15")
 * @returns Object with UTC time and date
 */
export function toUTC(localTime: string, localDate: string): { time: string; date: string } {
  const datetime = new Date(`${localDate}T${localTime}:00+03:00`);
  return {
    time: datetime.toISOString().substring(11, 16), // HH:mm
    date: datetime.toISOString().substring(0, 10),   // YYYY-MM-DD
  };
}

/**
 * Converts UTC datetime string to local time (UTC+3) for display
 * @param utcDatetime - ISO datetime string in UTC (e.g., "2024-01-15T04:00:00Z")
 * @returns Local time in HH:mm format
 */
export function toLocalTime(utcDatetime: string): string {
  const datetime = new Date(utcDatetime);
  // Add 3 hours for Saudi Arabia timezone (UTC+3)
  const localDatetime = new Date(datetime.getTime() + 3 * 60 * 60 * 1000);
  return localDatetime.toISOString().substring(11, 16); // HH:mm
}

/**
 * Converts UTC datetime string to local Date object (UTC+3)
 * @param utcDatetime - ISO datetime string in UTC (e.g., "2024-01-15T04:00:00Z")
 * @returns Local Date object
 */
export function toLocalDate(utcDatetime: string): Date {
  // Parse the UTC datetime - browser will handle timezone conversion
  // If datetime has 'Z' or timezone info, it's already UTC
  // Just return the Date object without manual adjustment
  return new Date(utcDatetime);
}

/**
 * Formats a date for display
 * @param date - Date object
 * @param locale - Locale string (e.g., "en" or "ar")
 * @returns Formatted date string
 */
export function formatDate(date: Date, locale: string = 'en'): string {
  return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a time for display
 * @param time - Time in HH:mm format
 * @param locale - Locale string (e.g., "en" or "ar")
 * @returns Formatted time string (e.g., "7:00 AM")
 */
export function formatTime(time: string, locale: string = 'en'): string {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);

  return date.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Gets the start and end dates for the current week (Sunday-Saturday)
 * @param date - Optional date to get week for (defaults to today)
 * @returns Object with start and end dates in YYYY-MM-DD format
 */
export function getCurrentWeekRange(date: Date = new Date()): { startDate: string; endDate: string } {
  const day = date.getDay();
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - day); // Go to Sunday

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // Go to Saturday

  return {
    startDate: startDate.toISOString().substring(0, 10),
    endDate: endDate.toISOString().substring(0, 10),
  };
}

/**
 * Gets the date range for a week offset from the current week
 * @param offset - Number of weeks to offset (negative for past, positive for future)
 * @param baseDate - Optional base date (defaults to today)
 * @returns Object with start and end dates in YYYY-MM-DD format
 */
export function getWeekRange(offset: number, baseDate: Date = new Date()): { startDate: string; endDate: string } {
  const targetDate = new Date(baseDate);
  targetDate.setDate(targetDate.getDate() + offset * 7);
  return getCurrentWeekRange(targetDate);
}

/**
 * Checks if a date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}
