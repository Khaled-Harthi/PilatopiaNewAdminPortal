'use client';

import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/DashboardLayout';
import { GlobalSearch } from '@/components/GlobalSearch';
import { DailyAttendance } from '@/components/DailyAttendance';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const t = useTranslations('Navigation');
  const { admin } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Global Search */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {admin?.name}
            </p>
          </div>
          <GlobalSearch />
        </div>

        {/* Daily Attendance Section */}
        <DailyAttendance />
      </div>
    </DashboardLayout>
  );
}
