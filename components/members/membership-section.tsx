'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MembershipProgress } from './membership-progress';
import type { Membership } from '@/lib/members/types';
import { format, differenceInDays, isAfter, isBefore, isToday, isTomorrow } from 'date-fns';

interface MembershipSectionProps {
  current: Membership | null;
  upcoming: Membership[];
  pastCount: number;
  totalSpent: number;
  currency?: string;
  onRenew?: (membership: Membership) => void;
  onAddNew?: () => void;
  onViewHistory?: () => void;
}

export function MembershipSection({
  current,
  upcoming,
  pastCount,
  totalSpent,
  currency = 'SAR',
  onRenew,
  onAddNew,
  onViewHistory,
}: MembershipSectionProps) {
  const formatExpiryText = (expiryDate: string) => {
    const date = new Date(expiryDate);
    const today = new Date();
    const daysUntil = differenceInDays(date, today);

    if (isToday(date)) {
      return 'Expires today';
    }
    if (isTomorrow(date)) {
      return 'Expires tomorrow';
    }
    if (daysUntil < 0) {
      return 'Expired';
    }
    if (daysUntil <= 7) {
      return `Expires in ${daysUntil} days`;
    }
    return `Expires ${format(date, 'MMM d')}`;
  };

  const formatStartText = (startDate: string) => {
    const date = new Date(startDate);
    const today = new Date();

    if (isToday(date)) {
      return 'Starts today';
    }
    if (isTomorrow(date)) {
      return 'Starts tomorrow';
    }
    return `Starting ${format(date, 'MMM d')}`;
  };

  const isExpiringSoon = (expiryDate: string) => {
    const date = new Date(expiryDate);
    const daysUntil = differenceInDays(date, new Date());
    return daysUntil <= 7 && daysUntil >= 0;
  };

  return (
    <Card>
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Memberships</h2>
            {onAddNew && (
              <Button variant="ghost" size="sm" onClick={onAddNew}>
                Add New
              </Button>
            )}
          </div>

          <Separator />

          {/* Current Membership */}
          {current ? (
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Current
              </p>

              <div className="space-y-4">
                <div>
                  <p className="font-medium">{current.plan_name}</p>
                </div>

                <MembershipProgress
                  used={current.used_classes}
                  total={current.class_count}
                />

                <p
                  className={`text-sm ${
                    isExpiringSoon(current.expiry_date)
                      ? 'text-orange-600 font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {formatExpiryText(current.expiry_date)} · {format(new Date(current.expiry_date), 'MMM d')}
                </p>

                {onRenew && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRenew(current)}
                    className="mt-2"
                  >
                    Renew Package
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">No active membership</p>
              {onAddNew && (
                <Button variant="outline" size="sm" onClick={onAddNew} className="mt-3">
                  Add Membership
                </Button>
              )}
            </div>
          )}

          {/* Upcoming Memberships */}
          {upcoming.length > 0 && (
            <>
              <Separator />
              {upcoming.map((membership) => (
                <div key={membership.id} className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {formatStartText(membership.start_date).toUpperCase()}
                  </p>

                  <div>
                    <p className="font-medium">{membership.plan_name}</p>
                  </div>

                  <p className="text-sm text-green-600">
                    Paid and ready · No gap in coverage
                  </p>
                </div>
              ))}
            </>
          )}

          {/* Past Memberships Link */}
          {pastCount > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {pastCount} past membership{pastCount !== 1 ? 's' : ''}
                </p>
                {onViewHistory && (
                  <Button variant="ghost" size="sm" onClick={onViewHistory}>
                    View History
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
