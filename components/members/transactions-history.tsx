'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download } from 'lucide-react';
import type { Membership, MembershipState } from '@/lib/members/types';
import { format, parseISO } from 'date-fns';

interface TransactionsHistoryProps {
  current: Membership[];
  past: Membership[];
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

function getStateBadge(state: MembershipState): { label: string; className: string } {
  switch (state) {
    case 'active':
      return { label: 'Active', className: 'bg-green-500/10 text-green-600' };
    case 'expiring':
      return { label: 'Expiring', className: 'bg-orange-500/10 text-orange-600' };
    case 'expired':
      return { label: 'Expired', className: 'bg-red-500/10 text-red-600' };
    case 'upcoming':
      return { label: 'Upcoming', className: 'bg-blue-500/10 text-blue-600' };
    default:
      return { label: state, className: 'bg-muted text-muted-foreground' };
  }
}

export function TransactionsHistory({ current, past }: TransactionsHistoryProps) {
  // Combine current and past memberships
  const allMemberships = [
    ...current,
    ...past,
  ].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (allMemberships.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No memberships yet</p>
    );
  }

  return (
    <div className="space-y-3 md:space-y-0">
      {allMemberships.slice(0, 5).map((membership) => {
        const { label: stateLabel, className: stateBadgeClass } = getStateBadge(membership.state);
        return (
          <div key={membership.id} className="text-sm md:flex md:items-center md:justify-between md:py-2">
            {/* Date - separate line on mobile, inline on desktop */}
            <p className="text-xs text-muted-foreground mb-0.5 md:mb-0 md:w-24 md:shrink-0">
              {formatDate(membership.created_at)}
            </p>
            {/* Plan info + badge + classes info */}
            <div className="flex items-center justify-between md:flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{membership.plan_name}</span>
                <span className={cn('text-xs px-1.5 py-0.5 rounded-full', stateBadgeClass)}>
                  {stateLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  {membership.remaining_classes}/{membership.class_count} classes
                </span>
                {membership.invoice && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      asChild
                      title="View Invoice"
                    >
                      <a href={membership.invoice.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      asChild
                      title="Download Invoice"
                    >
                      <a href={membership.invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
