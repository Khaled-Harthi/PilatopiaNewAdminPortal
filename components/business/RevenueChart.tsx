'use client';

import { useState } from 'react';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useRevenueTrends } from '@/lib/business/hooks';
import { DateRange, Granularity } from '@/lib/business/types';
import { format, parseISO } from 'date-fns';

interface RevenueChartProps {
  dateRange: DateRange;
  isAr: boolean;
}

const GRANULARITIES: { value: Granularity; label: string; labelAr: string }[] = [
  { value: 'day', label: 'D', labelAr: 'ي' },
  { value: 'week', label: 'W', labelAr: 'أ' },
  { value: 'month', label: 'M', labelAr: 'ش' },
  { value: 'year', label: 'Y', labelAr: 'س' },
];

const chartConfig = {
  total_revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function RevenueChart({ dateRange, isAr }: RevenueChartProps) {
  const [granularity, setGranularity] = useState<Granularity>('day');
  const { data, isLoading } = useRevenueTrends(dateRange, granularity);

  const formatXAxis = (value: string) => {
    try {
      const date = parseISO(value);
      switch (granularity) {
        case 'day':
          return format(date, 'MMM d');
        case 'week':
          return format(date, 'MMM d');
        case 'month':
          return format(date, 'MMM');
        case 'year':
          return format(date, 'yyyy');
        default:
          return value;
      }
    } catch {
      return value;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">
          {isAr ? 'الإيرادات عبر الوقت' : 'Revenue Over Time'}
        </h3>
        <ToggleGroup
          type="single"
          value={granularity}
          onValueChange={(value) => value && setGranularity(value as Granularity)}
          className="bg-muted p-0.5 rounded-md"
        >
          {GRANULARITIES.map((g) => (
            <ToggleGroupItem
              key={g.value}
              value={g.value}
              className="data-[state=on]:bg-background px-2 py-1 text-xs"
            >
              {isAr ? g.labelAr : g.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {isLoading ? (
        <Skeleton className="h-[200px] w-full" />
      ) : !data?.data?.length ? (
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          {isAr ? 'لا توجد بيانات' : 'No data available'}
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={data.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="period"
              tickFormatter={formatXAxis}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              width={80}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatXAxis(value)}
                  formatter={(value) => [formatCurrency(value as number), isAr ? 'الإيرادات' : 'Revenue']}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="total_revenue"
              stroke="var(--color-total_revenue)"
              fill="var(--color-total_revenue)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </Card>
  );
}
