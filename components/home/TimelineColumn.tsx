'use client';

import { TimelineClassRow } from './TimelineClassRow';
import type { DailyClassDetail } from '@/lib/schedule/types';

interface TimelineColumnProps {
  completedClasses: DailyClassDetail[];
  inProgressClasses: DailyClassDetail[];
  upcomingClasses: DailyClassDetail[];
  isToday: boolean;
}

function getCurrentTimeFormatted(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function TimelineColumn({
  completedClasses,
  inProgressClasses,
  upcomingClasses,
  isToday,
}: TimelineColumnProps) {
  const hasCompletedClasses = completedClasses.length > 0;
  const hasInProgressClasses = inProgressClasses.length > 0;
  const hasUpcomingClasses = upcomingClasses.length > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium uppercase text-muted-foreground">
          Timeline
        </h2>
        {isToday && (
          <span className="text-xs text-muted-foreground">
            Now: {getCurrentTimeFormatted()}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {/* Completed Classes */}
        {hasCompletedClasses && (
          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium mb-2 flex items-center gap-2">
              <span>Completed</span>
              <span className="text-muted-foreground/60">({completedClasses.length})</span>
            </div>
            <div className="space-y-2">
              {completedClasses.map((classDetail) => (
                <TimelineClassRow
                  key={classDetail.class.id}
                  classDetail={classDetail}
                  status="completed"
                />
              ))}
            </div>
          </div>
        )}

        {/* NOW Indicator */}
        {isToday && (hasCompletedClasses || hasInProgressClasses) && hasUpcomingClasses && (
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-foreground/20" />
            <span className="text-xs font-medium text-foreground/60 uppercase">
              Now
            </span>
            <div className="flex-1 h-px bg-foreground/20" />
          </div>
        )}

        {/* In Progress Classes */}
        {hasInProgressClasses && (
          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>In Progress</span>
            </div>
            <div className="space-y-2">
              {inProgressClasses.map((classDetail) => (
                <TimelineClassRow
                  key={classDetail.class.id}
                  classDetail={classDetail}
                  status="in_progress"
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Classes */}
        {hasUpcomingClasses && (
          <div>
            <div className="text-xs text-muted-foreground uppercase font-medium mb-2 flex items-center gap-2">
              <span>Coming Up</span>
              <span className="text-muted-foreground/60">({upcomingClasses.length})</span>
            </div>
            <div className="space-y-2">
              {upcomingClasses.map((classDetail) => (
                <TimelineClassRow
                  key={classDetail.class.id}
                  classDetail={classDetail}
                  status="upcoming"
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasCompletedClasses && !hasInProgressClasses && !hasUpcomingClasses && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No classes scheduled
          </div>
        )}
      </div>
    </div>
  );
}
