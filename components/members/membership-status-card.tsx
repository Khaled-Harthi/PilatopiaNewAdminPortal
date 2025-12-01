'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Membership } from '@/lib/members/types';
import { differenceInDays, parseISO } from 'date-fns';

interface MembershipStatusCardProps {
  current: Membership | null;
  onAddMembership: () => void;
  onExtendExpiry?: () => void;
  onAddClass?: () => void;
}

function getExpiryInfo(expiryDate: string): { daysLeft: number; text: string; urgency: 'normal' | 'warning' | 'critical' } {
  const date = parseISO(expiryDate);
  const daysLeft = differenceInDays(date, new Date());

  if (daysLeft < 0) {
    return { daysLeft, text: 'Expired', urgency: 'critical' };
  }
  if (daysLeft === 0) {
    return { daysLeft, text: 'Expires today', urgency: 'critical' };
  }
  if (daysLeft === 1) {
    return { daysLeft, text: 'Expires tomorrow', urgency: 'critical' };
  }
  if (daysLeft <= 7) {
    return { daysLeft, text: `Expires in ${daysLeft} days`, urgency: 'warning' };
  }
  return { daysLeft, text: `Expires in ${daysLeft} days`, urgency: 'normal' };
}

export function MembershipStatusCard({
  current,
  onAddMembership,
  onExtendExpiry,
  onAddClass,
}: MembershipStatusCardProps) {
  // No active membership state
  if (!current) {
    return (
      <div className="border rounded-xl p-3 md:p-4">
        <p className="text-sm text-muted-foreground mb-3">No active membership</p>
        <Button onClick={onAddMembership} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add Membership
        </Button>
      </div>
    );
  }

  const remaining = current.remaining_classes;
  const total = current.class_count;
  const used = total - remaining;
  const progressPercent = total > 0 ? (used / total) * 100 : 0;
  const { text: expiryText, urgency } = getExpiryInfo(current.expiry_date);

  return (
    <div className="border rounded-xl p-3 md:p-4">
      {/* Package Name + Price */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{current.plan_name}</h3>
        <span className="text-sm text-muted-foreground">
          SAR {current.price_paid.toLocaleString()}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-1">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              urgency === 'critical' ? 'bg-red-500' :
              urgency === 'warning' ? 'bg-orange-500' : 'bg-primary'
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm">
          <span className="font-semibold">{used}/{total}</span>
          <span className="text-muted-foreground ml-1">used</span>
        </p>
        <p
          className={cn(
            'text-xs',
            urgency === 'critical' && 'text-red-600 font-medium',
            urgency === 'warning' && 'text-orange-600 font-medium',
            urgency === 'normal' && 'text-muted-foreground'
          )}
        >
          {expiryText}
        </p>
      </div>

      {/* Actions - Full-width grid on mobile, inline on desktop */}
      <div className="grid grid-cols-2 gap-2 md:flex md:gap-2">
        {onExtendExpiry && (
          <Button variant="ghost" size="sm" className="w-full md:w-auto" onClick={onExtendExpiry}>
            Extend Expiry
          </Button>
        )}
        {onAddClass && (
          <Button size="sm" className="w-full md:w-auto" onClick={onAddClass}>
            Add Class
          </Button>
        )}
      </div>
    </div>
  );
}
