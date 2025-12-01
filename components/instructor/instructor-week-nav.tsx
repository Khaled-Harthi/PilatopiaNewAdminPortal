'use client';

import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface InstructorWeekNavProps {
  weekStart: Date;
  weekEnd: Date;
  locale: string;
}

export function InstructorWeekNav({
  weekStart,
  weekEnd,
  locale,
}: InstructorWeekNavProps) {
  const isRTL = locale === 'ar';
  const dateLocale = isRTL ? ar : undefined;

  const dateRangeText = `${format(weekStart, 'MMM d', { locale: dateLocale })} - ${format(
    weekEnd,
    'MMM d, yyyy',
    { locale: dateLocale }
  )}`;

  return (
    <div className="flex items-center justify-center">
      <span className="text-sm font-medium text-muted-foreground">{dateRangeText}</span>
    </div>
  );
}
