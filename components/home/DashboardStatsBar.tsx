'use client';

import type { DailySummary } from '@/lib/schedule/types';

interface DashboardStatsBarProps {
  summary: DailySummary;
}

interface StatItemProps {
  value: number | string;
  label: string;
  subLabel?: string;
  highlight?: boolean;
}

function StatItem({ value, label, subLabel, highlight }: StatItemProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-[10px] sm:text-xs text-muted-foreground uppercase font-medium">
        {label}
      </span>
      <div className="flex items-baseline gap-0.5 sm:gap-1">
        <span className={`text-base sm:text-lg font-semibold ${highlight ? 'text-orange-500' : ''}`}>
          {value}
        </span>
        {subLabel && (
          <span className="text-xs sm:text-sm text-muted-foreground">{subLabel}</span>
        )}
      </div>
    </div>
  );
}

export function DashboardStatsBar({ summary }: DashboardStatsBarProps) {
  const fillRate = summary.total_capacity > 0
    ? Math.round((summary.total_booked / summary.total_capacity) * 100)
    : 0;

  return (
    <div className="bg-card border-t">
      <div className="px-4 sm:px-6 py-2 sm:py-3">
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          <StatItem
            value={summary.total_classes}
            label="Classes"
            subLabel="scheduled"
          />

          <StatItem
            value={`${summary.total_booked}/${summary.total_capacity}`}
            label="Booked"
            subLabel="spots"
          />

          <StatItem
            value={summary.total_checked_in}
            label="Checked In"
            subLabel="completed"
          />

          <StatItem
            value={summary.total_waitlisted}
            label="Waitlisted"
            highlight={summary.total_waitlisted > 0}
          />

          <StatItem
            value={`${fillRate}%`}
            label="Fill Rate"
            subLabel="average"
          />
        </div>
      </div>
    </div>
  );
}
