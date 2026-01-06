'use client';

import { useState, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { BusinessHeader } from './BusinessHeader';
import { AlertsSection } from './AlertsSection';
import { MetricsGrid } from './MetricsGrid';
import { RatesCard } from './RatesCard';
import { RevenueChart } from './RevenueChart';
import { RegistrationsChart } from './RegistrationsChart';
import { BookingsChart } from './BookingsChart';
import { RatesChart } from './RatesChart';
import { PackageBreakdown } from './PackageBreakdown';
import { ClassTypeBreakdown } from './ClassTypeBreakdown';
import { AttendanceHeatmap } from './AttendanceHeatmap';
import {
  useBusinessOverview,
  useBookingMetrics,
  useRevenueBreakdown,
  useExpiringMembers,
  useChurnedMembers,
} from '@/lib/business/hooks';
import {
  DatePreset,
  DateRange,
  getDateRangeFromPreset,
} from '@/lib/business/types';

export function BusinessDashboard() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  // Global date filter state
  const [datePreset, setDatePreset] = useState<DatePreset>('30d');
  const [customDateRange, setCustomDateRange] = useState<DateRange | null>(null);

  // Compute effective date range - memoize to prevent infinite re-renders
  const dateRange: DateRange = useMemo(() => {
    return customDateRange || getDateRangeFromPreset(datePreset);
  }, [customDateRange, datePreset]);

  // Queries
  const { data: overviewData, isLoading: isLoadingOverview } = useBusinessOverview(dateRange);
  const { data: bookingsData, isLoading: isLoadingBookings } = useBookingMetrics(dateRange);
  const { data: revenueData, isLoading: isLoadingRevenue } = useRevenueBreakdown(dateRange);
  const { data: expiringData, isLoading: isLoadingExpiring } = useExpiringMembers();
  const { data: churnedData, isLoading: isLoadingChurned } = useChurnedMembers();

  // Handle date filter change
  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      setCustomDateRange(null);
    }
  };

  const handleCustomDateRange = (range: DateRange) => {
    setCustomDateRange(range);
    setDatePreset('custom');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Date Filter */}
      <BusinessHeader
        datePreset={datePreset}
        onDatePresetChange={handleDatePresetChange}
        onCustomDateRange={handleCustomDateRange}
        isAr={isAr}
      />

      {/* Alerts Section */}
      <AlertsSection
        expiringCount={expiringData?.count || 0}
        churnedCount={churnedData?.count || 0}
        isLoadingExpiring={isLoadingExpiring}
        isLoadingChurned={isLoadingChurned}
        isAr={isAr}
      />

      {/* KPI Metrics Grid */}
      <MetricsGrid
        overview={overviewData?.overview}
        bookings={bookingsData?.bookings}
        isLoading={isLoadingOverview || isLoadingBookings}
        dateRange={dateRange}
        isAr={isAr}
      />

      {/* Conversion, Retention & Churn Rates */}
      <div className="grid gap-4 md:grid-cols-3">
        <RatesCard
          title={isAr ? 'معدل التحويل' : 'Conversion Rate'}
          subtitle={isAr ? 'التسجيل → الشراء' : 'Registration → Purchase'}
          rate={overviewData?.conversion.conversion_rate || 0}
          numerator={overviewData?.conversion.converted || 0}
          denominator={overviewData?.conversion.total_registrations || 0}
          numeratorLabel={isAr ? 'اشتروا' : 'purchased'}
          denominatorLabel={isAr ? 'مسجل' : 'registered'}
          isLoading={isLoadingOverview}
        />
        <RatesCard
          title={isAr ? 'معدل الاحتفاظ' : 'Retention Rate'}
          subtitle={isAr ? 'منتهي → نشط حالياً' : 'Expired → Still Active'}
          rate={overviewData?.retention.retention_rate || 0}
          numerator={overviewData?.retention.retained || 0}
          denominator={overviewData?.retention.total_expired || 0}
          numeratorLabel={isAr ? 'جددوا' : 'renewed'}
          denominatorLabel={isAr ? 'منتهي' : 'expired'}
          isLoading={isLoadingOverview}
        />
        <RatesCard
          title={isAr ? 'معدل التسرب' : 'Churn Rate'}
          subtitle={isAr ? 'منتهي → لم يجدد' : 'Expired → Did Not Renew'}
          rate={overviewData?.retention.churn_rate || 0}
          numerator={overviewData?.retention.churned || 0}
          denominator={overviewData?.retention.total_expired || 0}
          numeratorLabel={isAr ? 'تسربوا' : 'churned'}
          denominatorLabel={isAr ? 'منتهي' : 'expired'}
          isLoading={isLoadingOverview}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <RevenueChart dateRange={dateRange} isAr={isAr} />
        <RegistrationsChart dateRange={dateRange} isAr={isAr} />
      </div>

      {/* Charts Row 2 - Bookings */}
      <div className="grid gap-4 md:grid-cols-2">
        <BookingsChart dateRange={dateRange} isAr={isAr} />
        <RatesChart dateRange={dateRange} isAr={isAr} />
      </div>

      {/* Charts Row 3 - Breakdowns */}
      <div className="grid gap-4 md:grid-cols-2">
        <PackageBreakdown
          data={revenueData?.by_plan_type || []}
          totals={revenueData?.totals}
          isLoading={isLoadingRevenue}
          isAr={isAr}
        />
        <ClassTypeBreakdown
          data={revenueData?.by_class_type || []}
          isLoading={isLoadingRevenue}
          isAr={isAr}
        />
      </div>

      {/* Attendance Heatmap */}
      <AttendanceHeatmap dateRange={dateRange} isAr={isAr} />
    </div>
  );
}
