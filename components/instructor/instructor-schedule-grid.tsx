'use client';

import { useMemo, useRef, useEffect } from 'react';
import { format, addDays, isSameDay, isSameWeek, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { InstructorClassPopover } from './instructor-class-popover';
import type { InstructorClass } from '@/lib/instructor/types';
import { cn } from '@/lib/utils';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const PEAK_HOURS = Array.from({ length: 7 }, (_, i) => i + 14); // 2 PM to 8 PM

interface InstructorScheduleGridProps {
  classes: InstructorClass[];
  weekStart: Date;
  locale: string;
}

// Generate color based on class type
function getClassColor(classType: string): string {
  let hash = 0;
  for (let i = 0; i < classType.length; i++) {
    hash = classType.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

export function InstructorScheduleGrid({
  classes,
  weekStart,
  locale,
}: InstructorScheduleGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const currentHour = now.getHours();
  const isCurrentWeek = isSameWeek(now, weekStart, { weekStartsOn: 0 });
  const isToday = (date: Date) => isSameDay(date, now);
  const isRTL = locale === 'ar';
  const dateLocale = isRTL ? ar : undefined;

  // Get week dates (Sun-Sat)
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Group classes by date and hour
  const classesByDateHour = useMemo(() => {
    const map = new Map<string, InstructorClass[]>();

    classes.forEach((cls) => {
      const date = parseISO(cls.schedule_time);
      const hour = date.getUTCHours();

      weekDates.forEach((weekDate, dayIndex) => {
        if (isSameDay(date, weekDate)) {
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
    if (classes.length === 0) {
      return PEAK_HOURS;
    }

    let minHour = 23;
    let maxHour = 0;

    classes.forEach((cls) => {
      const hour = parseISO(cls.schedule_time).getUTCHours();
      minHour = Math.min(minHour, hour);
      maxHour = Math.max(maxHour, hour);
    });

    // Add buffer
    minHour = Math.max(6, minHour - 1);
    maxHour = Math.min(21, maxHour + 1);

    if (maxHour <= minHour) {
      return PEAK_HOURS;
    }

    return Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);
  }, [classes]);

  // Auto-scroll to appropriate row
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const getScrollTargetHour = (): number => {
      if (isCurrentWeek && displayHours.includes(currentHour)) {
        return currentHour;
      }

      // Find first class today
      const todayIndex = weekDates.findIndex((date) => isSameDay(date, now));
      if (todayIndex >= 0) {
        for (const hour of displayHours) {
          const key = `${todayIndex}-${hour}`;
          if (classesByDateHour.has(key)) {
            return hour;
          }
        }
      }

      // Find first class this week
      for (const hour of displayHours) {
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          const key = `${dayIndex}-${hour}`;
          if (classesByDateHour.has(key)) {
            return hour;
          }
        }
      }

      return displayHours[0];
    };

    const targetHour = getScrollTargetHour();
    const hourIndex = displayHours.indexOf(targetHour);

    if (hourIndex > 0) {
      const scrollPosition = hourIndex * 96;
      scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition - 48);
    }
  }, [classes, weekStart, displayHours, isCurrentWeek, currentHour, classesByDateHour, weekDates, now]);

  const formatTimeLabel = (hour: number) => {
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  // Empty state
  if (classes.length === 0) {
    return (
      <div className="flex-1 border rounded-lg bg-card flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="text-center space-y-4 p-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <CalendarDays className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isRTL ? 'لا توجد حصص مجدولة' : 'No classes scheduled'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-[300px]">
              {isRTL
                ? 'لا توجد حصص لهذا الأسبوع.'
                : 'There are no classes scheduled for this week.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-auto border rounded-lg bg-card"
      style={{ maxHeight: 'calc(100vh - 320px)' }}
    >
      <table className="w-full border-collapse text-sm">
        {/* Sticky Header */}
        <thead className="sticky top-0 z-20 bg-card">
          <tr>
            <th className="sticky left-0 z-30 bg-muted/50 border-b border-r p-2 w-20 min-w-[80px]">
              <span className="text-xs text-muted-foreground">
                {isRTL ? 'الوقت' : 'Time'}
              </span>
            </th>
            {weekDates.map((date, index) => (
              <th
                key={date.toISOString()}
                className={cn(
                  'border-b border-r p-2 text-center min-w-[120px]',
                  isToday(date) ? 'bg-accent/20' : 'bg-muted/50'
                )}
              >
                <div className="font-semibold">
                  {isRTL ? DAYS_AR[index] : DAYS[index]}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(date, 'MMM d', { locale: dateLocale })}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {displayHours.map((hour) => {
            const isCurrentHourRow = isCurrentWeek && hour === currentHour;

            return (
              <tr key={hour}>
                <td
                  className={cn(
                    'sticky left-0 z-10 border-b border-r p-2 text-center font-medium bg-card h-24',
                    isCurrentHourRow && 'bg-accent/10'
                  )}
                >
                  <span className={cn(isCurrentHourRow && 'text-primary font-semibold')}>
                    {formatTimeLabel(hour)}
                  </span>
                </td>

                {weekDates.map((date, dayIndex) => {
                  const key = `${dayIndex}-${hour}`;
                  const cellClasses = classesByDateHour.get(key) || [];

                  return (
                    <td
                      key={`${date.toISOString()}-${hour}`}
                      className={cn(
                        'border-b border-r p-1 align-top h-24',
                        isToday(date) && 'bg-accent/5'
                      )}
                    >
                      <div className="flex flex-col gap-1 h-full">
                        {cellClasses.map((cls) => {
                          const color = getClassColor(cls.class_type);
                          const fillPercent = (cls.booked_count / cls.capacity) * 100;

                          return (
                            <InstructorClassPopover
                              key={cls.id}
                              classData={cls}
                              locale={locale}
                            >
                              <button
                                className="w-full text-left rounded-md px-2 py-1.5 transition-colors hover:opacity-80"
                                style={{ backgroundColor: `${color}20` }}
                              >
                                <div className="text-xs font-medium truncate" style={{ color }}>
                                  {cls.class_type}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {/* Capacity dots */}
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: Math.min(cls.capacity, 6) }).map((_, i) => (
                                      <span
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{
                                          backgroundColor: i < cls.booked_count ? color : `${color}40`,
                                        }}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {cls.booked_count}/{cls.capacity}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground truncate mt-0.5">
                                  {cls.class_room}
                                </div>
                              </button>
                            </InstructorClassPopover>
                          );
                        })}
                      </div>
                    </td>
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
