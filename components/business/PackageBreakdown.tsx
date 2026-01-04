'use client';

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { PlanBreakdown, RevenueTotals } from '@/lib/business/types';

interface PackageBreakdownProps {
  data: PlanBreakdown[];
  totals?: RevenueTotals;
  isLoading: boolean;
  isAr: boolean;
}

const chartConfig = {
  unique_members: {
    label: 'Members',
    color: 'hsl(var(--chart-1))',
  },
  total_purchases: {
    label: 'Purchases',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function PackageBreakdown({ data, totals, isLoading, isAr }: PackageBreakdownProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Transform data for chart display
  const chartData = data.map((plan) => ({
    name: plan.plan_name,
    unique_members: parseInt(String(plan.unique_members)) || 0,
    total_purchases: parseInt(String(plan.total_purchases)) || 0,
    total_revenue: parseFloat(String(plan.total_revenue)) || 0,
  }));

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-medium">
          {isAr ? 'تفاصيل الباقات' : 'Package Breakdown'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isAr ? 'الأعضاء والمشتريات لكل باقة' : 'Members & purchases per plan'}
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-[250px] w-full" />
      ) : !chartData.length ? (
        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
          {isAr ? 'لا توجد بيانات' : 'No data available'}
        </div>
      ) : (
        <>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 80, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                width={80}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, props) => {
                      const item = props.payload;
                      if (name === 'unique_members') {
                        return [value, isAr ? 'أعضاء' : 'Members'];
                      }
                      return [
                        `${value} (${formatCurrency(item.total_revenue)})`,
                        isAr ? 'مشتريات' : 'Purchases',
                      ];
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="unique_members"
                fill="var(--color-unique_members)"
                radius={[0, 4, 4, 0]}
                name={isAr ? 'أعضاء' : 'Members'}
              />
              <Bar
                dataKey="total_purchases"
                fill="var(--color-total_purchases)"
                radius={[0, 4, 4, 0]}
                name={isAr ? 'مشتريات' : 'Purchases'}
              />
            </BarChart>
          </ChartContainer>

          {/* Summary totals */}
          {totals && (
            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{isAr ? 'باس واحد' : 'Single Pass'}</p>
                <p className="font-medium">
                  {totals.single_pass_members} {isAr ? 'عضو' : 'members'} / {totals.single_pass_purchases}{' '}
                  {isAr ? 'شراء' : 'purchases'}
                </p>
                <p className="text-muted-foreground">{formatCurrency(totals.single_pass_revenue)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{isAr ? 'الباقات' : 'Packages'}</p>
                <p className="font-medium">
                  {totals.package_members} {isAr ? 'عضو' : 'members'} / {totals.package_purchases}{' '}
                  {isAr ? 'شراء' : 'purchases'}
                </p>
                <p className="text-muted-foreground">{formatCurrency(totals.package_revenue)}</p>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
