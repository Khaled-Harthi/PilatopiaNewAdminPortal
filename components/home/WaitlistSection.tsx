'use client';

import { useState, useMemo, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { WaitlistClassCard } from './WaitlistClassCard';
import { usePromoteFromWaitlist } from '@/lib/schedule/hooks';
import type { DailyClassDetail } from '@/lib/schedule/types';

interface WaitlistSectionProps {
  todayClasses: DailyClassDetail[];
  tomorrowClasses: DailyClassDetail[];
  dayAfterClasses: DailyClassDetail[];
  todayDate: string;
  tomorrowDate: string;
  dayAfterDate: string;
}

function formatDayName(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function formatShortDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Filter classes that have waitlist entries
function getClassesWithWaitlist(classes: DailyClassDetail[]): DailyClassDetail[] {
  return classes.filter((c) => c.waitlist.length > 0);
}

// Count total people in waitlist across all classes
function countTotalWaitlist(classes: DailyClassDetail[]): number {
  return classes.reduce((total, c) => total + c.waitlist.length, 0);
}

export function WaitlistSection({
  todayClasses,
  tomorrowClasses,
  dayAfterClasses,
  todayDate,
  tomorrowDate,
  dayAfterDate,
}: WaitlistSectionProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'dayAfter'>('today');
  const promoteMutation = usePromoteFromWaitlist();

  // Get classes with waitlist for each day
  const todayWithWaitlist = useMemo(() => getClassesWithWaitlist(todayClasses), [todayClasses]);
  const tomorrowWithWaitlist = useMemo(() => getClassesWithWaitlist(tomorrowClasses), [tomorrowClasses]);
  const dayAfterWithWaitlist = useMemo(() => getClassesWithWaitlist(dayAfterClasses), [dayAfterClasses]);

  // Count totals
  const todayPeopleCount = countTotalWaitlist(todayClasses);
  const tomorrowPeopleCount = countTotalWaitlist(tomorrowClasses);
  const dayAfterPeopleCount = countTotalWaitlist(dayAfterClasses);
  const totalPeopleCount = todayPeopleCount + tomorrowPeopleCount + dayAfterPeopleCount;

  // Count classes
  const totalClassesCount = todayWithWaitlist.length + tomorrowWithWaitlist.length + dayAfterWithWaitlist.length;

  // If no waitlist across all 3 days, don't render anything
  if (totalPeopleCount === 0) {
    return null;
  }

  const allTabs = [
    {
      id: 'today' as const,
      label: 'Today',
      classCount: todayWithWaitlist.length,
      date: todayDate,
    },
    {
      id: 'tomorrow' as const,
      label: 'Tomorrow',
      classCount: tomorrowWithWaitlist.length,
      date: tomorrowDate,
    },
    {
      id: 'dayAfter' as const,
      label: formatDayName(dayAfterDate),
      classCount: dayAfterWithWaitlist.length,
      date: dayAfterDate,
    },
  ];

  // Only show tabs that have waitlist entries
  const tabs = allTabs.filter((tab) => tab.classCount > 0);

  // Ensure activeTab is valid (switch to first available tab if current has no waitlist)
  useEffect(() => {
    const isActiveTabValid = tabs.some((tab) => tab.id === activeTab);
    if (!isActiveTabValid && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const currentClasses =
    activeTab === 'today' ? todayWithWaitlist :
    activeTab === 'tomorrow' ? tomorrowWithWaitlist :
    dayAfterWithWaitlist;

  const currentDate =
    activeTab === 'today' ? todayDate :
    activeTab === 'tomorrow' ? tomorrowDate :
    dayAfterDate;

  const handlePromote = async (classId: number, memberId: number) => {
    try {
      await promoteMutation.mutateAsync({ classId, memberId });
    } catch (error) {
      console.error('Failed to promote:', error);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600/70" />
        <span className="font-medium text-sm">Waitlist</span>
        <span className="text-xs text-muted-foreground">
          ({totalPeopleCount} people in {totalClassesCount} classes)
        </span>
      </div>

      {/* Tabs - showing class count */}
      <div className="flex gap-1 bg-muted p-1 rounded-md w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label} ({tab.classCount})
          </button>
        ))}
      </div>

      {/* Waitlist Class Cards */}
      {currentClasses.length > 0 ? (
        <div className="space-y-2">
          {currentClasses.map((classDetail) => (
            <WaitlistClassCard
              key={classDetail.class.id}
              classDetail={classDetail}
              date={formatShortDate(currentDate)}
              dayName={formatDayName(currentDate)}
              onPromote={(memberId) => handlePromote(classDetail.class.id, memberId)}
              isPromoting={promoteMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
          No classes with waitlist for this day
        </div>
      )}
    </div>
  );
}
