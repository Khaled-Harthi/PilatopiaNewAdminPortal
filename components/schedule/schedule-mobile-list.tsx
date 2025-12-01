'use client';

import { useMemo, useState } from 'react';
import { format, addDays, parseISO, isToday } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarDays, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ClassDetailSheet } from './class-detail-sheet';
import { QuickAddClassPopover } from './quick-add-class-popover';
import type { PilatesClass } from '@/lib/schedule/types';

interface ScheduleMobileListProps {
  classes: PilatesClass[];
  weekStart: Date;
  onDeleteClass: (classData: PilatesClass) => void;
  onAddClick: () => void;
  locale: string;
}

export function ScheduleMobileList({
  classes,
  weekStart,
  onDeleteClass,
  onAddClick,
  locale,
}: ScheduleMobileListProps) {
  const isRTL = locale === 'ar';
  const dateLocale = isRTL ? ar : undefined;
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [quickAddDate, setQuickAddDate] = useState<Date | null>(null);

  // Get week dates (Sun-Sat)
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Group classes by date
  const classesByDate = useMemo(() => {
    const map = new Map<string, PilatesClass[]>();

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
          <Button onClick={onAddClick} className="gap-2">
            <Plus className="h-4 w-4" />
            {isRTL ? 'إضافة حصة' : 'Add Class'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 pb-20">
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
                'sticky top-0 z-10 px-4 py-2 -mx-4 bg-background border-b flex items-center justify-between',
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

              {/* Quick Add for this day */}
              <QuickAddClassPopover
                open={quickAddDate?.getTime() === date.getTime()}
                onOpenChange={(open) => setQuickAddDate(open ? date : null)}
                date={date}
                hour={9}
                allClasses={classes}
                locale={locale}
              >
                <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </QuickAddClassPopover>
            </div>

            {/* Classes for this day */}
            {dayClasses.length > 0 ? (
              <div className="space-y-2 px-1">
                {dayClasses.map((cls) => {
                  const scheduleTime = parseISO(cls.schedule_time);
                  const timeStr = format(scheduleTime, 'h:mm a', { locale: dateLocale });
                  const classTypeName = cls.name || cls.class_type || 'Class';
                  const isFull = cls.booked_seats >= cls.capacity;

                  return (
                    <ClassDetailSheet
                      key={cls.id}
                      open={openPopoverId === cls.id}
                      onOpenChange={(open) => setOpenPopoverId(open ? cls.id : null)}
                      classData={cls}
                      allClasses={classes}
                      onDelete={onDeleteClass}
                      locale={locale}
                    >
                      <button className="w-full rounded-lg bg-accent/30 p-3 text-left transition-colors hover:bg-accent/50 active:bg-accent">
                        <div className="flex items-center justify-between gap-3">
                          {/* Time */}
                          <div className="text-sm font-medium text-muted-foreground w-16 shrink-0">
                            {timeStr}
                          </div>

                          {/* Class Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {classTypeName}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="truncate">{cls.instructor}</span>
                              <span>•</span>
                              <span className="shrink-0">{cls.class_room_name}</span>
                            </div>
                          </div>

                          {/* Capacity */}
                          <div className="shrink-0">
                            {isFull ? (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400">
                                FULL
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {cls.booked_seats}/{cls.capacity}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </ClassDetailSheet>
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

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          onClick={onAddClick}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
