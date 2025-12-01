'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { MemberBooking } from '@/lib/members/types';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';

interface UpcomingClassesSectionProps {
  bookings: MemberBooking[];
  onBook?: () => void;
  onCancel?: (bookingId: string) => void;
}

interface GroupedBookings {
  label: string;
  date: Date;
  bookings: MemberBooking[];
}

export function UpcomingClassesSection({
  bookings,
  onBook,
  onCancel,
}: UpcomingClassesSectionProps) {
  // Group bookings by date
  const groupBookingsByDate = (bookings: MemberBooking[]): GroupedBookings[] => {
    const groups: Map<string, GroupedBookings> = new Map();

    bookings
      .filter((b) => b.attendance_status === 'upcoming')
      .sort((a, b) => new Date(a.schedule_time).getTime() - new Date(b.schedule_time).getTime())
      .forEach((booking) => {
        const date = new Date(booking.schedule_time);
        const dateKey = format(date, 'yyyy-MM-dd');

        if (!groups.has(dateKey)) {
          let label: string;
          if (isToday(date)) {
            label = 'TODAY';
          } else if (isTomorrow(date)) {
            label = 'TOMORROW';
          } else {
            label = format(date, 'EEEE, MMM d').toUpperCase();
          }

          groups.set(dateKey, {
            label,
            date,
            bookings: [],
          });
        }

        groups.get(dateKey)!.bookings.push(booking);
      });

    return Array.from(groups.values());
  };

  const groupedBookings = groupBookingsByDate(bookings);
  const upcomingCount = bookings.filter((b) => b.attendance_status === 'upcoming').length;

  return (
    <Card>
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming Classes</h2>
            {onBook && (
              <Button variant="ghost" size="sm" onClick={onBook}>
                Book
              </Button>
            )}
          </div>

          <Separator />

          {/* Bookings List */}
          {upcomingCount === 0 ? (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">No upcoming classes</p>
              {onBook && (
                <Button variant="outline" size="sm" onClick={onBook} className="mt-3">
                  Book a Class
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {groupedBookings.map((group, groupIndex) => (
                <div key={group.label}>
                  {groupIndex > 0 && <Separator className="mb-6" />}

                  <div className="space-y-4">
                    <p className="text-xs font-medium text-muted-foreground tracking-wide">
                      {group.label}
                    </p>

                    {group.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-start justify-between"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">
                            {format(new Date(booking.schedule_time), 'h:mm a')}
                          </p>
                          <p className="text-sm">{booking.class_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.instructor_name} · {booking.class_room_name}
                          </p>
                        </div>

                        {onCancel && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => onCancel(booking.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
