'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserCheck, Clock, AlertCircle, UserPlus } from 'lucide-react';
import type { MemberStats } from '@/lib/members/types';
import { cn } from '@/lib/utils';

interface MembersStatsBarProps {
  stats: MemberStats | null | undefined;
  isLoading?: boolean;
  locale: string;
  activeSegment?: string;
  onSegmentClick?: (segment: string) => void;
}

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  sublabel: string;
  segment: string;
  isActive?: boolean;
  onClick?: () => void;
}

function StatItem({ icon, value, label, sublabel, segment, isActive, onClick }: StatItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 p-4 text-left transition-colors rounded-lg',
        isActive ? 'bg-accent' : 'hover:bg-accent/50',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-0.5">{icon}</div>
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        </div>
      </div>
    </button>
  );
}

function StatItemSkeleton() {
  return (
    <div className="flex-1 p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 mt-0.5" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export function MembersStatsBar({ stats, isLoading, locale, activeSegment, onSegmentClick }: MembersStatsBarProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="flex divide-x">
            <StatItemSkeleton />
            <StatItemSkeleton />
            <StatItemSkeleton />
            <StatItemSkeleton />
            <StatItemSkeleton />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isAr = locale === 'ar';

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex divide-x">
          <StatItem
            icon={<Users className="h-5 w-5" />}
            value={stats?.total ?? 0}
            label={isAr ? 'الإجمالي' : 'Total'}
            sublabel={isAr ? 'الأعضاء' : 'members'}
            segment="all"
            isActive={activeSegment === 'all'}
            onClick={() => onSegmentClick?.('all')}
          />
          <StatItem
            icon={<UserCheck className="h-5 w-5" />}
            value={stats?.active_memberships ?? 0}
            label={isAr ? 'نشط' : 'Active'}
            sublabel={isAr ? 'عضويات' : 'memberships'}
            segment="active"
            isActive={activeSegment === 'active'}
            onClick={() => onSegmentClick?.('active')}
          />
          <StatItem
            icon={<Clock className="h-5 w-5" />}
            value={stats?.expiring_soon ?? 0}
            label={isAr ? 'قريب الانتهاء' : 'Expiring'}
            sublabel={isAr ? 'خلال 7 أيام' : 'within 7 days'}
            segment="expiring"
            isActive={activeSegment === 'expiring'}
            onClick={() => onSegmentClick?.('expiring')}
          />
          <StatItem
            icon={<AlertCircle className="h-5 w-5" />}
            value={stats?.inactive ?? 0}
            label={isAr ? 'يحتاج متابعة' : 'Need Attention'}
            sublabel={isAr ? 'غير نشط 14+ يوم' : 'inactive 14+ days'}
            segment="inactive"
            isActive={activeSegment === 'inactive'}
            onClick={() => onSegmentClick?.('inactive')}
          />
          <StatItem
            icon={<UserPlus className="h-5 w-5" />}
            value={stats?.new_this_month ?? 0}
            label={isAr ? 'جدد' : 'New'}
            sublabel={isAr ? 'هذا الشهر' : 'this month'}
            segment="new"
            isActive={activeSegment === 'new'}
            onClick={() => onSegmentClick?.('new')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
