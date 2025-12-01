'use client';

import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { TimelineItem } from './TimelineItem';
import { ClassDetailPopover } from './ClassDetailPopover';
import type { DailyClassDetail } from '@/lib/schedule/types';

type ClassStatus = 'completed' | 'in_progress' | 'upcoming';

interface TimelineSectionProps {
  upcomingClasses: DailyClassDetail[];
  inProgressClasses: DailyClassDetail[];
  completedClasses: DailyClassDetail[];
  onClassUpdate?: () => void;
}

export function TimelineSection({
  upcomingClasses,
  inProgressClasses,
  completedClasses,
  onClassUpdate,
}: TimelineSectionProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

  // Combine in_progress and upcoming for the main timeline
  const activeClasses: { detail: DailyClassDetail; status: ClassStatus }[] = [
    ...inProgressClasses.map((c) => ({ detail: c, status: 'in_progress' as const })),
    ...upcomingClasses.map((c) => ({ detail: c, status: 'upcoming' as const })),
  ];

  const hasActiveClasses = activeClasses.length > 0;
  const hasCompletedClasses = completedClasses.length > 0;

  if (!hasActiveClasses && !hasCompletedClasses) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Active Classes Timeline */}
      {hasActiveClasses && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">
              {inProgressClasses.length > 0 ? 'Now & Coming Up' : 'Coming Up'}
            </span>
            <span className="text-xs text-muted-foreground">({activeClasses.length})</span>
          </div>

          <div className="relative">
            {activeClasses.map((item, index) => (
              <ClassDetailPopover
                key={item.detail.class.id}
                open={openPopoverId === item.detail.class.id}
                onOpenChange={(open) => setOpenPopoverId(open ? item.detail.class.id : null)}
                classDetail={item.detail}
                onUpdate={onClassUpdate}
              >
                <TimelineItem
                  classDetail={item.detail}
                  status={item.status}
                  isLast={index === activeClasses.length - 1 && !hasCompletedClasses}
                />
              </ClassDetailPopover>
            ))}
          </div>
        </div>
      )}

      {/* Completed Classes (Collapsed by default) */}
      {hasCompletedClasses && (
        <div className="bg-muted/30 rounded-lg overflow-hidden">
          <button
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm text-muted-foreground">Earlier Today</span>
              <span className="text-xs text-muted-foreground">({completedClasses.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {!showCompleted && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {completedClasses
                    .slice(0, 2)
                    .map((c) => c.class.name)
                    .join(' · ')}
                  {completedClasses.length > 2 && ' ...'}
                </span>
              )}
              {showCompleted ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {showCompleted && (
            <div className="px-4 pb-4">
              {completedClasses.map((classDetail, index) => (
                <ClassDetailPopover
                  key={classDetail.class.id}
                  open={openPopoverId === classDetail.class.id}
                  onOpenChange={(open) => setOpenPopoverId(open ? classDetail.class.id : null)}
                  classDetail={classDetail}
                  onUpdate={onClassUpdate}
                >
                  <TimelineItem
                    classDetail={classDetail}
                    status="completed"
                    isLast={index === completedClasses.length - 1}
                  />
                </ClassDetailPopover>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
