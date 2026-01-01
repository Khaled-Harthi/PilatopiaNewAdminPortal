'use client';

import { useMemo } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScheduleCell } from './schedule-cell';
import { getLocalHour, isSameLocalDay } from '@/lib/schedule/time-utils';
import type { PilatesClass } from '@/lib/schedule/types';

interface ScheduleWeekTableProps {
  classes: PilatesClass[];
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  onQuickAdd?: (date: Date, hour: number) => void;
  onEditClass?: (classData: PilatesClass) => void;
  onDeleteClass?: (classData: PilatesClass) => void;
  locale: string;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function ScheduleWeekTable({
  classes,
  currentWeek,
  onWeekChange,
  onQuickAdd,
  onEditClass,
  onDeleteClass,
  locale,
}: ScheduleWeekTableProps) {
  // Get week dates (Sun-Sat)
  const weekDates = useMemo(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // Sunday = 0
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [currentWeek]);

  // Group classes by date and hour
  const classesByDateHour = useMemo(() => {
    const map = new Map<string, PilatesClass[]>();

    classes.forEach((cls) => {
      // Use timezone-aware utilities to get hour and match days
      const hour = getLocalHour(cls.schedule_time);

      weekDates.forEach((weekDate, dayIndex) => {
        if (isSameLocalDay(cls.schedule_time, weekDate)) {
          const key = `${dayIndex}-${hour}`;
          const existing = map.get(key) || [];
          map.set(key, [...existing, cls]);
        }
      });
    });

    return map;
  }, [classes, weekDates]);

  const handlePrevWeek = () => {
    onWeekChange(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(currentWeek, 1));
  };

  const formatTimeLabel = (hour: number) => {
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          {locale === 'ar' ? 'جدول الحصص' : 'Schedule Overview'}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {format(weekDates[0], 'MMM d')} - {format(weekDates[6], 'MMM d, yyyy')}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Table Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2 bg-muted/50"></th>
              {weekDates.map((date, index) => (
                <th
                  key={date.toISOString()}
                  className="border p-2 bg-muted/50 text-center font-semibold"
                >
                  <div>{locale === 'ar' ? DAYS_AR[index] : DAYS[index]}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(date, 'MMM d')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour}>
                <td className="border p-2 bg-muted/50 text-center font-medium">
                  {formatTimeLabel(hour)}
                </td>
                {weekDates.map((date, dayIndex) => {
                  const key = `${dayIndex}-${hour}`;
                  const cellClasses = classesByDateHour.get(key) || [];

                  return (
                    <ScheduleCell
                      key={`${date.toISOString()}-${hour}`}
                      classes={cellClasses}
                      onQuickAdd={() => onQuickAdd?.(date, hour)}
                      onEditClass={onEditClass}
                      onDeleteClass={onDeleteClass}
                      locale={locale}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
