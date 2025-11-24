'use client';

import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function SettingsPage() {
  const t = useTranslations('Navigation');

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-4">{t('settings')}</h1>
        <p className="text-muted-foreground">Settings page - Coming soon</p>
      </div>
    </DashboardLayout>
  );
}
