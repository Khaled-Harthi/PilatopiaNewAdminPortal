'use client';

import { useState, useMemo, useCallback } from 'react';
import { ShadcnBigCalendar, localizer } from './shadcn-big-calendar';
import { useClasses } from '@/lib/schedule/hooks';
import { getCurrentWeekRange, getWeekRange, toLocalDate, formatTime } from '@/lib/schedule/time-utils';
import type { PilatesClass, CalendarEvent } from '@/lib/schedule/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import { useLocale } from 'next-intl';

interface ScheduleCalendarProps {
  onClassClick?: (classData: PilatesClass) => void;
  onQuickAdd?: (date: Date) => void;
  onAddSchedule?: () => void;
  onEditClass?: (classData: PilatesClass) => void;
  onDeleteClass?: (classData: PilatesClass) => void;
}

export function ScheduleCalendar({ onClassClick, onQuickAdd, onAddSchedule, onEditClass, onDeleteClass }: ScheduleCalendarProps) {
  const locale = useLocale();
  const [weekOffset, setWeekOffset] = useState(0);

  // Get current week range based on offset
  const { startDate, endDate } = useMemo(
    () => getWeekRange(weekOffset),
    [weekOffset]
  );

  // Fetch classes for current week
  const { data: classesData, isLoading, error } = useClasses(startDate, endDate);

  // Convert Pilates classes to calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    if (!classesData?.classes) return [];

    return classesData.classes.map((cls) => {
      const startDate = toLocalDate(cls.schedule_time);
      const endDate = new Date(startDate.getTime() + cls.duration_minutes * 60 * 1000);

      return {
        id: cls.id,
        title: `${cls.class_type} • ${cls.instructor}`,
        start: startDate,
        end: endDate,
        resource: cls,
      };
    });
  }, [classesData]);

  // Get start and end dates for calendar view
  const calendarDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + weekOffset * 7);
    return date;
  }, [weekOffset]);

  // Custom event component with context menu
  const EventComponent = useCallback(({ event }: { event: CalendarEvent }) => {
    const cls = event.resource;
    const isFull = cls.booked_seats >= cls.capacity;

    // Format time for display
    const classTime = toLocalDate(cls.schedule_time);
    const formattedTime = formatTime(
      classTime.toTimeString().substring(0, 5),
      locale
    );

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className="p-2 text-sm overflow-hidden cursor-pointer h-full flex flex-col gap-0.5"
            onClick={(e) => {
              e.stopPropagation();
              onClassClick?.(cls);
            }}
          >
            <div className="font-semibold truncate">{cls.class_type}</div>
            <div className="text-sm truncate">{formattedTime}</div>
            <div className="text-sm truncate">{cls.instructor}</div>
            <div className="text-sm truncate">{cls.duration_minutes} min</div>
            <div className="text-sm truncate">{cls.class_room_name}</div>
            <div className="text-sm flex items-center gap-1">
              👥 {cls.booked_seats}/{cls.capacity}
              {isFull && <span className="text-red-500">🔴</span>}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEditClass?.(cls);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            {locale === 'ar' ? 'تعديل الحصة' : 'Edit Class'}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClass?.(cls);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {locale === 'ar' ? 'إلغاء الحصة' : 'Cancel Class'}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }, [onClassClick, onEditClass, onDeleteClass, locale]);

  // Custom slot wrapper to add quick add buttons
  const SlotWrapper = useCallback((props: { children?: React.ReactNode; value?: Date }) => {
    const { children, value } = props;
    return (
      <div className="rbc-day-slot group relative">
        {children}
        {value && (
          <button
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs z-10"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd?.(value);
            }}
            title={locale === 'ar' ? 'إضافة حصة سريعة' : 'Quick add class'}
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }, [onQuickAdd, locale]);

  // Handle navigation
  const handlePrevious = () => setWeekOffset(offset => offset - 1);
  const handleNext = () => setWeekOffset(offset => offset + 1);
  const handleToday = () => setWeekOffset(0);

  // Custom toolbar
  const CustomToolbar = useCallback((toolbarProps: any) => {
    const { label } = toolbarProps;

    return (
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h2 className="text-2xl font-bold">Schedules</h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <span className="text-sm font-semibold min-w-[200px] text-center">
            {label}
          </span>

          <Button size="sm" onClick={() => onAddSchedule?.()}>
            <Plus className="h-4 w-4 mr-1" />
            Add Schedule
          </Button>
        </div>
      </div>
    );
  }, [handlePrevious, handleNext, handleToday, onAddSchedule]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] border rounded-lg">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load schedule</p>
          <p className="text-sm text-muted-foreground">
            {locale === 'ar' ? 'فشل تحميل الجدول' : 'Failed to load schedule'}
          </p>
        </div>
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="space-y-4">
        <CustomToolbar label={`${startDate} - ${endDate}`} />
        <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg">
          <div className="text-center space-y-4">
            <div className="text-6xl">📅</div>
            <div>
              <p className="font-semibold">
                {locale === 'ar' ? 'لا توجد حصص مجدولة هذا الأسبوع' : 'No classes scheduled this week'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onQuickAdd?.(new Date())}>
                {locale === 'ar' ? 'إنشاء حصة واحدة' : 'Create Single Class'}
              </Button>
              <Button size="sm" onClick={() => onQuickAdd?.(new Date())}>
                {locale === 'ar' ? 'إنشاء جدول' : 'Create Schedule'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[800px]">
      <ShadcnBigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        view="week"
        onView={() => {}} // Disable view change
        views={['week']}
        date={calendarDate}
        onNavigate={() => {}} // We handle navigation ourselves
        components={{
          toolbar: CustomToolbar,
          event: EventComponent,
          timeSlotWrapper: SlotWrapper,
        }}
        step={60}
        timeslots={1}
        min={new Date(2024, 0, 1, 6, 0, 0)} // 6 AM
        max={new Date(2024, 0, 1, 22, 0, 0)} // 10 PM
        culture={locale === 'ar' ? 'ar' : 'en-US'}
        rtl={locale === 'ar'}
      />
    </div>
  );
}
