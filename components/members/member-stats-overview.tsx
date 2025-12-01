'use client';

import { cn } from '@/lib/utils';
import type { Membership, MemberProfile } from '@/lib/members/types';
import { differenceInDays, parseISO } from 'date-fns';

interface MemberStatsOverviewProps {
  membership: Membership | null;
  totalSpent: number;
  totalPurchases: number;
  visitsPerWeek: number;
}

function getExpiryInfo(expiryDate: string): { daysUntil: number; isUrgent: boolean } {
  const date = parseISO(expiryDate);
  const daysUntil = differenceInDays(date, new Date());
  return {
    daysUntil: Math.max(0, daysUntil),
    isUrgent: daysUntil <= 7,
  };
}

export function MemberStatsOverview({
  membership,
  totalSpent,
  totalPurchases,
  visitsPerWeek,
}: MemberStatsOverviewProps) {
  // Show simple message when no package exists
  if (!membership) {
    return (
      <div className="container mx-auto px-6 py-4">
        <div className="rounded-lg bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            No active package — Add a membership to see stats here
          </p>
        </div>
      </div>
    );
  }

  const remaining = membership.remaining_classes ?? 0;
  const total = membership.class_count ?? 0;
  const progressPercent = total > 0 ? (remaining / total) * 100 : 0;
  const { daysUntil, isUrgent } = getExpiryInfo(membership.expiry_date);

  return (
    <div className="container mx-auto px-6 py-4">
      <div className="rounded-lg bg-muted/30 p-4">
        <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
          {/* Package Status */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Package
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-semibold">{remaining}/{total}</span>
              <span className="text-sm text-muted-foreground">remaining</span>
            </div>
            <div className="h-1.5 w-24 bg-muted rounded-full mt-2">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="h-12 w-px bg-border" />

          {/* Expiry */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Expires
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={cn(
                "text-2xl font-semibold",
                isUrgent && "text-orange-600"
              )}>
                {daysUntil}
              </span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>

          <div className="h-12 w-px bg-border" />

          {/* Total Spent */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Spent
            </span>
            <div className="mt-1">
              <span className="text-2xl font-semibold">
                SAR {totalSpent.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="h-12 w-px bg-border" />

          {/* Purchases + Visits */}
          <div className="flex gap-6">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Purchases
              </span>
              <div className="mt-1">
                <span className="text-2xl font-semibold">{totalPurchases}</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Visits/Week
              </span>
              <div className="mt-1">
                <span className="text-2xl font-semibold">{visitsPerWeek.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
