'use client';

import { forwardRef } from 'react';
import { Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { DailyClassDetail } from '@/lib/schedule/types';

type TimelineStatus = 'completed' | 'in_progress' | 'upcoming';

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  classDetail: DailyClassDetail;
  status: TimelineStatus;
  isLast?: boolean;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function CapacityDots({ booked, capacity }: { booked: number; capacity: number }) {
  const dots = [];
  for (let i = 0; i < capacity; i++) {
    const isFilled = i < booked;
    dots.push(
      <Tooltip key={i}>
        <TooltipTrigger asChild>
          <div
            className={`h-2 w-2 rounded-full transition-colors ${
              isFilled ? 'bg-foreground' : 'bg-muted-foreground/30'
            }`}
          />
        </TooltipTrigger>
        <TooltipContent>
          {isFilled ? 'Booked' : 'Available'}
        </TooltipContent>
      </Tooltip>
    );
  }
  return <div className="flex gap-0.5 flex-wrap">{dots}</div>;
}

function StatusMarker({ status }: { status: TimelineStatus }) {
  if (status === 'completed') {
    return (
      <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
        <Check className="h-3 w-3 text-green-600" />
      </div>
    );
  }

  if (status === 'in_progress') {
    return (
      <div className="relative h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500/30 opacity-50" />
        <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500/50" />
      </div>
    );
  }

  // Upcoming - simple muted dot
  return (
    <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
  );
}

export const TimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(
  function TimelineItem({ classDetail, status, isLast, className, ...props }, ref) {
    const { class: classInfo, stats, waitlist } = classDetail;
    const isCompleted = status === 'completed';

    return (
      <div
        ref={ref}
        className={`flex gap-3 cursor-pointer group ${isCompleted ? 'opacity-60' : ''} ${className || ''}`}
        {...props}
      >
      {/* Timeline Line & Marker */}
      <div className="flex flex-col items-center pt-1">
        <StatusMarker status={status} />
        {!isLast && (
          <div className="w-0.5 flex-1 bg-border mt-1" />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-4`}>
        <div className="p-3 rounded-lg bg-card border group-hover:border-foreground/20 transition-colors">
          {/* Time & Class Name */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {formatTime(classInfo.schedule_time)}
            </span>
            <span className="text-sm">{classInfo.name}</span>
          </div>

          {/* Capacity - dots show fill status visually */}
          <div className="flex items-center gap-2 mb-1">
            {classInfo.capacity <= 10 ? (
              <CapacityDots booked={stats.total_booked} capacity={classInfo.capacity} />
            ) : (
              <span className="text-xs text-muted-foreground">
                {stats.total_booked}/{classInfo.capacity}
              </span>
            )}
            {waitlist.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {waitlist.length} waiting
              </span>
            )}
          </div>

          {/* Instructor & Room */}
          <div className="text-xs text-muted-foreground">
            {classInfo.instructor} · {classInfo.class_room_name}
          </div>

          {/* Checked in count for completed */}
          {isCompleted && (
            <div className="text-xs text-green-600 mt-1">
              {stats.checked_in}/{stats.total_booked} attended
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
