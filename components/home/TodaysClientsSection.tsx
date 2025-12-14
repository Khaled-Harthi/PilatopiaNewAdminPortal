'use client';

import { useMemo, useState } from 'react';
import { MessageCircle, ExternalLink, Users, ChevronDown, ChevronUp, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { DailyClassDetail } from '@/lib/schedule/types';

interface TodaysClientsSectionProps {
  classes: DailyClassDetail[];
}

interface ClientWithTime {
  userId: number;
  userName: string;
  phoneNumber: string;
  classTime: string;
  className: string;
  isCheckedIn: boolean;
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

  // Get clients sorted by: relevance → class time → unchecked first → alphabetical
  // Classes past 30-min grace period go to the bottom
  const clientsWithTime = useMemo(() => {
    const now = new Date();
    const GRACE_PERIOD_MS = 30 * 60 * 1000; // 30 minutes

    // Sort classes by time
    const sortedClasses = [...classes].sort((a, b) =>
      new Date(a.class.schedule_time).getTime() - new Date(b.class.schedule_time).getTime()
    );

    // Collect all clients with grace period info
    const allClients: (ClientWithTime & { isPastGracePeriod: boolean })[] = [];

    sortedClasses.forEach((classDetail) => {
      const classStart = new Date(classDetail.class.schedule_time);
      const timeSinceStart = now.getTime() - classStart.getTime();
      const isPastGracePeriod = timeSinceStart >= GRACE_PERIOD_MS;

      classDetail.bookings.forEach((booking) => {
        allClients.push({
          userId: booking.user_id,
          userName: booking.user_name,
          phoneNumber: booking.phone_number,
          classTime: classDetail.class.schedule_time,
          className: classDetail.class.name || 'Class',
          isCheckedIn: booking.attendance_id !== null,
          isPastGracePeriod,
        });
      });
    });

    // Sort: past grace period last → class time → unchecked first → alphabetical
    return allClients.sort((a, b) => {
      // 1. Classes past grace period go to bottom
      if (a.isPastGracePeriod !== b.isPastGracePeriod) {
        return a.isPastGracePeriod ? 1 : -1;
      }

      // 2. By class time (earlier first)
      const timeDiff = new Date(a.classTime).getTime() - new Date(b.classTime).getTime();
      if (timeDiff !== 0) return timeDiff;

      // 3. Unchecked clients first
      if (a.isCheckedIn !== b.isCheckedIn) {
        return a.isCheckedIn ? 1 : -1;
      }

      // 4. Alphabetical by name
      return a.userName.localeCompare(b.userName);
    });
  }, [classes]);

  const displayLimit = 5;
  const hasMore = clientsWithTime.length > displayLimit;
  const displayedClients = isExpanded ? clientsWithTime : clientsWithTime.slice(0, displayLimit);
  const remainingCount = clientsWithTime.length - displayLimit;

  if (clientsWithTime.length === 0) {
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
          ({clientsWithTime.length})
        </span>
      </div>

      {/* Client List */}
      <div className="space-y-1">
        {displayedClients.map((client, index) => (
          <div
            key={`${client.userId}-${client.classTime}-${index}`}
            className={`flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors ${
              client.isCheckedIn ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-muted-foreground w-16 shrink-0">
                {formatTime(client.classTime)}
              </span>
              {client.isCheckedIn && (
                <Check className="h-3 w-3 text-green-600 shrink-0" />
              )}
              <Link
                href={`/members/${client.userId}`}
                className="text-sm truncate hover:underline flex items-center gap-1"
              >
                {client.userName}
                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
              </Link>
            </div>
            {!client.isCheckedIn && (
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
