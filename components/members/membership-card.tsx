'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Membership } from '@/lib/members/types';
import { format, differenceInDays, parseISO, isToday, isTomorrow } from 'date-fns';

interface MembershipCardProps {
  current: Membership | null;
  onAddNew: () => void;
  onExtendExpiry?: () => void;
  onAddClass?: () => void;
}

function formatExpiryText(expiryDate: string): { text: string; isUrgent: boolean } {
  const date = parseISO(expiryDate);
  const daysUntil = differenceInDays(date, new Date());

  if (isToday(date)) {
    return { text: 'Expires today', isUrgent: true };
  }
  if (isTomorrow(date)) {
    return { text: 'Expires tomorrow', isUrgent: true };
  }
  if (daysUntil < 0) {
    return { text: 'Expired', isUrgent: true };
  }
  if (daysUntil <= 7) {
    return { text: `Expires in ${daysUntil} days`, isUrgent: true };
  }
  return { text: `Expires ${format(date, 'MMM d')}`, isUrgent: false };
}

export function MembershipCard({ current, onAddNew, onExtendExpiry, onAddClass }: MembershipCardProps) {
  if (!current) {
    return (
      <section>
        <div className="flex items-center justify-between py-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Current Package
          </h3>
          <Button variant="default" size="sm" onClick={onAddNew} className="h-7 gap-1">
            <Plus className="h-3 w-3" />
            Add Package
          </Button>
        </div>
        <p className="text-sm text-muted-foreground pb-4">No active package</p>
        <Separator />
      </section>
    );
  }

  const remaining = current.remaining_classes;
  const total = current.class_count;
  const progressPercent = total > 0 ? (remaining / total) * 100 : 0;
  const { text: expiryText, isUrgent } = formatExpiryText(current.expiry_date);

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Current Package
        </h3>
        <Button variant="default" size="sm" onClick={onAddNew} className="h-7 gap-1">
          <Plus className="h-3 w-3" />
          Add Package
        </Button>
      </div>

      {/* Plan info */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">{current.plan_name}</h2>
        <p className="text-sm font-medium">SAR {current.price_paid.toLocaleString()}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold">
          {remaining}/{total}{' '}
          <span className="text-sm font-normal text-muted-foreground">remaining</span>
        </p>
        <p
          className={cn(
            'text-sm',
            isUrgent ? 'text-orange-600 font-medium' : 'text-muted-foreground'
          )}
        >
          {expiryText}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 -ml-2 pb-4">
        {onExtendExpiry && (
          <Button variant="ghost" size="sm" onClick={onExtendExpiry} className="h-7 text-xs">
            Extend Expiry
          </Button>
        )}
        {onAddClass && (
          <Button variant="ghost" size="sm" onClick={onAddClass} className="h-7 text-xs gap-1">
            <Plus className="h-3 w-3" />
            Add Class
          </Button>
        )}
      </div>

      <Separator />
    </section>
  );
}
