'use client';

import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MemberBooking } from '@/lib/members/types';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';

interface UpcomingClassesListProps {
  bookings: MemberBooking[];
  onCancel: (bookingId: string) => void;
}

function formatBookingDate(dateStr: string): string {
  const date = parseISO(dateStr);

  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  }
  if (isTomorrow(date)) {
    return `Tomorrow, ${format(date, 'h:mm a')}`;
  }
  return format(date, 'EEE MMM d, h:mm a');
}

export function UpcomingClassesList({ bookings, onCancel }: UpcomingClassesListProps) {
  // Filter to only upcoming bookings and sort by date ASC (earliest first)
  const upcomingBookings = bookings
    .filter((b) => b.attendance_status === 'upcoming')
    .sort((a, b) => new Date(a.schedule_time).getTime() - new Date(b.schedule_time).getTime());

  if (upcomingBookings.length === 0) {
    return (
      <div className="py-8 text-center">
        <Calendar className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No upcoming classes</p>
        <p className="text-xs text-muted-foreground mt-1">
          Use the "Book Class" button to schedule a class
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {upcomingBookings.map((booking) => (
        <div
          key={booking.id}
          className="flex items-start justify-between py-3 rounded-md hover:bg-accent/50 -mx-2 px-2 transition-colors"
        >
          <div>
            <p className="font-medium text-sm">
              {formatBookingDate(booking.schedule_time)}
            </p>
            <p className="text-sm text-muted-foreground">
              {booking.class_name} · {booking.instructor_name}
              {booking.class_room_name && ` · ${booking.class_room_name}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(booking.id)}
          >
            Cancel
          </Button>
        </div>
      ))}
    </div>
  );
}
