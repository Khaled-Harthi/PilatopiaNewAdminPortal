'use client';

import { format, addWeeks, subWeeks, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScheduleFilterSheet } from './schedule-filter-sheet';

export type HourRangeMode = 'auto' | 'peak' | 'all';

interface ScheduleToolbarProps {
  // Week navigation
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  // Filter options
  instructorOptions: string[];
  classTypeOptions: string[];
  // Selected filters
  selectedInstructors: string[];
  selectedClassTypes: string[];
  // Filter handlers
  onInstructorsChange: (selected: string[]) => void;
  onClassTypesChange: (selected: string[]) => void;
  // Hour range
  hourRangeMode: HourRangeMode;
  onHourRangeModeChange: (mode: HourRangeMode) => void;
  // Add button
  onAddClick: () => void;
  // Locale
  locale: string;
}

export function ScheduleToolbar({
  currentWeek,
  onWeekChange,
  instructorOptions,
  classTypeOptions,
  selectedInstructors,
  selectedClassTypes,
  onInstructorsChange,
  onClassTypesChange,
  hourRangeMode,
  onHourRangeModeChange,
  onAddClick,
  locale,
}: ScheduleToolbarProps) {
  // Get week dates (Sun-Sat)
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const handlePrevWeek = () => {
    onWeekChange(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(currentWeek, 1));
  };

  // Format date range
  const formatDateRange = () => {
    const startMonth = format(weekStart, 'MMM');
    const endMonth = format(weekEnd, 'MMM');
    const startDay = format(weekStart, 'd');
    const endDay = format(weekEnd, 'd');
    const year = format(weekEnd, 'yyyy');

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  };

  // Helper to toggle option in multi-select
  const toggleOption = (
    value: string,
    selected: string[],
    onChange: (selected: string[]) => void
  ) => {
    const updated = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(updated);
  };

  // Get display text for multi-select
  const getDisplayText = (selected: string[], placeholder: string) => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) return selected[0];
    return `${selected.length} selected`;
  };

  return (
    <>
      {/* Mobile Toolbar - Single row with week nav + filter button */}
      <div className="md:hidden container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Week Navigator */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-center">
              {formatDateRange()}
            </span>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Sheet Button */}
          <ScheduleFilterSheet
            instructorOptions={instructorOptions}
            classTypeOptions={classTypeOptions}
            selectedInstructors={selectedInstructors}
            selectedClassTypes={selectedClassTypes}
            onInstructorsChange={onInstructorsChange}
            onClassTypesChange={onClassTypesChange}
            locale={locale}
          />
        </div>
      </div>

      {/* Desktop Toolbar - Full layout with all controls inline */}
      <div className="hidden md:block container mx-auto px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Week Navigator + Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Week Navigator */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handlePrevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[160px] text-center">
                {formatDateRange()}
              </span>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-border" />

            {/* Instructor Filter - styled to match SelectTrigger */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="relative flex items-center justify-between gap-2 rounded-md bg-muted hover:bg-muted/80 dark:bg-muted/30 dark:hover:bg-muted/50 px-3 py-2 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] h-9 min-w-[160px]"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="text-muted-foreground">{locale === 'ar' ? 'المدربين:' : 'Instructor:'}</span>
                    <span className="truncate">
                      {getDisplayText(selectedInstructors, locale === 'ar' ? 'الكل' : 'All')}
                    </span>
                  </span>
                  <span className="absolute top-0 bottom-0 right-9 w-px bg-border" />
                  <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-1 shadow-none" align="start">
                {/* All option */}
                <div
                  role="option"
                  aria-selected={selectedInstructors.length === 0}
                  onClick={() => onInstructorsChange([])}
                  className="relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 px-2 pr-8 text-sm outline-hidden select-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground"
                >
                  {locale === 'ar' ? 'الكل' : 'All'}
                  <span className="absolute right-3 flex size-3.5 items-center justify-center">
                    {selectedInstructors.length === 0 && <Check className="size-4" />}
                  </span>
                </div>
                {instructorOptions.map((option) => (
                  <div
                    key={option}
                    role="option"
                    aria-selected={selectedInstructors.includes(option)}
                    onClick={() => toggleOption(option, selectedInstructors, onInstructorsChange)}
                    className="relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 px-2 pr-8 text-sm outline-hidden select-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground"
                  >
                    <span className="truncate">{option}</span>
                    <span className="absolute right-3 flex size-3.5 items-center justify-center">
                      {selectedInstructors.includes(option) && <Check className="size-4" />}
                    </span>
                  </div>
                ))}
              </PopoverContent>
            </Popover>

            {/* Class Type Filter - styled to match SelectTrigger */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="relative flex items-center justify-between gap-2 rounded-md bg-muted hover:bg-muted/80 dark:bg-muted/30 dark:hover:bg-muted/50 px-3 py-2 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] h-9 min-w-[160px]"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="text-muted-foreground">{locale === 'ar' ? 'النوع:' : 'Class Type:'}</span>
                    <span className="truncate">
                      {getDisplayText(selectedClassTypes, locale === 'ar' ? 'الكل' : 'All')}
                    </span>
                  </span>
                  <span className="absolute top-0 bottom-0 right-9 w-px bg-border" />
                  <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-1 shadow-none" align="start">
                {/* All option */}
                <div
                  role="option"
                  aria-selected={selectedClassTypes.length === 0}
                  onClick={() => onClassTypesChange([])}
                  className="relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 px-2 pr-8 text-sm outline-hidden select-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground"
                >
                  {locale === 'ar' ? 'الكل' : 'All'}
                  <span className="absolute right-3 flex size-3.5 items-center justify-center">
                    {selectedClassTypes.length === 0 && <Check className="size-4" />}
                  </span>
                </div>
                {classTypeOptions.map((option) => (
                  <div
                    key={option}
                    role="option"
                    aria-selected={selectedClassTypes.includes(option)}
                    onClick={() => toggleOption(option, selectedClassTypes, onClassTypesChange)}
                    className="relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 px-2 pr-8 text-sm outline-hidden select-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground"
                  >
                    <span className="truncate">{option}</span>
                    <span className="absolute right-3 flex size-3.5 items-center justify-center">
                      {selectedClassTypes.includes(option) && <Check className="size-4" />}
                    </span>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          {/* Right: Hour Range + Add Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {locale === 'ar' ? 'الساعات:' : 'Hours:'}
              </span>
              <Select
                value={hourRangeMode}
                onValueChange={(value) => onHourRangeModeChange(value as HourRangeMode)}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    {locale === 'ar' ? 'تلقائي' : 'Auto'}
                  </SelectItem>
                  <SelectItem value="peak">
                    {locale === 'ar' ? 'ساعات الذروة' : 'Peak (2-8 PM)'}
                  </SelectItem>
                  <SelectItem value="all">
                    {locale === 'ar' ? 'كل الساعات' : 'All (6AM-9PM)'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={onAddClick} size="sm" className="gap-2 h-9">
              <Plus className="h-4 w-4" />
              {locale === 'ar' ? 'إضافة' : 'Add'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
