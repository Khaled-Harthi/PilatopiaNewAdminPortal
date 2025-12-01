'use client';

import { useState, useMemo, useEffect } from 'react';
import Calendar from '@/components/calendar/calendar';
import { CalendarEvent, Mode } from '@/components/calendar/calendar-types';
import { useClasses, useClassTypes } from '@/lib/schedule/hooks';
import { getWeekRange, toLocalDate } from '@/lib/schedule/time-utils';
import type { PilatesClass } from '@/lib/schedule/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocale } from 'next-intl';
import CalendarProvider from '@/components/calendar/calendar-provider';
import CalendarHeader from '@/components/calendar/header/calendar-header';
import CalendarBody from '@/components/calendar/body/calendar-body';
import CalendarHeaderActions from '@/components/calendar/header/actions/calendar-header-actions';
import CalendarHeaderDate from '@/components/calendar/header/date/calendar-header-date';
import CalendarHeaderActionsMode from '@/components/calendar/header/actions/calendar-header-actions-mode';
import CalendarHeaderActionsAdd from '@/components/calendar/header/actions/calendar-header-actions-add';
import { useCalendarContext } from '@/components/calendar/calendar-context';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Edit, Trash2 } from 'lucide-react';

interface ScheduleCalendarProps {
  onClassClick?: (classData: PilatesClass) => void;
  onQuickAdd?: (date: Date) => void;
  onAddSchedule?: () => void;
  onEditClass?: (classData: PilatesClass) => void;
  onDeleteClass?: (classData: PilatesClass) => void;
}

export function ScheduleCalendar({
  onClassClick,
  onQuickAdd,
  onAddSchedule,
  onEditClass,
  onDeleteClass,
}: ScheduleCalendarProps) {
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>('week');
  const [date, setDate] = useState<Date>(new Date());

  // Listen for quick-add events from calendar cells
  useEffect(() => {
    const handleQuickAddEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ date: Date }>;
      if (customEvent.detail?.date && onQuickAdd) {
        onQuickAdd(customEvent.detail.date);
      }
    };

    window.addEventListener('calendar-quick-add', handleQuickAddEvent);
    return () => {
      window.removeEventListener('calendar-quick-add', handleQuickAddEvent);
    };
  }, [onQuickAdd]);

  // Calculate week range based on current date
  const { startDate, endDate } = useMemo(() => {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start from Sunday
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Format dates in local timezone to avoid UTC offset issues
    const formatLocalDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatLocalDate(weekStart),
      endDate: formatLocalDate(weekEnd),
    };
  }, [date]);

  // Fetch classes for current week
  const { data: classesData, isLoading, error } = useClasses(startDate, endDate);

  // Fetch class types to map class_type_id to name
  const { data: classTypes } = useClassTypes();

  // Convert Pilates classes to calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    if (!classesData?.classes) return [];

    return classesData.classes.map((cls) => {
      const start = toLocalDate(cls.schedule_time);
      const end = new Date(start.getTime() + cls.duration_minutes * 60 * 1000);

      // Determine color based on booking status
      let color = 'blue';
      const fillPercentage = (cls.booked_seats / cls.capacity) * 100;
      if (fillPercentage >= 100) {
        color = 'red'; // Full
      } else if (fillPercentage >= 75) {
        color = 'orange'; // Almost full
      } else if (fillPercentage >= 50) {
        color = 'yellow'; // Half full
      }

      // Get class type name from class types lookup
      const classTypeName = cls.name || cls.class_type || classTypes?.find(ct => ct.id === cls.class_type_id)?.name || 'Class';

      return {
        id: cls.id.toString(),
        title: `${classTypeName} • ${cls.instructor}`,
        color,
        start,
        end,
        // Store the full class data for later use
        data: cls,
      } as CalendarEvent & { data: PilatesClass };
    });
  }, [classesData, classTypes]);

  // Dummy setter for events (calendar requires it but we manage data via API)
  const setEvents = (newEvents: CalendarEvent[]) => {
    console.log('Events updated:', newEvents);
    // We don't actually update events here since we fetch from API
    // This is just to satisfy the Calendar component's prop requirements
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
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

  return (
    <div className="h-[800px]">
      <CalendarProvider
        events={events}
        setEvents={setEvents}
        mode={mode}
        setMode={setMode}
        date={date}
        setDate={setDate}
        calendarIconIsToday={true}
        onEditClass={onEditClass}
        onDeleteClass={onDeleteClass}
      >
        <CalendarHeader>
          <CalendarHeaderDate />
          <CalendarHeaderActions>
            <CalendarHeaderActionsMode />
            <CalendarHeaderActionsAdd />
          </CalendarHeaderActions>
        </CalendarHeader>
        <CalendarBody />
        <EventClickInterceptor
          onClassClick={onClassClick}
          onEditClass={onEditClass}
          onDeleteClass={onDeleteClass}
          events={events}
        />
        <AddScheduleInterceptor onAddSchedule={onAddSchedule} />
      </CalendarProvider>
    </div>
  );
}

// Component to intercept event clicks and trigger custom handler
function EventClickInterceptor({
  onClassClick,
  onEditClass,
  onDeleteClass,
  events
}: {
  onClassClick?: (classData: PilatesClass) => void;
  onEditClass?: (classData: PilatesClass) => void;
  onDeleteClass?: (classData: PilatesClass) => void;
  events: (CalendarEvent & { data?: PilatesClass })[];
}) {
  const { selectedEvent, setSelectedEvent } = useCalendarContext();

  useEffect(() => {
    if (selectedEvent && onClassClick) {
      // Find the event with Pilates class data
      const eventWithData = events.find(e => e.id === selectedEvent.id);
      if (eventWithData?.data) {
        // Trigger our custom handler with the class data
        onClassClick(eventWithData.data);
        // Clear the selection to prevent the modal from reopening
        setSelectedEvent(null);
      }
    }
  }, [selectedEvent, onClassClick, events, setSelectedEvent]);

  // We need to pass context menu handlers down through the calendar event components
  // This is handled via props passed to CalendarProvider
  return null;
}

// Component to intercept "Add Schedule" button clicks
function AddScheduleInterceptor({
  onAddSchedule,
}: {
  onAddSchedule?: () => void;
}) {
  const { newEventDialogOpen, setNewEventDialogOpen } = useCalendarContext();

  useEffect(() => {
    if (newEventDialogOpen && onAddSchedule) {
      // Close the calendar's default dialog
      setNewEventDialogOpen(false);
      // Trigger our custom add schedule handler (opens BulkClassSheet)
      onAddSchedule();
    }
  }, [newEventDialogOpen, onAddSchedule, setNewEventDialogOpen]);

  return null;
}
