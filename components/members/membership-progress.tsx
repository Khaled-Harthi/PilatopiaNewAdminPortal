'use client';

import { cn } from '@/lib/utils';

interface MembershipProgressProps {
  used: number;
  total: number;
  className?: string;
}

export function MembershipProgress({
  used,
  total,
  className,
}: MembershipProgressProps) {
  const remaining = total - used;
  const percentage = total > 0 ? Math.min((remaining / total) * 100, 100) : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            percentage > 50
              ? 'bg-primary'
              : percentage > 25
              ? 'bg-yellow-500'
              : 'bg-orange-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {remaining} of {total} remaining
      </p>
    </div>
  );
}
