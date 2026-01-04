'use client';

import { Pie, PieChart, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { ClassTypeBreakdown as ClassTypeBreakdownType } from '@/lib/business/types';

interface ClassTypeBreakdownProps {
  data: ClassTypeBreakdownType[];
  isLoading: boolean;
  isAr: boolean;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function ClassTypeBreakdown({ data, isLoading, isAr }: ClassTypeBreakdownProps) {
  // Transform data for chart and build config
  const chartData = data.map((item, index) => ({
    name: item.class_type_name,
    value: parseInt(String(item.attendance_count)) || 0,
    percentage: parseFloat(String(item.percentage)) || 0,
    fill: COLORS[index % COLORS.length],
  }));

  const chartConfig: ChartConfig = data.reduce((acc, item, index) => {
    acc[item.class_type_name] = {
      label: item.class_type_name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  const totalAttendance = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-medium">
          {isAr ? 'توزيع أنواع الصفوف' : 'Class Type Distribution'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isAr ? 'الحضور حسب نوع الصف' : 'Attendance by class type'}
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-[250px] w-full" />
      ) : !chartData.length ? (
        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
          {isAr ? 'لا توجد بيانات' : 'No data available'}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-4">
          <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      `${value} (${((Number(value) / totalAttendance) * 100).toFixed(1)}%)`,
                      name,
                    ]}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span>{item.name}</span>
                </div>
                <div className="text-muted-foreground">
                  {item.value} ({item.percentage.toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
