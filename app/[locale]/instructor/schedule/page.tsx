'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { parseISO, startOfWeek, addDays } from 'date-fns';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { InstructorHeader } from '@/components/instructor/instructor-header';
import { useAuth } from '@/hooks/useAuth';
import { InstructorWeekNav } from '@/components/instructor/instructor-week-nav';
import { InstructorStats } from '@/components/instructor/instructor-stats';
import { InstructorScheduleGrid } from '@/components/instructor/instructor-schedule-grid';
import { InstructorMobileList } from '@/components/instructor/instructor-mobile-list';
import { useInstructorSchedule, calculateWeekSummary } from '@/lib/instructor/hooks';

export default function InstructorSchedulePage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { admin } = useAuth();

  // Fetch schedule data
  const { data, isLoading, error } = useInstructorSchedule();

  // Parse week start/end from API response
  const weekDates = useMemo(() => {
    if (!data?.data) {
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      return {
        start: weekStart,
        end: addDays(weekStart, 6),
      };
    }

    return {
      start: parseISO(data.data.start_date),
      end: parseISO(data.data.end_date),
    };
  }, [data]);

  // Calculate stats
  const summary = useMemo(() => calculateWeekSummary(data), [data]);

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex flex-col">
          <InstructorHeader locale={locale} />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">
              {isRTL ? 'جاري التحميل...' : 'Loading schedule...'}
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex flex-col">
          <InstructorHeader locale={locale} />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-destructive">
              {isRTL ? 'حدث خطأ في تحميل الجدول' : 'Failed to load schedule'}
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <InstructorHeader locale={locale} />

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-semibold">
            {isRTL ? `جدول ${admin?.name || ''}` : `${admin?.name || ''}'s Schedule`}
          </h1>

          {/* Week Period */}
          <InstructorWeekNav
            weekStart={weekDates.start}
            weekEnd={weekDates.end}
            locale={locale}
          />

          {/* Stats Summary */}
          <InstructorStats summary={summary} locale={locale} />

          {/* Desktop: Schedule Grid */}
          <div className="hidden md:block flex-1">
            <InstructorScheduleGrid
              classes={data?.data?.classes || []}
              weekStart={weekDates.start}
              locale={locale}
            />
          </div>

          {/* Mobile: List View */}
          <div className="md:hidden flex-1 overflow-auto">
            <InstructorMobileList
              classes={data?.data?.classes || []}
              weekStart={weekDates.start}
              locale={locale}
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
