'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft, ChevronLeft, ChevronRight, Phone, ExternalLink } from 'lucide-react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useMembersByFilter } from '@/lib/business/hooks';
import { MemberFilter, DateRange, getDateRangeFromPreset } from '@/lib/business/types';
import { getWhatsAppUrl } from '@/lib/members/types';

const FILTERS: { value: MemberFilter; label: string; labelAr: string }[] = [
  { value: 'all', label: 'All', labelAr: 'الكل' },
  { value: 'active', label: 'Active', labelAr: 'نشط' },
  { value: 'expiring', label: 'Expiring', labelAr: 'ينتهي' },
  { value: 'new', label: 'New', labelAr: 'جديد' },
  { value: 'purchased', label: 'Purchased', labelAr: 'اشتروا' },
  { value: 'churned', label: 'Churned', labelAr: 'غادروا' },
];

// Loading fallback for Suspense
function MembersPageSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
        </div>
        <Skeleton className="h-10 w-96" />
        <Card className="overflow-hidden">
          <div className="divide-y">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Main page component wrapped in Suspense
export default function BusinessMembersPage() {
  return (
    <Suspense fallback={<MembersPageSkeleton />}>
      <BusinessMembersContent />
    </Suspense>
  );
}

function BusinessMembersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isAr = locale === 'ar';
  const dateLocale = isAr ? ar : enUS;

  // Get filter from URL params
  const filterParam = searchParams.get('filter') as MemberFilter | null;
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  const [filter, setFilter] = useState<MemberFilter>(filterParam || 'all');
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    if (startDateParam && endDateParam) {
      return { startDate: startDateParam, endDate: endDateParam };
    }
    return getDateRangeFromPreset('30d');
  });

  // Update filter when URL changes
  useEffect(() => {
    if (filterParam && filterParam !== filter) {
      setFilter(filterParam);
      setPage(1);
    }
  }, [filterParam]);

  // Query
  const { data, isLoading } = useMembersByFilter(filter, dateRange, page, 20);

  // Handle filter change
  const handleFilterChange = (newFilter: MemberFilter) => {
    setFilter(newFilter);
    setPage(1);
    // Update URL
    const params = new URLSearchParams();
    params.set('filter', newFilter);
    params.set('startDate', dateRange.startDate);
    params.set('endDate', dateRange.endDate);
    router.replace(`/${locale}/business/members?${params.toString()}`);
  };

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy', { locale: dateLocale });
    } catch {
      return dateStr;
    }
  };

  // Format relative time helper
  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return isAr ? 'لم يزر' : 'Never';
    try {
      return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: dateLocale });
    } catch {
      return dateStr;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          {isAr ? 'بدون عضوية' : 'No Membership'}
        </Badge>
      );
    }
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {isAr ? 'نشط' : 'Active'}
          </Badge>
        );
      case 'expiring':
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            {isAr ? 'ينتهي قريباً' : 'Expiring'}
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            {isAr ? 'منتهي' : 'Expired'}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            {status}
          </Badge>
        );
    }
  };

  const filterLabel = FILTERS.find((f) => f.value === filter);

  return (
    <ProtectedRoute requiredRoles={['super_admin']}>
      <DashboardLayout>
        <div className="space-y-6 pb-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/${locale}/business`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">
                {isAr ? 'قائمة الأعضاء' : 'Member List'}
                {filterLabel && (
                  <span className="text-muted-foreground font-normal">
                    {' - '}
                    {isAr ? filterLabel.labelAr : filterLabel.label}
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground text-sm">
                {data?.pagination?.total_items
                  ? isAr
                    ? `${data.pagination.total_items} عضو`
                    : `${data.pagination.total_items} member${data.pagination.total_items !== 1 ? 's' : ''}`
                  : ''}
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(value) => value && handleFilterChange(value as MemberFilter)}
            className="justify-start flex-wrap"
          >
            {FILTERS.map((f) => (
              <ToggleGroupItem
                key={f.value}
                value={f.value}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {isAr ? f.labelAr : f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {/* Members Table */}
          <Card className="overflow-hidden">
            {/* Table Header */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_150px_120px_120px_100px] gap-4 px-4 py-3 bg-muted/50 border-b text-sm font-medium text-muted-foreground">
              <div>{isAr ? 'العضو' : 'Member'}</div>
              <div>{isAr ? 'الحالة' : 'Status'}</div>
              <div>{isAr ? 'تاريخ الانتهاء' : 'Expires'}</div>
              <div>{isAr ? 'آخر زيارة' : 'Last Check-in'}</div>
              <div className="text-center">{isAr ? 'الإجراءات' : 'Actions'}</div>
            </div>

            {/* Table Content */}
            {isLoading ? (
              <div className="divide-y">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : !data?.members?.length ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {isAr ? 'لا يوجد أعضاء' : 'No members found'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {data.members.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_150px_120px_120px_100px] gap-2 sm:gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    {/* Member Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {member.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.phone_number}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center sm:justify-start">
                      {getStatusBadge(member.membership_status)}
                    </div>

                    {/* Expires */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      {formatDate(member.membership_expires_at)}
                    </div>

                    {/* Last Check-in */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      {formatRelativeTime(member.last_check_in)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(getWhatsAppUrl(member.phone_number), '_blank')}
                        title={isAr ? 'واتساب' : 'WhatsApp'}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/${locale}/members/${member.id}`)}
                        title={isAr ? 'عرض الملف' : 'View Profile'}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pagination */}
          {data?.pagination && data.pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {isAr
                  ? `الصفحة ${data.pagination.current_page} من ${data.pagination.total_pages}`
                  : `Page ${data.pagination.current_page} of ${data.pagination.total_pages}`}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {isAr ? 'السابق' : 'Previous'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.pagination.total_pages, p + 1))}
                  disabled={page === data.pagination.total_pages}
                >
                  {isAr ? 'التالي' : 'Next'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
