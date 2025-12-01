'use client';

import type { Membership } from '@/lib/members/types';
import { format, parseISO } from 'date-fns';

interface TransactionsHistoryProps {
  current: Membership | null;
  past: Membership[];
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function TransactionsHistory({ current, past }: TransactionsHistoryProps) {
  // Combine current and past memberships as transactions
  const allTransactions = [
    ...(current ? [current] : []),
    ...past,
  ].sort((a, b) =>
    new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime()
  );

  if (allTransactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No transactions yet</p>
    );
  }

  return (
    <div className="space-y-3 md:space-y-0">
      {allTransactions.slice(0, 5).map((membership) => (
        <div key={membership.id} className="text-sm md:flex md:items-center md:justify-between md:py-2">
          {/* Date - separate line on mobile, inline on desktop */}
          <p className="text-xs text-muted-foreground mb-0.5 md:mb-0 md:w-24 md:shrink-0">
            {formatDate(membership.purchase_date)}
          </p>
          {/* Plan info + price */}
          <div className="flex items-center justify-between md:flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{membership.plan_name}</span>
              <span className="text-xs text-muted-foreground">
                {membership.class_count} classes
              </span>
            </div>
            <span className="font-medium">
              SAR {membership.price_paid.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
