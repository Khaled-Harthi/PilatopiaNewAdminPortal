'use client';

import { useMemo, useRef, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, isSameWeek } from 'date-fns';
import { CalendarDays, Plus } from 'lucide-react';
import { ScheduleGridCell } from './schedule-grid-cell';
import { Button } from '@/components/ui/button';
import type { PilatesClass } from '@/lib/schedule/types';
import type { HourRangeMode } from './schedule-toolbar';
import { cn } from '@/lib/utils';

// Get local hour (UTC+3) from a UTC datetime string
function getLocalHour(utcDatetime: string): number {
  const date = new Date(utcDatetime);
  // Add 3 hours for Saudi Arabia timezone (UTC+3)
  const localDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  return localDate.getUTCHours();
}

// Get local date (UTC+3) from a UTC datetime string
function getLocalDate(utcDatetime: string): Date {
  const date = new Date(utcDatetime);
  // Add 3 hours for Saudi Arabia timezone (UTC+3)
  return new Date(date.getTime() + 3 * 60 * 60 * 1000);
}

const ALL_HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM
const PEAK_HOURS = Array.from({ length: 7 }, (_, i) => i + 14); // 2 PM to 8 PM
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

interface ScheduleGridProps {
  classes: PilatesClass[];
  currentWeek: Date;
  hourRangeMode: HourRangeMode;
  onClassClick: (classData: PilatesClass) => void;
  onDeleteClass: (classData: PilatesClass) => void;
  onBulkCreate?: () => void;
  locale: string;
}

