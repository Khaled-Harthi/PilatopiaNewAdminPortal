'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { BusinessDashboard } from '@/components/business/BusinessDashboard';

export default function BusinessPage() {
  return (
    <ProtectedRoute requiredRoles={['super_admin']}>
      <DashboardLayout>
        <BusinessDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
