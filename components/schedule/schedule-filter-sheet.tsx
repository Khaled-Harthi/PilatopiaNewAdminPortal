'use client';

import { SlidersHorizontal, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface ScheduleFilterSheetProps {
  // Filter options
  instructorOptions: string[];
  classTypeOptions: string[];
  // Selected filters
  selectedInstructors: string[];
  selectedClassTypes: string[];
  // Filter handlers
  onInstructorsChange: (selected: string[]) => void;
  onClassTypesChange: (selected: string[]) => void;
  // Locale
  locale: string;
}

export function ScheduleFilterSheet({
  instructorOptions,
  classTypeOptions,
  selectedInstructors,
  selectedClassTypes,
  onInstructorsChange,
  onClassTypesChange,
  locale,
}: ScheduleFilterSheetProps) {
  const isRTL = locale === 'ar';

  // Count active filters
  const activeFilterCount = selectedInstructors.length + selectedClassTypes.length;

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

  // Clear all filters
  const handleClearAll = () => {
    onInstructorsChange([]);
    onClassTypesChange([]);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 px-3"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm">{isRTL ? 'فلتر' : 'Filter'}</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto p-0 rounded-t-xl [&>button]:hidden">
        {/* Accessibility title (visually hidden description) */}
        <SheetDescription className="sr-only">
          {isRTL ? 'فلترة الجدول حسب المدرب ونوع الحصة' : 'Filter schedule by instructor and class type'}
        </SheetDescription>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10">
          <SheetTitle className="text-base font-semibold">
            {isRTL ? 'الفلاتر' : 'Filters'}
          </SheetTitle>
          {activeFilterCount > 0 && (
            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleClearAll}
            >
              {isRTL ? 'مسح الكل' : 'Clear all'}
            </button>
          )}
        </div>

        {/* Filter Sections */}
        <div className="p-4 space-y-6">
          {/* Instructor Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isRTL ? 'المدرب' : 'Instructor'}
              </span>
              {selectedInstructors.length > 0 && (
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => onInstructorsChange([])}
                >
                  {isRTL ? 'مسح' : 'Clear'}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {instructorOptions.map((option) => {
                const isSelected = selectedInstructors.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleOption(option, selectedInstructors, onInstructorsChange)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    )}
                  >
                    {option}
                  </button>
                );
              })}
              {instructorOptions.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  {isRTL ? 'لا توجد خيارات' : 'No options available'}
                </span>
              )}
            </div>
          </div>

          {/* Class Type Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isRTL ? 'نوع الحصة' : 'Class Type'}
              </span>
              {selectedClassTypes.length > 0 && (
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => onClassTypesChange([])}
                >
                  {isRTL ? 'مسح' : 'Clear'}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {classTypeOptions.map((option) => {
                const isSelected = selectedClassTypes.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleOption(option, selectedClassTypes, onClassTypesChange)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    )}
                  >
                    {option}
                  </button>
                );
              })}
              {classTypeOptions.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  {isRTL ? 'لا توجد خيارات' : 'No options available'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Safe area padding for mobile */}
        <div className="h-6" />
      </SheetContent>
    </Sheet>
  );
}
