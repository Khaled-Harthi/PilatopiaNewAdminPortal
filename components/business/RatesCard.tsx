'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface RatesCardProps {
  title: string;
  subtitle: string;
  rate: number | string;
  numerator: number | string;
  denominator: number | string;
  numeratorLabel: string;
  denominatorLabel: string;
  isLoading?: boolean;
}

export function RatesCard({
  title,
  subtitle,
  rate,
  numerator,
  denominator,
  numeratorLabel,
  denominatorLabel,
  isLoading,
}: RatesCardProps) {
  // Convert string values to numbers (API returns strings)
  const rateNum = typeof rate === 'string' ? parseFloat(rate) : rate;
  const numeratorNum = typeof numerator === 'string' ? parseFloat(numerator) : numerator;
  const denominatorNum = typeof denominator === 'string' ? parseFloat(denominator) : denominator;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-3xl font-semibold">{(rateNum || 0).toFixed(1)}%</div>
            <Progress value={rateNum || 0} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {(numeratorNum || 0).toLocaleString()} {numeratorLabel} / {(denominatorNum || 0).toLocaleString()} {denominatorLabel}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
