'use client';

import { useMemo, useState } from 'react';
import { MessageCircle, ExternalLink, Users, ChevronDown, ChevronUp, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { DailyClassDetail } from '@/lib/schedule/types';

interface TodaysClientsSectionProps {
  classes: DailyClassDetail[];
}

interface ClassBooking {
  classTime: string;
  className: string;
  isCheckedIn: boolean;
  isPastGracePeriod: boolean;
}

interface GroupedClient {
  userId: number;
  userName: string;
  phoneNumber: string;
  bookings: ClassBooking[];
  allCheckedIn: boolean;
  hasUncheckedUpcoming: boolean; // Has unchecked class within grace period
  earliestClassTime: string;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function generateWhatsAppLink(phoneNumber: string): string {
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
  return `https://wa.me/${cleanPhone.replace('+', '')}`;
}

export function TodaysClientsSection({ classes }: TodaysClientsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group clients by user, combining multiple bookings
  const groupedClients = useMemo(() => {
    const now = new Date();
    const GRACE_PERIOD_MS = 30 * 60 * 1000; // 30 minutes

    // Map to group bookings by userId
    const clientMap = new Map<number, GroupedClient>();

    classes.forEach((classDetail) => {
      const classStart = new Date(classDetail.class.schedule_time);
      const timeSinceStart = now.getTime() - classStart.getTime();
      const isPastGracePeriod = timeSinceStart >= GRACE_PERIOD_MS;

      classDetail.bookings.forEach((booking) => {
        const existing = clientMap.get(booking.user_id);
        const bookingInfo: ClassBooking = {
          classTime: classDetail.class.schedule_time,
          className: classDetail.class.name || 'Class',
          isCheckedIn: booking.attendance_id !== null,
          isPastGracePeriod,
        };

        if (existing) {
          existing.bookings.push(bookingInfo);
          // Update earliest class time
          if (new Date(bookingInfo.classTime) < new Date(existing.earliestClassTime)) {
            existing.earliestClassTime = bookingInfo.classTime;
          }
        } else {
          clientMap.set(booking.user_id, {
            userId: booking.user_id,
            userName: booking.user_name,
            phoneNumber: booking.phone_number,
            bookings: [bookingInfo],
            allCheckedIn: false, // Will calculate after
            hasUncheckedUpcoming: false, // Will calculate after
            earliestClassTime: bookingInfo.classTime,
          });
        }
      });
    });

    // Calculate derived properties and sort bookings within each client
    const clients = Array.from(clientMap.values()).map((client) => {
      // Sort bookings by time
      client.bookings.sort((a, b) =>
        new Date(a.classTime).getTime() - new Date(b.classTime).getTime()
      );
      client.allCheckedIn = client.bookings.every((b) => b.isCheckedIn);
      client.hasUncheckedUpcoming = client.bookings.some(
        (b) => !b.isCheckedIn && !b.isPastGracePeriod
      );
      return client;
    });

    // Sort: clients with unchecked upcoming first → by earliest class time → alphabetical
    return clients.sort((a, b) => {
      // 1. Clients with unchecked upcoming classes first
      if (a.hasUncheckedUpcoming !== b.hasUncheckedUpcoming) {
        return a.hasUncheckedUpcoming ? -1 : 1;
      }

      // 2. By earliest class time
      const timeDiff =
        new Date(a.earliestClassTime).getTime() - new Date(b.earliestClassTime).getTime();
      if (timeDiff !== 0) return timeDiff;

      // 3. Unchecked clients first
      if (a.allCheckedIn !== b.allCheckedIn) {
        return a.allCheckedIn ? 1 : -1;
      }

      // 4. Alphabetical by name
      return a.userName.localeCompare(b.userName);
    });
  }, [classes]);

  const displayLimit = 5;
  const hasMore = groupedClients.length > displayLimit;
  const displayedClients = isExpanded ? groupedClients : groupedClients.slice(0, displayLimit);
  const remainingCount = groupedClients.length - displayLimit;

  if (groupedClients.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Today's Clients</span>
        </div>
        <div className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
          No bookings yet
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">Today's Clients</span>
        <span className="text-xs text-muted-foreground">
          ({groupedClients.length})
        </span>
      </div>

      {/* Client List */}
      <div className="space-y-1">
        {displayedClients.map((client) => (
          <div
            key={client.userId}
            className={`flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors ${
              client.allCheckedIn ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-xs text-muted-foreground shrink-0 min-w-16">
                {client.bookings.map((booking, idx) => (
                  <span key={idx} className="flex items-center gap-0.5">
                    {booking.isCheckedIn && (
                      <Check className="h-2.5 w-2.5 text-green-600 inline" />
                    )}
                    {formatTime(booking.classTime)}
                  </span>
                ))}
              </div>
              <Link
                href={`/members/${client.userId}`}
                className="text-sm truncate hover:underline flex items-center gap-1"
              >
                {client.userName}
                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
              </Link>
            </div>
            {!client.allCheckedIn && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 shrink-0"
                asChild
              >
                <a
                  href={generateWhatsAppLink(client.phoneNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
          </div>
        ))}

        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                +{remainingCount} more
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
