'use client';

import { useMemo, useState } from 'react';
import { format, addDays, parseISO, isToday } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarDays, ChevronDown, Clock, MapPin, Users } from 'lucide-react';
import type { InstructorClass } from '@/lib/instructor/types';
import { cn } from '@/lib/utils';

interface InstructorMobileListProps {
  classes: InstructorClass[];
  weekStart: Date;
  locale: string;
}

export function InstructorMobileList({
  classes,
  weekStart,
  locale,
}: InstructorMobileListProps) {
  const isRTL = locale === 'ar';
  const dateLocale = isRTL ? ar : undefined;
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Get week dates (Sun-Sat)
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Group classes by date
  const classesByDate = useMemo(() => {
    const map = new Map<string, InstructorClass[]>();

    weekDates.forEach((date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      map.set(dateKey, []);
    });

    classes.forEach((cls) => {
      const clsDate = parseISO(cls.schedule_time);
      const dateKey = format(clsDate, 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, cls]);
    });

    // Sort classes by time within each day
    map.forEach((dayClasses) => {
      dayClasses.sort((a, b) =>
        new Date(a.schedule_time).getTime() - new Date(b.schedule_time).getTime()
      );
    });

    return map;
  }, [classes, weekDates]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Empty state
  if (classes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <CalendarDays className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isRTL ? 'لا توجد حصص مجدولة' : 'No classes scheduled'}
            </h3>
            <p className="text-sm text-muted-foreground">
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
    <div className="flex-1 space-y-4">
      {weekDates.map((date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayClasses = classesByDate.get(dateKey) || [];
        const isTodayDate = isToday(date);
        const dayName = format(date, 'EEEE', { locale: dateLocale });
        const dateStr = format(date, 'MMM d', { locale: dateLocale });

        return (
          <div key={dateKey} className="space-y-2">
            {/* Day Header */}
            <div
              className={cn(
                'sticky top-0 z-10 px-4 py-2 -mx-4 bg-background border-b',
                isTodayDate && 'bg-accent/20'
              )}
            >
              <div className="flex items-center gap-2">
                {isTodayDate && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    {isRTL ? 'اليوم' : 'TODAY'}
                  </span>
                )}
                <span className="font-semibold">{dayName}</span>
                <span className="text-muted-foreground text-sm">{dateStr}</span>
              </div>
            </div>

            {/* Classes for this day */}
            {dayClasses.length > 0 ? (
              <div className="space-y-2 px-1">
                {dayClasses.map((cls) => {
                  const scheduleTime = parseISO(cls.schedule_time);
                  const timeStr = format(scheduleTime, 'h:mm a', { locale: dateLocale });
                  const isExpanded = expandedId === cls.id;

                  return (
                    <div
                      key={cls.id}
                      className="rounded-lg border bg-card overflow-hidden"
                    >
                      {/* Class Header - Clickable */}
                      <button
                        onClick={() => toggleExpand(cls.id)}
                        className="w-full text-left p-3 transition-colors hover:bg-accent/50 active:bg-accent"
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Time */}
                          <div className="text-sm font-medium text-muted-foreground w-16 shrink-0">
                            {timeStr}
                          </div>

                          {/* Class Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {cls.class_type}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {cls.class_room}
                            </div>
                          </div>

                          {/* Capacity + Chevron */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm text-muted-foreground">
                              {cls.booked_count}/{cls.capacity}
                            </span>
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 text-muted-foreground transition-transform',
                                isExpanded && 'rotate-180'
                              )}
                            />
                          </div>
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t bg-muted/30 p-3 space-y-3">
                          {/* Class Details */}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{cls.duration_minutes} {isRTL ? 'دقيقة' : 'min'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{cls.class_room}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{cls.booked_count}/{cls.capacity}</span>
                            </div>
                          </div>

                          {/* Client List */}
                          {cls.clients.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                {isRTL ? 'الحجوزات' : 'Bookings'}
                              </div>
                              <div className="space-y-1">
                                {cls.clients.map((client, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                      {client.charAt(0)}
                                    </div>
                                    <span>{client}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              {isRTL ? 'لا توجد حجوزات بعد' : 'No bookings yet'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                {isRTL ? 'لا توجد حصص' : 'No classes'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
