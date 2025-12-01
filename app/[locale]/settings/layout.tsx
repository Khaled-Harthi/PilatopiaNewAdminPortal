'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { SettingsNav } from '@/components/settings/settings-nav';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <ProtectedRoute requiredRoles={['super_admin']}>
        <div className="flex flex-col md:flex-row h-[calc(100vh-3rem)] -m-6">
          <SettingsNav />
          <div className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </div>
        </div>
      </ProtectedRoute>
    </DashboardLayout>
  );
}
