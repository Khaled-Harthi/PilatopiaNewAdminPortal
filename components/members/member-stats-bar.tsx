'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface MemberStatsBarProps {
  totalSpent: number;
  totalPurchases: number;
  avgVisitsPerWeek: number;
  lastVisit: string | null;
  currency?: string;
}

export function MemberStatsBar({
  totalSpent,
  totalPurchases,
  avgVisitsPerWeek,
  lastVisit,
  currency = 'SAR',
}: MemberStatsBarProps) {
  const formatLastVisit = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Never';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${currency} ${(amount / 1000).toFixed(1)}k`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const stats = [
    {
      value: formatCurrency(totalSpent),
      label: 'total spent',
    },
    {
      value: totalPurchases.toString(),
      label: 'purchases',
    },
    {
      value: avgVisitsPerWeek.toFixed(1),
      label: 'visits/week',
    },
    {
      value: formatLastVisit(lastVisit),
      label: 'last visit',
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center sm:text-left">
              <p className="text-xl font-semibold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
