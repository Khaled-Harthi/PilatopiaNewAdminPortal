'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { AlertTriangle, UserX, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface AlertsSectionProps {
  expiringCount: number;
  churnedCount: number;
  isLoadingExpiring: boolean;
  isLoadingChurned: boolean;
  isAr: boolean;
}

export function AlertsSection({
  expiringCount,
  churnedCount,
  isLoadingExpiring,
  isLoadingChurned,
  isAr,
}: AlertsSectionProps) {
  const router = useRouter();
  const locale = useLocale();

  // Don't show if no alerts
  if (!isLoadingExpiring && !isLoadingChurned && expiringCount === 0 && churnedCount === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Expiring Soon Alert */}
      {(isLoadingExpiring || expiringCount > 0) && (
        <Card className="p-4 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-200">
                  {isAr ? 'ينتهي قريباً (< 5 أيام)' : 'Expiring Soon (< 5 days)'}
                </h3>
                {isLoadingExpiring ? (
                  <Skeleton className="h-4 w-32 mt-1" />
                ) : (
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {isAr
                      ? `${expiringCount} عضو يحتاج انتباه`
                      : `${expiringCount} member${expiringCount !== 1 ? 's' : ''} need attention`}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${locale}/business/members?filter=expiring`)}
              className="text-amber-700 hover:text-amber-800 hover:bg-amber-100/50"
            >
              {isAr ? 'عرض الكل' : 'View All'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* Churned Members Alert */}
      {(isLoadingChurned || churnedCount > 0) && (
        <Card className="p-4 border-red-500/30 bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-200">
                  {isAr ? 'لم يجددوا (7 أيام)' : 'Did Not Renew (7 days)'}
                </h3>
                {isLoadingChurned ? (
                  <Skeleton className="h-4 w-32 mt-1" />
                ) : (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {isAr
                      ? `${churnedCount} عضو غادر`
                      : `${churnedCount} member${churnedCount !== 1 ? 's' : ''} churned`}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${locale}/business/members?filter=churned`)}
              className="text-red-700 hover:text-red-800 hover:bg-red-100/50"
            >
              {isAr ? 'عرض الكل' : 'View All'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
