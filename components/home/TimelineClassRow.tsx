'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCheckInMember } from '@/lib/schedule/hooks';
import type { DailyClassDetail } from '@/lib/schedule/types';
import Link from 'next/link';

interface TimelineClassRowProps {
  classDetail: DailyClassDetail;
  status: 'completed' | 'in_progress' | 'upcoming';
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function CapacityBar({ booked, capacity }: { booked: number; capacity: number }) {
  const percentage = Math.min((booked / capacity) * 100, 100);
  const isFull = booked >= capacity;

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all bg-foreground"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-xs ${isFull ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
        {booked}/{capacity}
      </span>
    </div>
  );
}

function AttendeesDots({ bookings, maxDots = 8 }: { bookings: DailyClassDetail['bookings']; maxDots?: number }) {
  const displayBookings = bookings.slice(0, maxDots);
  const remaining = bookings.length - maxDots;

  return (
    <div className="flex items-center gap-0.5">
      {displayBookings.map((booking) => (
        <span
          key={booking.booking_id}
          className={`h-2 w-2 rounded-full ${
            booking.attendance_id ? 'bg-foreground' : 'bg-muted-foreground/40'
          }`}
          title={`${booking.user_name} - ${booking.attendance_id ? 'Checked in' : 'Pending'}`}
        />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground ml-1">+{remaining}</span>
      )}
    </div>
  );
}

export function TimelineClassRow({ classDetail, status }: TimelineClassRowProps) {
  const [isExpanded, setIsExpanded] = useState(status === 'in_progress');
  const checkInMutation = useCheckInMember();

  const { class: classInfo, stats, bookings, waitlist } = classDetail;
  const isFull = stats.total_booked >= classInfo.capacity;
  const hasWaitlist = waitlist.length > 0;

  const handleCheckIn = async (userId: number) => {
    try {
      await checkInMutation.mutateAsync({
        classId: classInfo.id,
        userId,
      });
    } catch (error) {
      console.error('Failed to check in:', error);
    }
  };

  return (
    <div
      className={`rounded-lg transition-colors ${
        status === 'in_progress'
          ? 'bg-accent/50'
          : status === 'completed'
          ? 'opacity-60'
          : ''
      }`}
    >
      {/* Main Row */}
      <button
        className="w-full text-left p-3 flex items-start justify-between gap-2 sm:gap-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Time */}
          <div className="w-14 sm:w-16 shrink-0">
            <span className={`text-xs sm:text-sm font-medium ${status === 'completed' ? 'text-muted-foreground' : ''}`}>
              {formatTime(classInfo.schedule_time)}
            </span>
          </div>

          {/* Class Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{classInfo.name || 'Class'}</span>
              {status === 'completed' && (
                <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
              {status === 'in_progress' && (
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {classInfo.instructor} · {classInfo.class_room_name}
            </div>

            {/* Attendees Dots */}
            {bookings.length > 0 && (
              <div className="mt-2">
                <AttendeesDots bookings={bookings} />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Capacity + Expand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="text-right">
            <CapacityBar booked={stats.total_booked} capacity={classInfo.capacity} />
            {hasWaitlist && (
              <span className="text-xs text-muted-foreground mt-0.5 block">
                {waitlist.length} waitlist
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-border/50 pt-3 space-y-3">
          {/* Attendees List */}
          {bookings.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground uppercase font-medium mb-2">
                Attendees ({stats.checked_in}/{stats.total_booked})
              </div>
              <div className="space-y-1">
                {bookings.map((booking) => (
                  <div
                    key={booking.booking_id}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          booking.attendance_id ? 'bg-foreground' : 'bg-muted-foreground/40'
                        }`}
                      />
                      <Link
                        href={`/members/${booking.user_id}`}
                        className="text-sm truncate hover:underline"
                      >
                        {booking.user_name}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {booking.attendance_id ? (
                        <span className="text-xs text-muted-foreground">
                          {booking.check_in_time
                            ? formatTime(booking.check_in_time)
                            : 'Checked in'}
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckIn(booking.user_id);
                          }}
                          disabled={checkInMutation.isPending}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Check In
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Waitlist */}
          {waitlist.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground uppercase font-medium mb-2">
                Waitlist ({waitlist.length})
              </div>
              <div className="space-y-1">
                {waitlist.map((member) => (
                  <div
                    key={member.member_id}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 shrink-0" />
                      <Link
                        href={`/members/${member.member_id}`}
                        className="text-sm truncate hover:underline"
                      >
                        {member.member_name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        #{member.position}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {bookings.length === 0 && waitlist.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-2">
              No bookings yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
