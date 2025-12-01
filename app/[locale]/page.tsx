'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { GlobalSearch } from '@/components/GlobalSearch';
import { DailyDashboard } from '@/components/home/DailyDashboard';

export default function HomePage() {
  return (
    <DashboardLayout>
      <DailyDashboard />
      {/* GlobalSearch is triggered via Cmd+K from the dashboard header */}
      <GlobalSearch />
    </DashboardLayout>
  );
}
