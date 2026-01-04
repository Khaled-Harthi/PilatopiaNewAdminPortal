'use client';

import { LucideIcon, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  isLoading?: boolean;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  isLoading,
  onClick,
  trend,
}: MetricCardProps) {
  const isClickable = !!onClick;

  return (
    <Card
      className={cn(
        'p-4 transition-colors',
        isClickable && 'cursor-pointer hover:bg-accent/50'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
        {isClickable && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className="mt-3">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-16 mt-1" />
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold">{value}</span>
              {trend && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </>
        )}
      </div>
    </Card>
  );
}
