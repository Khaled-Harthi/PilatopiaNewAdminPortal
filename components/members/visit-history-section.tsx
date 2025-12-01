'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { VisitRecord } from '@/lib/members/types';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

interface VisitHistorySectionProps {
  visits: VisitRecord[];
  totalVisits: number;
  onViewAll?: () => void;
}

interface GroupedVisits {
  label: string;
  date: Date;
  visits: VisitRecord[];
}

export function VisitHistorySection({
  visits,
  totalVisits,
  onViewAll,
}: VisitHistorySectionProps) {
  // Group visits by date
  const groupVisitsByDate = (visits: VisitRecord[]): GroupedVisits[] => {
    const groups: Map<string, GroupedVisits> = new Map();

    visits
      .sort((a, b) => new Date(b.schedule_time).getTime() - new Date(a.schedule_time).getTime())
      .forEach((visit) => {
        const date = new Date(visit.schedule_time);
        const dateKey = format(date, 'yyyy-MM-dd');

        if (!groups.has(dateKey)) {
          let label: string;
          if (isToday(date)) {
            label = 'TODAY';
          } else if (isYesterday(date)) {
            label = 'YESTERDAY';
          } else {
            label = format(date, 'MMM d').toUpperCase();
          }

          groups.set(dateKey, {
            label,
            date,
            visits: [],
          });
        }

        groups.get(dateKey)!.visits.push(visit);
      });

    return Array.from(groups.values());
  };

  const groupedVisits = groupVisitsByDate(visits);

  return (
    <Card>
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Visit History</h2>
            {onViewAll && totalVisits > visits.length && (
              <Button variant="ghost" size="sm" onClick={onViewAll}>
                View All
              </Button>
            )}
          </div>

          <Separator />

          {/* Visits List */}
          {visits.length === 0 ? (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">No visit history</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedVisits.map((group, groupIndex) => (
                <div key={group.label}>
                  {groupIndex > 0 && <Separator className="my-4" />}

                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground tracking-wide">
                      {group.label}
                    </p>

                    {group.visits.map((visit) => (
                      <div
                        key={visit.id}
                        className="flex items-center justify-between"
                      >
                        <p className="text-sm">
                          <span className="text-muted-foreground">
                            {format(new Date(visit.schedule_time), 'h:mm a')}
                          </span>
                          <span className="mx-2">·</span>
                          <span>{visit.class_name}</span>
                          <span className="mx-2">·</span>
                          <span className="text-muted-foreground">{visit.instructor_name}</span>
                        </p>

                        <span
                          className={cn(
                            'text-sm',
                            visit.attendance_status === 'attended'
                              ? 'text-green-600'
                              : 'text-red-500'
                          )}
                        >
                          {visit.attendance_status === 'attended' ? 'Attended' : 'No-show'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Show count */}
              {totalVisits > visits.length && (
                <>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground">
                    Showing {visits.length} of {totalVisits} visits
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