export function ScheduleGrid({
  classes,
  currentWeek,
  hourRangeMode,
  onClassClick,
  onDeleteClass,
  onBulkCreate,
  locale,
}: ScheduleGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const currentHour = now.getHours();
  const isCurrentWeek = isSameWeek(now, currentWeek, { weekStartsOn: 0 });
  const isToday = (date: Date) => isSameDay(date, now);

  // Get week dates (Sun-Sat)
  const weekDates = useMemo(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [currentWeek]);

  // Group classes by date and hour (using business timezone UTC+3)
  const classesByDateHour = useMemo(() => {
    const map = new Map<string, PilatesClass[]>();

    classes.forEach((cls) => {
      // Use business timezone (UTC+3) for determining date and hour
      const localDate = getLocalDate(cls.schedule_time);
      const hour = getLocalHour(cls.schedule_time);

      weekDates.forEach((weekDate, dayIndex) => {
        // Compare only year, month, day (ignore time)
        if (
          localDate.getUTCFullYear() === weekDate.getFullYear() &&
          localDate.getUTCMonth() === weekDate.getMonth() &&
          localDate.getUTCDate() === weekDate.getDate()
        ) {
          const key = `${dayIndex}-${hour}`;
          const existing = map.get(key) || [];
          map.set(key, [...existing, cls]);
        }
      });
    });

    return map;
  }, [classes, weekDates]);

  // Calculate dynamic hour range based on classes
  const displayHours = useMemo(() => {
    if (hourRangeMode === 'all') {
      return ALL_HOURS;
    }

    if (hourRangeMode === 'peak') {
      return PEAK_HOURS;
    }

    // Auto mode: detect hour range from classes
    if (classes.length === 0) {
      return PEAK_HOURS; // Default to peak hours if no classes
    }

    let minHour = 23;
    let maxHour = 0;

    classes.forEach((cls) => {
      // Use business timezone (UTC+3) for hour calculation
      const hour = getLocalHour(cls.schedule_time);
      minHour = Math.min(minHour, hour);
      maxHour = Math.max(maxHour, hour);
    });

    // Add buffer
    minHour = Math.max(6, minHour - 1);
    maxHour = Math.min(21, maxHour + 1);

    // Ensure reasonable range
    if (maxHour <= minHour) {
      return PEAK_HOURS;
    }

    return Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);
  }, [classes, hourRangeMode]);

  // Auto-scroll to appropriate row on mount
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const getScrollTargetHour = (): number => {
      // If current week and current hour is within display range
      if (isCurrentWeek && displayHours.includes(currentHour)) {
        return currentHour;
      }

      // Find first class today
      const todayIndex = weekDates.findIndex((date) => isSameDay(date, now));
      if (todayIndex >= 0) {
        for (const hour of displayHours) {
          const key = `${todayIndex}-${hour}`;
          if (classesByDateHour.has(key) && classesByDateHour.get(key)!.length > 0) {
            return hour;
          }
        }
      }

      // Find first class this week
      for (const hour of displayHours) {
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          const key = `${dayIndex}-${hour}`;
          if (classesByDateHour.has(key) && classesByDateHour.get(key)!.length > 0) {
            return hour;
          }
        }
      }

      // Default to first hour in range
      return displayHours[0];
    };

    const targetHour = getScrollTargetHour();
    const hourIndex = displayHours.indexOf(targetHour);

    if (hourIndex > 0) {
      // Each row is approximately 96px (h-24)
      const scrollPosition = hourIndex * 96;
      scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition - 48);
    }
  }, [classes, currentWeek, displayHours, isCurrentWeek, currentHour, classesByDateHour, weekDates, now]);

  const formatTimeLabel = (hour: number) => {
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  // Calculate which day column is "today" (0-6 for Sun-Sat)
  const todayColumnIndex = useMemo(() => {
    if (!isCurrentWeek) return -1;
    return weekDates.findIndex((date) => isSameDay(date, now));
  }, [isCurrentWeek, weekDates, now]);

  // Calculate position for "now" indicator (percentage within the hour)
  const nowLinePosition = useMemo(() => {
    if (!isCurrentWeek || !displayHours.includes(currentHour) || todayColumnIndex < 0) {
      return null;
    }
    const minutes = now.getMinutes();
    const hourIndex = displayHours.indexOf(currentHour);
    // Position as percentage of the hour block
    return {
      hourIndex,
      minutePercent: (minutes / 60) * 100,
      columnIndex: todayColumnIndex,
    };
  }, [isCurrentWeek, currentHour, displayHours, now, todayColumnIndex]);

  // Empty state when no classes
  if (classes.length === 0) {
    return (
      <div className="flex-1 border rounded-lg bg-card flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="text-center space-y-4 p-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <CalendarDays className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {locale === 'ar' ? 'لا توجد حصص مجدولة' : 'No classes scheduled'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-[300px]">
              {locale === 'ar'
                ? 'لا توجد حصص لهذا الأسبوع. انقر على + في أي خلية لإضافة حصة، أو استخدم الإنشاء المجمع.'
                : 'There are no classes for this week. Click + on any cell to add a class, or use Bulk Create for multiple.'}
            </p>
          </div>
          {onBulkCreate && (
            <Button onClick={onBulkCreate} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              {locale === 'ar' ? 'إنشاء مجمع' : 'Bulk Create'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-auto border rounded-lg bg-card"
      style={{ maxHeight: 'calc(100vh - 280px)' }}
    >
      <table className="w-full border-collapse text-sm">
        {/* Sticky Header */}
        <thead className="sticky top-0 z-20 bg-card">
          <tr>
            {/* Time column header */}
            <th className="sticky left-0 z-30 bg-muted/50 border-b border-r p-2 w-20 min-w-[80px]">
              <span className="text-xs text-muted-foreground">
                {locale === 'ar' ? 'الوقت' : 'Time'}
              </span>
            </th>
            {/* Day headers */}
            {weekDates.map((date, index) => (
              <th
                key={date.toISOString()}
                className={cn(
                  'border-b border-r p-2 text-center min-w-[100px]',
                  isToday(date) ? 'bg-accent/20' : 'bg-muted/50'
                )}
              >
                <div className="font-semibold">
                  {locale === 'ar' ? DAYS_AR[index] : DAYS[index]}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(date, 'MMM d')}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {displayHours.map((hour, hourIndex) => {
            const isCurrentHourRow = isCurrentWeek && hour === currentHour;

            return (
              <tr key={hour} className="relative">
                {/* Sticky time column */}
                <td
                  className={cn(
                    'sticky left-0 z-10 border-b border-r p-2 text-center font-medium bg-card',
                    isCurrentHourRow && 'bg-accent/10'
                  )}
                >
                  <div className="flex items-center justify-center gap-1">
                    {isCurrentHourRow && (
                      <span className="text-primary text-xs">▶</span>
                    )}
                    <span className={cn(isCurrentHourRow && 'text-primary font-semibold')}>
                      {formatTimeLabel(hour)}
                    </span>
                  </div>
                </td>

                {/* Day cells */}
                {weekDates.map((date, dayIndex) => {
                  const key = `${dayIndex}-${hour}`;
                  const cellClasses = classesByDateHour.get(key) || [];
                  const isNowCell = nowLinePosition !== null &&
                    nowLinePosition.hourIndex === hourIndex &&
                    nowLinePosition.columnIndex === dayIndex;

                  return (
                    <ScheduleGridCell
                      key={`${date.toISOString()}-${hour}`}
                      classes={cellClasses}
                      allClasses={classes}
                      date={date}
                      hour={hour}
                      onClassClick={onClassClick}
                      onDeleteClass={onDeleteClass}
                      locale={locale}
                      isNowCell={isNowCell}
                      nowMinutePercent={isNowCell ? nowLinePosition.minutePercent : 0}
                    />
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
