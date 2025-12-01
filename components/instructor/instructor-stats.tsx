'use client';

import type { InstructorWeekSummary } from '@/lib/instructor/types';

interface InstructorStatsProps {
  summary: InstructorWeekSummary;
  locale: string;
}

export function InstructorStats({ summary, locale }: InstructorStatsProps) {
  const isRTL = locale === 'ar';

  return (
    <div className="bg-muted/50 rounded-lg px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-center gap-4 sm:gap-8 text-sm">
        <div className="text-center">
          <span className="font-semibold text-base sm:text-lg">{summary.totalClasses}</span>
          <span className="text-muted-foreground ml-1 sm:ml-2 text-xs sm:text-sm">
            {isRTL ? 'حصص' : 'Classes'}
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="text-center">
          <span className="font-semibold text-base sm:text-lg">{summary.totalBooked}</span>
          <span className="text-muted-foreground ml-1 sm:ml-2 text-xs sm:text-sm">
            {isRTL ? 'محجوز' : 'Booked'}
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="text-center">
          <span className="font-semibold text-base sm:text-lg">{summary.fillRate}%</span>
          <span className="text-muted-foreground ml-1 sm:ml-2 text-xs sm:text-sm hidden sm:inline">
            {isRTL ? 'نسبة الامتلاء' : 'Fill Rate'}
          </span>
          <span className="text-muted-foreground ml-1 text-xs sm:hidden">
            {isRTL ? 'امتلاء' : 'Fill'}
          </span>
        </div>
      </div>
    </div>
  );
}
