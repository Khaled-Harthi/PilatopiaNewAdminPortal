'use client';

import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { InstructorClass } from '@/lib/instructor/types';

interface InstructorClassPopoverProps {
  classData: InstructorClass;
  locale: string;
  children: React.ReactNode;
}

export function InstructorClassPopover({
  classData,
  locale,
  children,
}: InstructorClassPopoverProps) {
  const isRTL = locale === 'ar';
  const dateLocale = isRTL ? ar : undefined;

  const scheduleTime = parseISO(classData.schedule_time);
  const endTime = new Date(scheduleTime.getTime() + classData.duration_minutes * 60000);

  const timeRange = `${format(scheduleTime, 'h:mm a', { locale: dateLocale })} - ${format(
    endTime,
    'h:mm a',
    { locale: dateLocale }
  )}`;
  const dateStr = format(scheduleTime, 'EEEE, MMM d', { locale: dateLocale });

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div>
            <h3 className="font-semibold text-lg">{classData.class_type}</h3>
            <p className="text-sm text-muted-foreground">{dateStr}</p>
            <p className="text-sm text-muted-foreground">{timeRange}</p>
            <p className="text-sm text-muted-foreground">{classData.class_room}</p>
          </div>

          <div className="h-px bg-border" />

          {/* Bookings */}
          <div>
            <h4 className="text-sm font-medium mb-2">
              {isRTL ? 'الحجوزات' : 'BOOKINGS'} ({classData.booked_count}/{classData.capacity})
            </h4>
            {classData.clients.length > 0 ? (
              <ScrollArea className="h-[150px]">
                <ul className="space-y-2">
                  {classData.clients.map((client, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                      <span>{client}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'لا توجد حجوزات' : 'No bookings yet'}
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
