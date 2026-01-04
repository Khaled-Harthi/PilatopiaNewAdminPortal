'use client';

import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DatePreset, DateRange } from '@/lib/business/types';

interface BusinessHeaderProps {
  datePreset: DatePreset;
  onDatePresetChange: (preset: DatePreset) => void;
  onCustomDateRange: (range: DateRange) => void;
  isAr: boolean;
}

const DATE_PRESETS: { value: DatePreset; label: string; labelAr: string }[] = [
  { value: 'today', label: 'Today', labelAr: 'اليوم' },
  { value: '7d', label: '7d', labelAr: '7ي' },
  { value: '30d', label: '30d', labelAr: '30ي' },
  { value: '3m', label: '3m', labelAr: '3ش' },
  { value: 'all', label: 'All Time', labelAr: 'كل الوقت' },
];

export function BusinessHeader({
  datePreset,
  onDatePresetChange,
  onCustomDateRange,
  isAr,
}: BusinessHeaderProps) {
  const [customStart, setCustomStart] = useState<Date>();
  const [customEnd, setCustomEnd] = useState<Date>();
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onCustomDateRange({
        startDate: customStart.toISOString(),
        endDate: customEnd.toISOString(),
      });
      setIsCustomOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold">
          {isAr ? 'لوحة الأعمال' : 'Business Dashboard'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAr ? 'تتبع أداء الاستوديو الخاص بك' : 'Track your studio performance'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          value={datePreset}
          onValueChange={(value) => value && onDatePresetChange(value as DatePreset)}
          className="bg-muted p-1 rounded-md"
        >
          {DATE_PRESETS.map((preset) => (
            <ToggleGroupItem
              key={preset.value}
              value={preset.value}
              className="data-[state=on]:bg-background px-3 py-1.5 text-sm"
            >
              {isAr ? preset.labelAr : preset.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={datePreset === 'custom' ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              {datePreset === 'custom' && customStart && customEnd ? (
                <span className="text-xs">
                  {format(customStart, 'MMM d')} - {format(customEnd, 'MMM d')}
                </span>
              ) : (
                <span>{isAr ? 'مخصص' : 'Custom'}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="end">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-2">
                    {isAr ? 'من' : 'Start Date'}
                  </p>
                  <Calendar
                    mode="single"
                    selected={customStart}
                    onSelect={setCustomStart}
                    disabled={(date) => date > new Date()}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">
                    {isAr ? 'إلى' : 'End Date'}
                  </p>
                  <Calendar
                    mode="single"
                    selected={customEnd}
                    onSelect={setCustomEnd}
                    disabled={(date) =>
                      date > new Date() || (customStart ? date < customStart : false)
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsCustomOpen(false)}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleCustomApply}
                  disabled={!customStart || !customEnd}
                >
                  {isAr ? 'تطبيق' : 'Apply'}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
