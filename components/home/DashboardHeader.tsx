'use client';

import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';

interface DashboardHeaderProps {
  selectedDate: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  onToday: () => void;
  isToday: boolean;
}

export function DashboardHeader({
  selectedDate,
  onNavigate,
  onToday,
  isToday,
}: DashboardHeaderProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Swap chevrons for RTL
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className="bg-card">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Title */}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold truncate">
              {isToday ? 'Today' : formatDate(selectedDate)}
            </h1>
            {isToday && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                {formatDate(selectedDate)}
              </p>
            )}
          </div>

          {/* Right: Navigation + Actions */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Date Navigation */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={() => onNavigate('prev')}
              >
                <PrevIcon className="h-4 w-4" />
              </Button>

              <Button
                variant={isToday ? 'default' : 'ghost'}
                size="sm"
                className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                onClick={onToday}
              >
                Today
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={() => onNavigate('next')}
              >
                <NextIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Divider - hidden on mobile */}
            <div className="hidden sm:block h-6 w-px bg-border" />

            {/* Global Search Trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 sm:gap-2 text-muted-foreground"
              onClick={() => {
                // Trigger Cmd+K
                const event = new KeyboardEvent('keydown', {
                  key: 'k',
                  metaKey: true,
                  bubbles: true,
                });
                document.dispatchEvent(event);
              }}
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded bg-muted px-1.5 text-xs text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
