'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';

interface ScheduleHeaderProps {
  locale: string;
}

export function ScheduleHeader({
  locale,
}: ScheduleHeaderProps) {
  return (
    <header className="bg-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Left: Sidebar trigger + Title */}
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-semibold">
              {locale === 'ar' ? 'جدول الحصص' : 'Class Schedule'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {locale === 'ar'
                ? 'إدارة ومراقبة الحصص المجدولة'
                : 'Manage and monitor scheduled classes'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
