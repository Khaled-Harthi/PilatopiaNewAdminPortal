'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Membership, MembershipState } from '@/lib/members/types';
import { differenceInDays, parseISO } from 'date-fns';

interface MembershipStatusCardProps {
  current: Membership[];
  onAddMembership: () => void;
  onExtendExpiry?: (membership: Membership) => void;
  onAddClass?: (membership: Membership) => void;
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

function getStateBadge(state: MembershipState): { label: string; className: string } {
  switch (state) {
    case 'active':
      return { label: 'Active', className: 'bg-green-500/10 text-green-600' };
    case 'expiring':
      return { label: 'Expiring Soon', className: 'bg-orange-500/10 text-orange-600' };
    case 'expired':
      return { label: 'Expired', className: 'bg-red-500/10 text-red-600' };
    case 'upcoming':
      return { label: 'Upcoming', className: 'bg-blue-500/10 text-blue-600' };
    default:
      return { label: state, className: 'bg-muted text-muted-foreground' };
  }
}

function MembershipCard({
  membership,
  onExtendExpiry,
  onAddClass,
}: {
  membership: Membership;
  onExtendExpiry?: (membership: Membership) => void;
  onAddClass?: (membership: Membership) => void;
}) {
  const remaining = membership.remaining_classes;
  const total = membership.class_count;
  const used = total - remaining;
  const progressPercent = total > 0 ? (used / total) * 100 : 0;
  const { text: expiryText, urgency } = getExpiryInfo(membership.expiry_date);
  const { label: stateLabel, className: stateBadgeClass } = getStateBadge(membership.state);

  return (
    <div className="border rounded-xl p-3 md:p-4">
      {/* Package Name + Badge + Price */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{membership.plan_name}</h3>
          <span className={cn('text-xs px-2 py-0.5 rounded-full', stateBadgeClass)}>
            {stateLabel}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          SAR {membership.price_paid.toLocaleString()}
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
          <Button variant="ghost" size="sm" className="w-full md:w-auto" onClick={() => onExtendExpiry(membership)}>
            Extend Expiry
          </Button>
        )}
        {onAddClass && (
          <Button size="sm" className="w-full md:w-auto" onClick={() => onAddClass(membership)}>
            Add Class
          </Button>
        )}
      </div>
    </div>
  );
}

export function MembershipStatusCard({
  current,
  onAddMembership,
  onExtendExpiry,
  onAddClass,
}: MembershipStatusCardProps) {
  // No active membership state
  if (!current || current.length === 0) {
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

  return (
    <div className="space-y-3">
      {current.map((membership) => (
        <MembershipCard
          key={membership.id}
          membership={membership}
          onExtendExpiry={onExtendExpiry}
          onAddClass={onAddClass}
        />
      ))}
      {/* Add another membership button */}
      <Button variant="outline" onClick={onAddMembership} className="gap-2 w-full sm:w-auto">
        <Plus className="h-4 w-4" />
        Add Another Membership
      </Button>
    </div>
  );
}
