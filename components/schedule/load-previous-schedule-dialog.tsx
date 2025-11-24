'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, subWeeks, getDay, getHours } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { ClassConfiguration } from './configuration-card';
import { useClasses } from '@/lib/schedule/hooks';
import type { PilatesClass } from '@/lib/schedule/types';

const CONFIG_COLORS = [
  'hsl(221 83% 53%)', // blue
  'hsl(142 76% 36%)', // green
  'hsl(48 96% 53%)',  // yellow
  'hsl(262 83% 58%)', // purple
  'hsl(25 95% 53%)',  // orange
];

interface ScheduleTemplate {
  configurations: ClassConfiguration[];
  selectedSlots: Record<number, Record<number, Set<string>>>;
}

interface AvailableWeek {
  startDate: string; // ISO string
  classCount: number;
}

interface LoadPreviousScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoad: (template: ScheduleTemplate) => void;
  locale: string;
}

export function LoadPreviousScheduleDialog({
  open,
  onOpenChange,
  onLoad,
  locale,
}: LoadPreviousScheduleDialogProps) {
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null);

  // Generate list of weeks (current week + last 7 weeks)
  const availableWeeks = useMemo(() => {
    const weeks: AvailableWeek[] = [];
    const today = new Date();
    for (let i = 0; i <= 7; i++) {
      const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 0 });
      weeks.push({
        startDate: weekStart.toISOString(),
        classCount: 0, // Will be populated from API response
      });
    }
    return weeks;
  }, []);

  // Auto-select first week when dialog opens
  useEffect(() => {
    if (open && availableWeeks.length > 0 && !selectedWeekStart) {
      setSelectedWeekStart(availableWeeks[0].startDate);
    }
  }, [open, availableWeeks, selectedWeekStart]);

  // Fetch classes for selected week
  const selectedWeekStartDate = selectedWeekStart ? new Date(selectedWeekStart) : null;
  const selectedWeekEndDate = selectedWeekStartDate
    ? endOfWeek(selectedWeekStartDate, { weekStartsOn: 0 })
    : null;

  const {
    data: classesResponse,
    isLoading: isLoadingTemplate,
  } = useClasses(
    selectedWeekStartDate ? format(selectedWeekStartDate, 'yyyy-MM-dd') : '',
    selectedWeekEndDate ? format(selectedWeekEndDate, 'yyyy-MM-dd') : '',
    open && !!selectedWeekStart // Only fetch when dialog is open and week is selected
  );

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedWeekStart(null);
    }
  }, [open]);

  // Transform API response into template format
  const template = useMemo<ScheduleTemplate | null>(() => {
    if (!classesResponse || !classesResponse.classes || classesResponse.classes.length === 0) {
      return null;
    }

    const classes = classesResponse.classes;

    // Group classes by unique configuration (class_type_id + instructor_id + class_room_id)
    const configMap = new Map<string, {
      classTypeId: number;
      instructorId: number;
      classRoomId: number;
      capacity: number;
      durationMinutes: number;
      classTypeName: string;
      instructorName: string;
      roomName: string;
      classes: PilatesClass[];
    }>();

    classes.forEach((cls) => {
      const key = `${cls.class_type_id}-${cls.instructor_id}-${cls.class_room_id}`;
      if (!configMap.has(key)) {
        configMap.set(key, {
          classTypeId: cls.class_type_id,
          instructorId: cls.instructor_id,
          classRoomId: cls.class_room_id || 0,
          capacity: cls.capacity,
          durationMinutes: cls.duration_minutes,
          classTypeName: cls.name || cls.class_type || 'Unknown',
          instructorName: cls.instructor,
          roomName: cls.class_room_name,
          classes: [],
        });
      }
      configMap.get(key)!.classes.push(cls);
    });

    // Create configurations with unique IDs and colors
    const configurations: ClassConfiguration[] = Array.from(configMap.values()).map((config, index) => ({
      id: `config-${index}`,
      classTypeId: config.classTypeId,
      instructorId: config.instructorId,
      classRoomId: config.classRoomId,
      capacity: config.capacity,
      durationMinutes: config.durationMinutes,
      color: CONFIG_COLORS[index % CONFIG_COLORS.length],
      classTypeName: config.classTypeName,
      instructorName: config.instructorName,
      roomName: config.roomName,
    }));

    // Build selectedSlots structure
    const selectedSlots: Record<number, Record<number, Set<string>>> = {};

    configMap.forEach((config, key) => {
      const configIndex = Array.from(configMap.keys()).indexOf(key);
      const configId = `config-${configIndex}`;

      config.classes.forEach((cls) => {
        const date = new Date(cls.schedule_time);
        const dayIndex = getDay(date); // 0 = Sunday, 1 = Monday, etc.
        const hour = getHours(date);

        if (!selectedSlots[dayIndex]) {
          selectedSlots[dayIndex] = {};
        }
        if (!selectedSlots[dayIndex][hour]) {
          selectedSlots[dayIndex][hour] = new Set();
        }
        selectedSlots[dayIndex][hour].add(configId);
      });
    });

    return {
      configurations,
      selectedSlots,
    };
  }, [classesResponse]);

  // Calculate summary (reuse logic from bulk-create page)
  const configSummaries = useMemo(() => {
    if (!template) return [];

    return template.configurations.map((config) => {
      let slotCount = 0;
      Object.values(template.selectedSlots).forEach((daySlots) => {
        Object.values(daySlots).forEach((configIds) => {
          if (configIds.has(config.id)) {
            slotCount++;
          }
        });
      });
      return { config, slotCount };
    });
  }, [template]);

  const totalSlots = useMemo(() => {
    if (!template) return 0;
    return configSummaries.reduce((sum, { slotCount }) => sum + slotCount, 0);
  }, [configSummaries]);

  // Get hours that have classes for compact display
  const hoursWithClasses = useMemo(() => {
    if (!template) return [];
    const hours = new Set<number>();
    Object.values(template.selectedSlots).forEach((daySlots) => {
      Object.keys(daySlots).forEach((hour) => {
        hours.add(Number(hour));
      });
    });
    return Array.from(hours).sort((a, b) => a - b);
  }, [template]);

  const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const handleLoad = () => {
    if (template) {
      onLoad(template);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {locale === 'ar' ? 'استخدام جدول سابق' : 'Use Previous Schedule'}
          </DialogTitle>
          <DialogDescription>
            {locale === 'ar'
              ? 'اختر أسبوعًا سابقًا لتحميل جدوله'
              : 'Select a previous week to load its schedule'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Week Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {locale === 'ar' ? 'اختر الأسبوع' : 'Select Week'}
            </label>
            <Select
              value={selectedWeekStart || undefined}
              onValueChange={setSelectedWeekStart}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableWeeks.map((week) => {
                  const start = new Date(week.startDate);
                  const end = endOfWeek(start, { weekStartsOn: 0 });
                  return (
                    <SelectItem key={week.startDate} value={week.startDate}>
                      {format(start, 'MMM d')} - {format(end, 'MMM d')}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {selectedWeekStart && (
            <div className="border rounded-md p-4 space-y-3">
              {isLoadingTemplate ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : template ? (
                <>
                  {/* Miniature Time Grid */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {locale === 'ar' ? 'معاينة الجدول' : 'SCHEDULE PREVIEW'}
                    </p>

                    <div className="max-h-[250px] overflow-y-auto border rounded-md bg-muted/20">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-muted/50">
                          <tr>
                            <th className="border-r border-b p-1 text-center w-12"></th>
                            {DAYS.map((day, index) => (
                              <th
                                key={day}
                                className="border-b p-1 text-center font-semibold min-w-[32px]"
                              >
                                {locale === 'ar' ? DAYS_AR[index].slice(0, 3) : day.slice(0, 3)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {hoursWithClasses.map((hour) => (
                            <tr key={hour}>
                              <td className="border-r p-1 text-center font-medium text-muted-foreground bg-muted/30">
                                {hour === 12 ? '12P' : hour > 12 ? `${hour - 12}P` : `${hour}A`}
                              </td>
                              {DAYS.map((_, dayIndex) => {
                                const configSet = template.selectedSlots[dayIndex]?.[hour];
                                const configIds = configSet ? Array.from(configSet) : [];
                                const configsInSlot = template.configurations.filter((c) =>
                                  configIds.includes(c.id)
                                );

                                return (
                                  <td
                                    key={`${dayIndex}-${hour}`}
                                    className="p-1 text-center h-6"
                                  >
                                    {configsInSlot.length > 0 && (
                                      <div className="flex gap-0.5 justify-center items-center flex-wrap">
                                        {configsInSlot.slice(0, 3).map((config) => (
                                          <div
                                            key={config.id}
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: config.color }}
                                          />
                                        ))}
                                        {configIds.length > 3 && (
                                          <span className="text-[9px] ml-0.5">
                                            +{configIds.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Legend */}
                    <div className="space-y-1.5 text-xs">
                      {template.configurations.map((config) => (
                        <div key={config.id} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: config.color }}
                          />
                          <span className="text-muted-foreground truncate">
                            {config.classTypeName} - {config.instructorName} - {config.roomName}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="pt-2 border-t">
                      <p className="text-sm font-semibold">
                        {locale === 'ar' ? 'الإجمالي:' : 'Total:'} {totalSlots}{' '}
                        {locale === 'ar'
                          ? 'إعدادات سيتم تحميلها'
                          : 'configurations will be loaded'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground text-center p-4">
                  {locale === 'ar'
                    ? 'لا يوجد جدول لهذا الأسبوع'
                    : 'No schedule found for this week'}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleLoad}
            disabled={!template || isLoadingTemplate || totalSlots === 0}
          >
            {locale === 'ar' ? 'تحميل الجدول' : 'Load Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
