'use client';

import { useState, useMemo } from 'react';
import { useDailyDetailed } from '@/lib/schedule/hooks';
import { DashboardHeader } from './DashboardHeader';
import { TimelineSection } from './TimelineSection';
import { WaitlistSection } from './WaitlistSection';
import { TodaysClientsSection } from './TodaysClientsSection';
import { InstructorStatsSection } from './InstructorStatsSection';
import { QuickActionsSection } from './QuickActionsSection';
import type { DailyClassDetail } from '@/lib/schedule/types';

// Helper to format date as YYYY-MM-DD
function formatDateParam(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper to add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Helper to check if a class is in the past, current, or future
function getClassStatus(scheduleTime: string, durationMinutes: number): 'completed' | 'in_progress' | 'upcoming' {
  const now = new Date();
  const classStart = new Date(scheduleTime);
  const classEnd = new Date(classStart.getTime() + durationMinutes * 60 * 1000);

  if (now >= classEnd) return 'completed';
  if (now >= classStart && now < classEnd) return 'in_progress';
  return 'upcoming';
}

export function DailyDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calculate dates for 3-day waitlist view
  const todayDate = formatDateParam(selectedDate);
  const tomorrowDate = formatDateParam(addDays(selectedDate, 1));
  const dayAfterDate = formatDateParam(addDays(selectedDate, 2));

  // Fetch data for today (main view) + tomorrow + day after (for waitlist)
  const todayQuery = useDailyDetailed(todayDate);
  const tomorrowQuery = useDailyDetailed(tomorrowDate);
  const dayAfterQuery = useDailyDetailed(dayAfterDate);

  // Group today's classes by status
  const groupedClasses = useMemo(() => {
    if (!todayQuery.data?.classes) return { completed: [], in_progress: [], upcoming: [] };

    const groups: Record<'completed' | 'in_progress' | 'upcoming', DailyClassDetail[]> = {
      completed: [],
      in_progress: [],
      upcoming: [],
    };

    todayQuery.data.classes.forEach((classDetail) => {
      const status = getClassStatus(
        classDetail.class.schedule_time,
        classDetail.class.duration_minutes
      );
      groups[status].push(classDetail);
    });

    return groups;
  }, [todayQuery.data?.classes]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = formatDateParam(selectedDate) === formatDateParam(new Date());

  const isLoading = todayQuery.isLoading;
  const error = todayQuery.error;

  // Check if there's any waitlist across 3 days
  const hasWaitlist = useMemo(() => {
    const todayWaitlist = todayQuery.data?.classes?.some(c => c.waitlist.length > 0) || false;
    const tomorrowWaitlist = tomorrowQuery.data?.classes?.some(c => c.waitlist.length > 0) || false;
    const dayAfterWaitlist = dayAfterQuery.data?.classes?.some(c => c.waitlist.length > 0) || false;
    return todayWaitlist || tomorrowWaitlist || dayAfterWaitlist;
  }, [todayQuery.data?.classes, tomorrowQuery.data?.classes, dayAfterQuery.data?.classes]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <DashboardHeader
        selectedDate={selectedDate}
        onNavigate={navigateDate}
        onToday={goToToday}
        isToday={isToday}
      />

      {/* Main Content - 2-Column Layout */}
      <div className="flex-1 px-2 sm:px-6 py-3 sm:py-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-destructive">Failed to load data. Please try again.</div>
          </div>
        ) : !todayQuery.data?.classes?.length ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">No classes scheduled for this date.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Column 1: Class Timeline (first on both mobile and desktop) */}
            <div className="order-1">
              <TimelineSection
                upcomingClasses={groupedClasses.upcoming}
                inProgressClasses={groupedClasses.in_progress}
                completedClasses={groupedClasses.completed}
                onClassUpdate={() => todayQuery.refetch()}
              />
            </div>

            {/* Column 2: Waitlist, Instructors, Today's Clients (second on both mobile and desktop) */}
            <div className="order-2">
              <div className="space-y-6">
                {hasWaitlist && (
                  <WaitlistSection
                    todayClasses={todayQuery.data?.classes || []}
                    tomorrowClasses={tomorrowQuery.data?.classes || []}
                    dayAfterClasses={dayAfterQuery.data?.classes || []}
                    todayDate={todayDate}
                    tomorrowDate={tomorrowDate}
                    dayAfterDate={dayAfterDate}
                  />
                )}
                <InstructorStatsSection classes={todayQuery.data?.classes || []} />
                <TodaysClientsSection classes={todayQuery.data?.classes || []} />
                <QuickActionsSection />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
