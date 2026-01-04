'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAttendanceHeatmap } from '@/lib/business/hooks';
import { DateRange, getDayName, formatHour, getHeatmapIntensity } from '@/lib/business/types';
import { cn } from '@/lib/utils';

interface AttendanceHeatmapProps {
  dateRange: DateRange;
  isAr: boolean;
}

const DAYS = [0, 1, 2, 3, 4, 5, 6]; // Sun-Sat
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

const DAY_NAMES_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function AttendanceHeatmap({ dateRange, isAr }: AttendanceHeatmapProps) {
  const { data, isLoading } = useAttendanceHeatmap(dateRange);

  // Build a map for quick lookup
  const heatmapMap = new Map<string, number>();
  let maxCount = 0;

  data?.heatmap?.forEach((cell) => {
    const key = `${cell.day_of_week}-${cell.hour_of_day}`;
    const count = parseInt(String(cell.attendance_count)) || 0;
    heatmapMap.set(key, count);
    if (count > maxCount) maxCount = count;
  });

  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 0:
        return 'bg-muted';
      case 1:
        return 'bg-green-100 dark:bg-green-950';
      case 2:
        return 'bg-green-300 dark:bg-green-800';
      case 3:
        return 'bg-green-500 dark:bg-green-600';
      case 4:
        return 'bg-green-700 dark:bg-green-400';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium">
            {isAr ? 'أنماط الحضور' : 'Attendance Patterns'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'متى يحضر الأعضاء للصفوف' : 'When members attend classes'}
          </p>
        </div>
        {data?.peak_times && data.peak_times.length > 0 && (
          <div className="text-sm text-right">
            <span className="text-muted-foreground">{isAr ? 'الذروة:' : 'Peak:'} </span>
            <span className="font-medium">
              {data.peak_times[0].day} {data.peak_times[0].hour} ({data.peak_times[0].count})
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-[300px] w-full" />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hours header */}
            <div className="flex">
              <div className="w-16 shrink-0" /> {/* Day label column */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-xs text-muted-foreground text-center pb-2"
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {DAYS.map((day) => (
              <div key={day} className="flex items-center">
                <div className="w-16 shrink-0 text-xs text-muted-foreground pr-2 py-1">
                  {isAr ? DAY_NAMES_AR[day] : getDayName(day)}
                </div>
                {HOURS.map((hour) => {
                  const key = `${day}-${hour}`;
                  const count = heatmapMap.get(key) || 0;
                  const intensity = getHeatmapIntensity(count, maxCount);

                  return (
                    <div
                      key={hour}
                      className="flex-1 aspect-square m-0.5 relative group"
                    >
                      <div
                        className={cn(
                          'w-full h-full rounded-sm transition-colors',
                          getIntensityClass(intensity)
                        )}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border rounded-md shadow-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="font-medium">
                          {isAr ? DAY_NAMES_AR[day] : getDayName(day)} {formatHour(hour)}
                        </div>
                        <div className="text-muted-foreground">
                          {count} {isAr ? 'حضور' : 'attended'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-end gap-4 mt-4 text-xs text-muted-foreground">
              <span>{isAr ? 'أقل' : 'Less'}</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((intensity) => (
                  <div
                    key={intensity}
                    className={cn('w-4 h-4 rounded-sm', getIntensityClass(intensity))}
                  />
                ))}
              </div>
              <span>{isAr ? 'أكثر' : 'More'}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
