'use client';

import { useMemo } from 'react';
import { User } from 'lucide-react';
import type { DailyClassDetail } from '@/lib/schedule/types';

interface InstructorStatsSectionProps {
  classes: DailyClassDetail[];
}

interface InstructorStat {
  instructorId: number;
  instructorName: string;
  classCount: number;
  clientCount: number;
}

export function InstructorStatsSection({ classes }: InstructorStatsSectionProps) {
  const instructorStats = useMemo(() => {
    const statsMap = new Map<number, InstructorStat>();

    classes.forEach((classDetail) => {
      const { instructor_id, instructor } = classDetail.class;
      const clientCount = classDetail.stats.total_booked;

      if (statsMap.has(instructor_id)) {
        const existing = statsMap.get(instructor_id)!;
        existing.classCount += 1;
        existing.clientCount += clientCount;
      } else {
        statsMap.set(instructor_id, {
          instructorId: instructor_id,
          instructorName: instructor,
          classCount: 1,
          clientCount: clientCount,
        });
      }
    });

    // Sort by class count descending
    return Array.from(statsMap.values()).sort((a, b) => b.classCount - a.classCount);
  }, [classes]);

  if (instructorStats.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">Instructors</span>
      </div>

      {/* Instructor Cards */}
      <div className="space-y-2">
        {instructorStats.map((stat) => (
          <div
            key={stat.instructorId}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
          >
            <span className="text-sm font-medium">{stat.instructorName}</span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{stat.classCount} classes</span>
              <span>·</span>
              <span>{stat.clientCount} clients</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
