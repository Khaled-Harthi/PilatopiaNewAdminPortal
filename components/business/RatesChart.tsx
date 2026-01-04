'use client';

import { useState } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useBookingTrends } from '@/lib/business/hooks';
import { DateRange, Granularity } from '@/lib/business/types';
import { format, parseISO } from 'date-fns';

interface RatesChartProps {
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
  attendance_rate: {
    label: 'Attendance Rate',
    color: 'hsl(var(--chart-1))',
  },
  utilization_rate: {
    label: 'Utilization Rate',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function RatesChart({ dateRange, isAr }: RatesChartProps) {
  const [granularity, setGranularity] = useState<Granularity>('day');
  const { data, isLoading } = useBookingTrends(dateRange, granularity);

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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">
          {isAr ? 'المعدلات عبر الوقت' : 'Rates Over Time'}
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
          <LineChart data={data.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="period"
              tickFormatter={formatXAxis}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              width={50}
              domain={[0, 100]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatXAxis(value)}
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, '']}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="attendance_rate"
              stroke="var(--color-attendance_rate)"
              strokeWidth={2}
              dot={false}
              name={isAr ? 'نسبة الحضور' : 'Attendance Rate'}
            />
            <Line
              type="monotone"
              dataKey="utilization_rate"
              stroke="var(--color-utilization_rate)"
              strokeWidth={2}
              dot={false}
              name={isAr ? 'نسبة الاستخدام' : 'Utilization Rate'}
            />
          </LineChart>
        </ChartContainer>
      )}
    </Card>
  );
}
