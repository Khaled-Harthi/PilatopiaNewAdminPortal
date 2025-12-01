'use client';

import { cn } from '@/lib/utils';
import type { VisitRecord } from '@/lib/members/types';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

interface PastClassesListProps {
  visits: VisitRecord[];
  totalVisits: number;
}

function formatShortDate(dateStr: string): string {
  const date = parseISO(dateStr);

  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, h:mm a');
}

export function PastClassesList({ visits, totalVisits }: PastClassesListProps) {
  // Show only first 5 visits
  const displayVisits = visits.slice(0, 5);

  if (displayVisits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No past classes</p>
    );
  }

  return (
    <div>
      <div className="space-y-3 md:space-y-0">
        {displayVisits.map((visit) => (
          <div key={visit.id} className="text-sm md:flex md:items-center md:justify-between md:py-2">
            {/* Date - separate line on mobile, inline on desktop */}
            <p className="text-xs text-muted-foreground mb-0.5 md:mb-0 md:w-32 md:shrink-0">
              {formatShortDate(visit.schedule_time)}
            </p>
            {/* Class info + status */}
            <div className="flex items-center justify-between md:flex-1">
              <span className="text-muted-foreground">
                {visit.class_name} · {visit.instructor_name}
              </span>
              <span
                className={cn(
                  'text-xs',
                  visit.attendance_status === 'attended'
                    ? 'text-green-600'
                    : 'text-muted-foreground'
                )}
              >
                {visit.attendance_status === 'attended' ? 'Attended' : 'No-show'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {totalVisits > 5 && (
        <p className="text-xs text-muted-foreground mt-2">
          Showing 5 of {totalVisits}
        </p>
      )}
    </div>
  );
}
