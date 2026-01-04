'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Users,
  UserCheck,
  UserPlus,
  ShoppingCart,
  Banknote,
  Receipt,
  Calculator,
  Calendar,
  CheckCircle,
  Percent,
  LayoutGrid,
  TrendingUp,
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { BusinessOverview, ConversionRate, BookingMetrics, DateRange } from '@/lib/business/types';

interface MetricsGridProps {
  overview?: BusinessOverview;
  conversion?: ConversionRate;
  bookings?: BookingMetrics;
  isLoading: boolean;
  dateRange: DateRange;
  isAr: boolean;
}

export function MetricsGrid({
  overview,
  bookings,
  isLoading,
  dateRange,
  isAr,
}: MetricsGridProps) {
  const router = useRouter();
  const locale = useLocale();

  const navigateToMembers = (filter: string) => {
    const params = new URLSearchParams({
      filter,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
    router.push(`/${locale}/business/members?${params.toString()}`);
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const formatNumber = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-SA').format(num || 0);
  };

  const formatPercent = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${(num || 0).toFixed(1)}%`;
  };

  return (
    <div className="space-y-4">
      {/* Members Row */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {isAr ? 'الأعضاء' : 'Members'}
        </h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={isAr ? 'إجمالي الأعضاء' : 'Total Members'}
            value={formatNumber(overview?.total_members || 0)}
            subtitle={isAr ? 'كل الوقت' : 'all time'}
            icon={Users}
            isLoading={isLoading}
            onClick={() => navigateToMembers('all')}
          />
          <MetricCard
            title={isAr ? 'الأعضاء النشطين' : 'Active Members'}
            value={formatNumber(overview?.active_members || 0)}
            subtitle={isAr ? 'عضوية صالحة' : 'valid membership'}
            icon={UserCheck}
            isLoading={isLoading}
            onClick={() => navigateToMembers('active')}
          />
          <MetricCard
            title={isAr ? 'تسجيلات جديدة' : 'New Registrations'}
            value={formatNumber(overview?.new_registrations || 0)}
            subtitle={isAr ? 'في الفترة' : 'in period'}
            icon={UserPlus}
            isLoading={isLoading}
            onClick={() => navigateToMembers('new')}
          />
          <MetricCard
            title={isAr ? 'اشتروا' : 'Purchased'}
            value={formatNumber(overview?.purchased_members || 0)}
            subtitle={isAr ? 'مستخدمين مدفوعين' : 'paid users'}
            icon={ShoppingCart}
            isLoading={isLoading}
            onClick={() => navigateToMembers('purchased')}
          />
        </div>
      </div>

      {/* Financials Row */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {isAr ? 'المالية' : 'Financials'}
        </h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title={isAr ? 'الإيرادات' : 'Revenue'}
            value={formatCurrency(overview?.total_revenue || 0)}
            subtitle={isAr ? 'في الفترة' : 'in period'}
            icon={Banknote}
            isLoading={isLoading}
          />
          <MetricCard
            title={isAr ? 'المعاملات' : 'Transactions'}
            value={formatNumber(overview?.total_transactions || 0)}
            subtitle={isAr ? 'في الفترة' : 'in period'}
            icon={Receipt}
            isLoading={isLoading}
          />
          <MetricCard
            title={isAr ? 'متوسط / معاملة' : 'Avg / Transaction'}
            value={formatCurrency(overview?.avg_transaction || 0)}
            subtitle={isAr ? 'في الفترة' : 'in period'}
            icon={Calculator}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Bookings Row */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {isAr ? 'الحجوزات والحضور' : 'Bookings & Attendance'}
        </h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title={isAr ? 'إجمالي الحجوزات' : 'Total Bookings'}
            value={formatNumber(bookings?.total_bookings || 0)}
            subtitle={isAr ? 'في الفترة' : 'in period'}
            icon={Calendar}
            isLoading={isLoading}
          />
          <MetricCard
            title={isAr ? 'الحضور' : 'Attended'}
            value={formatNumber(bookings?.attended || 0)}
            subtitle={isAr ? 'تم تسجيلهم' : 'checked in'}
            icon={CheckCircle}
            isLoading={isLoading}
          />
          <MetricCard
            title={isAr ? 'نسبة الحضور' : 'Attendance Rate'}
            value={formatPercent(bookings?.attendance_rate || 0)}
            subtitle={isAr ? 'حضور / حجز' : 'attended / booked'}
            icon={Percent}
            isLoading={isLoading}
          />
          <MetricCard
            title={isAr ? 'السعة الكلية' : 'Total Capacity'}
            value={formatNumber(bookings?.total_capacity || 0)}
            subtitle={isAr ? 'مقاعد' : 'seats'}
            icon={LayoutGrid}
            isLoading={isLoading}
          />
          <MetricCard
            title={isAr ? 'الاستخدام' : 'Utilization'}
            value={formatPercent(bookings?.utilization_rate || 0)}
            subtitle={isAr ? 'حجز / سعة' : 'booked / capacity'}
            icon={TrendingUp}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
