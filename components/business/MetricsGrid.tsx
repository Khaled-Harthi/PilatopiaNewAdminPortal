'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  UserCheck,
  UserPlus,
  UserMinus,
  Clock,
  ShoppingCart,
  Banknote,
  Receipt,
  Calendar,
  CheckCircle,
  Percent,
  LayoutGrid,
  TrendingUp,
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { BusinessOverview, BookingMetrics, DateRange } from '@/lib/business/types';

interface MetricsGridProps {
  overview?: BusinessOverview;
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
      {/* Current State Section - Ignores date filter */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {isAr ? 'الحالة الحالية' : 'Current State'}
        </h3>
        <div className="grid gap-4 grid-cols-3">
          <MetricCard
            title={isAr ? 'الأعضاء النشطين' : 'Active Members'}
            value={formatNumber(overview?.active_members || 0)}
            subtitle={isAr ? 'لديهم رصيد حصص' : 'has classes remaining'}
            icon={UserCheck}
            isLoading={isLoading}
            onClick={() => navigateToMembers('active')}
          />
          <MetricCard
            title={isAr ? 'تنتهي قريباً' : 'Expiring Soon'}
            value={formatNumber(overview?.expiring_soon || 0)}
            subtitle={isAr ? 'خلال 5 أيام' : 'within 5 days'}
            icon={Clock}
            isLoading={isLoading}
            onClick={() => navigateToMembers('expiring')}
          />
          <MetricCard
            title={isAr ? 'المتسربين' : 'Churned'}
            value={formatNumber(overview?.churned || 0)}
            subtitle={isAr ? 'آخر 30 يوم' : 'last 30 days'}
            icon={UserMinus}
            isLoading={isLoading}
            onClick={() => navigateToMembers('churned')}
          />
        </div>
      </div>

      {/* Period Activity Section - Respects date filter */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {isAr ? 'نشاط الفترة' : 'Period Activity'}
        </h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={isAr ? 'مستخدمين جدد' : 'New Users'}
            value={formatNumber(overview?.new_users || 0)}
            subtitle={isAr ? 'سجلوا في الفترة' : 'registered in period'}
            icon={UserPlus}
            isLoading={isLoading}
            onClick={() => navigateToMembers('new')}
          />
          <MetricCard
            title={isAr ? 'أعضاء جدد' : 'New Members'}
            value={formatNumber(overview?.new_members || 0)}
            subtitle={isAr ? 'أول شراء' : 'first purchase'}
            icon={ShoppingCart}
            isLoading={isLoading}
            onClick={() => navigateToMembers('purchased')}
          />
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
