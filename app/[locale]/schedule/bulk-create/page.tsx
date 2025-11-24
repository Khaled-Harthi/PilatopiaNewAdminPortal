'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ChevronLeft, Plus, AlertTriangle, Info, Download } from 'lucide-react';
import { format, addDays, startOfWeek, nextSunday, addWeeks } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { ConfigurationCard, ClassConfiguration } from '@/components/schedule/configuration-card';
import { LoadPreviousScheduleDialog } from '@/components/schedule/load-previous-schedule-dialog';
import { useInstructors, useClassTypes, useClassRooms, useCreateClasses } from '@/lib/schedule/hooks';
import { toUTC } from '@/lib/schedule/time-utils';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DURATION_OPTIONS = [30, 45, 50, 60, 75, 90];

const CONFIG_COLORS = [
  'hsl(221 83% 53%)', // blue
  'hsl(142 76% 36%)', // green
  'hsl(48 96% 53%)',  // yellow
  'hsl(262 83% 58%)', // purple
  'hsl(25 95% 53%)',  // orange
];

// Generate next 4 Sundays starting from today or next Sunday
function getNextSundays(): Date[] {
  const today = new Date();
  const firstSunday = today.getDay() === 0 ? today : nextSunday(today);
  return Array.from({ length: 4 }, (_, i) => addWeeks(firstSunday, i));
}

const configFormSchema = z.object({
  classTypeId: z.number().min(1, 'Class type is required'),
  instructorId: z.number().min(1, 'Instructor is required'),
  classRoomId: z.number().min(1, 'Room is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  durationMinutes: z.number().min(15, 'Duration must be at least 15 minutes'),
});

type ConfigFormValues = z.infer<typeof configFormSchema>;

export default function BulkCreatePage() {
  const router = useRouter();
  const locale = useLocale();
  const { data: instructors } = useInstructors();
  const { data: classTypes } = useClassTypes();
  const { data: rooms } = useClassRooms();
  const createClasses = useCreateClasses();

  const [configurations, setConfigurations] = useState<ClassConfiguration[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Record<number, Record<number, Set<string>>>>({});
  const [repeatPattern, setRepeatPattern] = useState<'one-time' | 'weekly'>('one-time');
  const [startDate, setStartDate] = useState<Date>(getNextSundays()[0]);
  const [weeks, setWeeks] = useState<number>(2);
  const [showAllHours, setShowAllHours] = useState<boolean>(false);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isLoadPreviousDialogOpen, setIsLoadPreviousDialogOpen] = useState(false);

  const nextSundays = useMemo(() => getNextSundays(), []);

  // Display hours: 2 PM - 8 PM by default, or 6 AM - 9 PM if showAllHours
  const displayHours = useMemo(
    () => showAllHours ? Array.from({ length: 16 }, (_, i) => i + 6) : Array.from({ length: 7 }, (_, i) => i + 14),
    [showAllHours]
  );

  const configForm = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      capacity: 6,
      durationMinutes: 50,
    },
  });

  // Add new configuration
  const handleAddConfig = () => {
    configForm.reset({
      capacity: 6,
      durationMinutes: 50,
    });
    setEditingConfigId(null);
    setIsConfigDialogOpen(true);
  };

  // Edit existing configuration
  const handleEditConfig = (configId: string) => {
    const config = configurations.find((c) => c.id === configId);
    if (config) {
      configForm.reset({
        classTypeId: config.classTypeId,
        instructorId: config.instructorId,
        classRoomId: config.classRoomId,
        capacity: config.capacity,
        durationMinutes: config.durationMinutes,
      });
      setEditingConfigId(configId);
      setIsConfigDialogOpen(true);
    }
  };

  // Save configuration (add or update)
  const handleSaveConfig = (values: ConfigFormValues) => {
    if (editingConfigId) {
      // Update existing
      setConfigurations((prev) =>
        prev.map((c) =>
          c.id === editingConfigId
            ? {
                ...c,
                ...values,
                classTypeName: classTypes?.find((t) => t.id === values.classTypeId)?.name,
                instructorName: instructors?.find((i) => i.id === values.instructorId)?.name,
                roomName: rooms?.find((r) => r.id === values.classRoomId)?.name,
              }
            : c
        )
      );
    } else {
      // Add new
      const newConfig: ClassConfiguration = {
        id: uuidv4(),
        ...values,
        color: CONFIG_COLORS[configurations.length % CONFIG_COLORS.length],
        classTypeName: classTypes?.find((t) => t.id === values.classTypeId)?.name,
        instructorName: instructors?.find((i) => i.id === values.instructorId)?.name,
        roomName: rooms?.find((r) => r.id === values.classRoomId)?.name,
      };
      setConfigurations((prev) => [...prev, newConfig]);
      setActiveConfigId(newConfig.id);
    }
    setIsConfigDialogOpen(false);
  };

  // Remove configuration
  const handleRemoveConfig = (configId: string) => {
    setConfigurations((prev) => prev.filter((c) => c.id !== configId));
    // Remove from selected slots
    setSelectedSlots((prev) => {
      const newSlots = { ...prev };
      Object.keys(newSlots).forEach((dayIndex) => {
        Object.keys(newSlots[Number(dayIndex)]).forEach((hour) => {
          const hourNum = Number(hour);
          newSlots[Number(dayIndex)][hourNum] = new Set(
            Array.from(newSlots[Number(dayIndex)][hourNum]).filter((id) => id !== configId)
          );
        });
      });
      return newSlots;
    });
    if (activeConfigId === configId) {
      setActiveConfigId(configurations[0]?.id || null);
    }
  };

  // Toggle time slot for active configuration
  const toggleSlot = (dayIndex: number, hour: number) => {
    if (!activeConfigId) return;

    setSelectedSlots((prev) => {
      const newSlots = { ...prev };
      // Always create a new object for the day to avoid mutation
      newSlots[dayIndex] = { ...newSlots[dayIndex] || {} };

      if (!newSlots[dayIndex][hour]) {
        newSlots[dayIndex][hour] = new Set();
      }

      const slotSet = new Set(newSlots[dayIndex][hour]);
      if (slotSet.has(activeConfigId)) {
        slotSet.delete(activeConfigId);
      } else {
        slotSet.add(activeConfigId);
      }
      newSlots[dayIndex][hour] = slotSet;
      return newSlots;
    });
  };

  // Toggle entire row
  const toggleRow = (hour: number) => {
    if (!activeConfigId) return;

    const allSelected = DAYS.every(
      (_, dayIndex) => selectedSlots[dayIndex]?.[hour]?.has(activeConfigId)
    );

    setSelectedSlots((prev) => {
      const newSlots = { ...prev };
      DAYS.forEach((_, dayIndex) => {
        // Always create a new object for the day to avoid mutation
        newSlots[dayIndex] = { ...newSlots[dayIndex] || {} };

        if (!newSlots[dayIndex][hour]) {
          newSlots[dayIndex][hour] = new Set();
        }
        const slotSet = new Set(newSlots[dayIndex][hour]);
        if (allSelected) {
          slotSet.delete(activeConfigId);
        } else {
          slotSet.add(activeConfigId);
        }
        newSlots[dayIndex][hour] = slotSet;
      });
      return newSlots;
    });
  };

  // Toggle entire column
  const toggleColumn = (dayIndex: number) => {
    if (!activeConfigId) return;

    const allSelected = displayHours.every((hour) =>
      selectedSlots[dayIndex]?.[hour]?.has(activeConfigId)
    );

    setSelectedSlots((prev) => {
      const newSlots = { ...prev };
      // Always create a new object for the day to avoid mutation
      newSlots[dayIndex] = { ...newSlots[dayIndex] || {} };

      displayHours.forEach((hour) => {
        if (!newSlots[dayIndex][hour]) {
          newSlots[dayIndex][hour] = new Set();
        }
        const slotSet = new Set(newSlots[dayIndex][hour]);
        if (allSelected) {
          slotSet.delete(activeConfigId);
        } else {
          slotSet.add(activeConfigId);
        }
        newSlots[dayIndex][hour] = slotSet;
      });
      return newSlots;
    });
  };

  // Clear all slots
  const clearAll = () => {
    setSelectedSlots({});
  };

  // Load previous schedule
  const handleLoadPreviousSchedule = (template: {
    configurations: ClassConfiguration[];
    selectedSlots: Record<number, Record<number, Set<string>>>;
  }) => {
    // Re-assign IDs to avoid conflicts and update with latest data
    const newConfigurations = template.configurations.map((config, index) => ({
      ...config,
      id: uuidv4(),
      color: CONFIG_COLORS[index % CONFIG_COLORS.length],
      // Refresh names from current data
      classTypeName: classTypes?.find((t) => t.id === config.classTypeId)?.name || config.classTypeName,
      instructorName: instructors?.find((i) => i.id === config.instructorId)?.name || config.instructorName,
      roomName: rooms?.find((r) => r.id === config.classRoomId)?.name || config.roomName,
    }));

    // Create ID mapping (old -> new)
    const idMap: Record<string, string> = {};
    template.configurations.forEach((oldConfig, index) => {
      idMap[oldConfig.id] = newConfigurations[index].id;
    });

    // Remap selectedSlots with new IDs
    const newSelectedSlots: Record<number, Record<number, Set<string>>> = {};
    Object.entries(template.selectedSlots).forEach(([dayIndexStr, daySlots]) => {
      const dayIndex = parseInt(dayIndexStr);
      newSelectedSlots[dayIndex] = {};
      Object.entries(daySlots).forEach(([hourStr, configIds]) => {
        const hour = parseInt(hourStr);
        newSelectedSlots[dayIndex][hour] = new Set(
          Array.from(configIds).map((oldId) => idMap[oldId])
        );
      });
    });

    setConfigurations(newConfigurations);
    setSelectedSlots(newSelectedSlots);
    setActiveConfigId(newConfigurations[0]?.id || null);
  };

  // Calculate slot counts per configuration
  const slotCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    configurations.forEach((config) => {
      counts[config.id] = 0;
    });
    Object.values(selectedSlots).forEach((daySlots) => {
      Object.values(daySlots).forEach((configSet) => {
        configSet.forEach((configId) => {
          if (counts[configId] !== undefined) {
            counts[configId]++;
          }
        });
      });
    });
    return counts;
  }, [selectedSlots, configurations]);

  // Calculate total classes
  const totalClasses = useMemo(() => {
    const totalSlots = Object.values(slotCounts).reduce((sum, count) => sum + count, 0);
    return repeatPattern === 'one-time' ? totalSlots : totalSlots * weeks;
  }, [slotCounts, repeatPattern, weeks]);

  // Detect conflicts (same room, same time)
  const conflicts = useMemo(() => {
    const conflictList: string[] = [];
    Object.entries(selectedSlots).forEach(([dayIndexStr, daySlots]) => {
      const dayIndex = parseInt(dayIndexStr);
      Object.entries(daySlots).forEach(([hourStr, configSet]) => {
        const hour = parseInt(hourStr);
        const configIds = Array.from(configSet);
        if (configIds.length > 1) {
          // Check if any share the same room
          const roomMap: Record<number, string[]> = {};
          configIds.forEach((configId) => {
            const config = configurations.find((c) => c.id === configId);
            if (config) {
              if (!roomMap[config.classRoomId]) {
                roomMap[config.classRoomId] = [];
              }
              roomMap[config.classRoomId].push(config.classTypeName || 'Unknown');
            }
          });
          Object.values(roomMap).forEach((classTypes) => {
            if (classTypes.length > 1) {
              const day = locale === 'ar' ? DAYS_AR[dayIndex] : DAYS[dayIndex];
              const time = hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
              conflictList.push(
                `${day} ${time}: ${classTypes.join(', ')} ${locale === 'ar' ? 'تستخدم نفس الغرفة' : 'share the same room'}`
              );
            }
          });
        }
      });
    });
    return conflictList;
  }, [selectedSlots, configurations, locale]);

  // Generate human-friendly summary
  const configSummaries = useMemo(() => {
    return configurations.map((config) => {
      const slotCount = slotCounts[config.id] || 0;
      return {
        config,
        slotCount,
      };
    }).filter((item) => item.slotCount > 0);
  }, [configurations, slotCounts]);

  // Calculate classes per instructor
  const instructorStats = useMemo(() => {
    const stats = new Map<number, { name: string; count: number }>();

    configSummaries.forEach(({ config, slotCount }) => {
      const existing = stats.get(config.instructorId);
      if (existing) {
        existing.count += slotCount;
      } else {
        stats.set(config.instructorId, {
          name: config.instructorName || '-',
          count: slotCount,
        });
      }
    });

    return Array.from(stats.values()).sort((a, b) => b.count - a.count);
  }, [configSummaries]);

  // Calculate unique days scheduled and end date
  const scheduleInfo = useMemo(() => {
    const uniqueDays = new Set<number>();
    Object.keys(selectedSlots).forEach((dayIndexStr) => {
      const dayIndex = parseInt(dayIndexStr);
      uniqueDays.add(dayIndex);
    });

    const weeksToCreate = repeatPattern === 'one-time' ? 1 : weeks;
    const endDate = addDays(startOfWeek(startDate, { weekStartsOn: 0 }), (weeksToCreate * 7) - 1);

    return {
      uniqueDaysCount: uniqueDays.size,
      endDate,
    };
  }, [selectedSlots, repeatPattern, weeks, startDate]);

  // CSV Download handler
  const handleDownloadCSV = () => {
    if (configurations.length === 0 || totalClasses === 0) {
      alert(locale === 'ar' ? 'لا توجد بيانات للتصدير' : 'No data to export');
      return;
    }

    // CSV Header
    const csvRows = ['date,time,class_type_id,instructor_id,class_room_id,capacity,duration_minutes'];

    const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });
    const weeksToCreate = repeatPattern === 'one-time' ? 1 : weeks;

    // Process each configuration
    configurations.forEach((config) => {
      // Generate all date-time combinations for this config
      for (let weekIndex = 0; weekIndex < weeksToCreate; weekIndex++) {
        Object.entries(selectedSlots).forEach(([dayIndexStr, daySlots]) => {
          const dayIndex = parseInt(dayIndexStr);
          Object.entries(daySlots).forEach(([hourStr, configSet]) => {
            if (configSet.has(config.id)) {
              const hour = parseInt(hourStr);
              const slotDate = addDays(weekStart, weekIndex * 7 + dayIndex);
              const dateStr = format(slotDate, 'yyyy-MM-dd');
              const timeStr = `${hour.toString().padStart(2, '0')}:00`;

              csvRows.push(
                `${dateStr},${timeStr},${config.classTypeId},${config.instructorId},${config.classRoomId},${config.capacity},${config.durationMinutes}`
              );
            }
          });
        });
      }
    });

    // Create and download the CSV file
    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Generate filename with date range
    const startStr = format(startDate, 'MMM-d');
    const endStr = format(scheduleInfo.endDate, 'MMM-d');
    link.download = `schedule-${startStr}-to-${endStr}.csv`;

    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (configurations.length === 0) {
      alert(locale === 'ar' ? 'يرجى إضافة تكوين واحد على الأقل' : 'Please add at least one configuration');
      return;
    }

    if (totalClasses === 0) {
      alert(locale === 'ar' ? 'يرجى تحديد فترة زمنية واحدة على الأقل' : 'Please select at least one time slot');
      return;
    }

    if (conflicts.length > 0) {
      const proceed = confirm(
        locale === 'ar'
          ? `هناك ${conflicts.length} تعارضات. هل تريد المتابعة على أي حال؟`
          : `There are ${conflicts.length} conflicts. Do you want to proceed anyway?`
      );
      if (!proceed) return;
    }

    try {
      const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });
      const weeksToCreate = repeatPattern === 'one-time' ? 1 : weeks;

      // Process each configuration
      for (const config of configurations) {
        const slots: { date: string; time: string }[] = [];

        // Generate all date-time combinations for this config
        for (let weekIndex = 0; weekIndex < weeksToCreate; weekIndex++) {
          Object.entries(selectedSlots).forEach(([dayIndexStr, daySlots]) => {
            const dayIndex = parseInt(dayIndexStr);
            Object.entries(daySlots).forEach(([hourStr, configSet]) => {
              if (configSet.has(config.id)) {
                const hour = parseInt(hourStr);
                const slotDate = addDays(weekStart, weekIndex * 7 + dayIndex);
                const dateStr = format(slotDate, 'yyyy-MM-dd');
                const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                slots.push({ date: dateStr, time: timeStr });
              }
            });
          });
        }

        // Group by time and collect dates
        const timeGroups: Record<string, string[]> = {};
        slots.forEach(({ date, time }) => {
          if (!timeGroups[time]) {
            timeGroups[time] = [];
          }
          timeGroups[time].push(date);
        });

        // Create classes for each time group
        for (const [localTime, dates] of Object.entries(timeGroups)) {
          const { time: utcTime } = toUTC(localTime, dates[0]);

          await createClasses.mutateAsync({
            classesConfig: {
              classTypeId: config.classTypeId,
              instructorId: config.instructorId,
              classRoomId: config.classRoomId,
              capacity: config.capacity,
              durationMinutes: config.durationMinutes,
            },
            dates,
            startTime: utcTime,
          });
        }
      }

      // Navigate back
      router.push(`/${locale}/schedule`);
    } catch (error) {
      console.error('Failed to create classes:', error);
      alert(locale === 'ar' ? 'فشل إنشاء الحصص' : 'Failed to create classes');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">
                  {locale === 'ar' ? 'إنشاء جدول حصص متعدد' : 'Create Bulk Class Schedule'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {locale === 'ar'
                    ? 'أنشئ حصصًا متعددة بتكوينات مختلفة'
                    : 'Create multiple classes with different configurations'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] gap-6">
          {/* Left Panel: Configurations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">
                {locale === 'ar' ? 'التكوينات' : 'Configurations'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddConfig}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {locale === 'ar' ? 'إضافة' : 'Add'}
              </Button>
            </div>

            {configurations.length === 0 ? (
              <div className="space-y-3">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {locale === 'ar'
                      ? 'ابدأ بإضافة تكوين واحد على الأقل'
                      : 'Start by adding at least one configuration'}
                  </AlertDescription>
                </Alert>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsLoadPreviousDialogOpen(true)}
                >
                  {locale === 'ar' ? 'استخدام جدول سابق' : 'Use Previous Schedule'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {configurations.map((config) => (
                  <ConfigurationCard
                    key={config.id}
                    config={config}
                    isActive={activeConfigId === config.id}
                    slotCount={slotCounts[config.id] || 0}
                    onEdit={() => handleEditConfig(config.id)}
                    onRemove={() => handleRemoveConfig(config.id)}
                    onClick={() => setActiveConfigId(activeConfigId === config.id ? null : config.id)}
                    locale={locale}
                  />
                ))}
              </div>
            )}

          </div>

          {/* Middle Panel: Time Slots */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">
                  {locale === 'ar' ? 'تخصيص الأوقات' : 'Time Slot Assignment'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllHours(!showAllHours)}
                >
                  {showAllHours
                    ? (locale === 'ar' ? 'إخفاء' : 'Show less')
                    : (locale === 'ar' ? 'إظهار الكل' : 'Show all hours')}
                </Button>
              </div>

              {/* Active config selector */}
              {configurations.length > 0 && (
                <div>
                    <Label className="text-sm text-muted-foreground">
                      {locale === 'ar' ? 'تعيين الفترات إلى:' : 'Assign slots to:'}
                    </Label>
                    <Select
                      value={activeConfigId || ''}
                      onValueChange={setActiveConfigId}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {configurations.map((config) => (
                          <SelectItem key={config.id} value={config.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: config.color }}
                              />
                              {config.classTypeName} - {config.instructorName}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
              )}

              {/* Time slot grid */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="border p-2 bg-muted/50"></th>
                          {DAYS.map((day, index) => (
                            <th
                              key={day}
                              className="border p-2 bg-muted/50 cursor-pointer hover:bg-muted transition-colors font-semibold"
                              onClick={() => toggleColumn(index)}
                            >
                              {locale === 'ar' ? DAYS_AR[index] : day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {displayHours.map((hour) => (
                          <tr key={hour}>
                            <td
                              className="border p-2 bg-muted/50 text-center cursor-pointer hover:bg-muted transition-colors font-medium"
                              onClick={() => toggleRow(hour)}
                            >
                              {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </td>
                            {DAYS.map((_, dayIndex) => {
                              const configSet = selectedSlots[dayIndex]?.[hour];
                              const configIds = configSet ? Array.from(configSet) : [];
                              const configsInSlot = configurations.filter((c) =>
                                configIds.includes(c.id)
                              );

                              return (
                                <HoverCard key={`${dayIndex}-${hour}`} openDelay={200}>
                                  <HoverCardTrigger asChild>
                                    <td
                                      className={cn(
                                        'border p-2 text-center cursor-pointer transition-colors min-w-[3rem] h-12',
                                        configIds.length > 0 ? '' : 'hover:bg-muted',
                                        activeConfigId && configIds.includes(activeConfigId) && 'bg-accent'
                                      )}
                                      onClick={() => toggleSlot(dayIndex, hour)}
                                    >
                                      {configIds.length > 0 && (
                                        <div className="flex gap-0.5 justify-center items-center flex-wrap">
                                          {configsInSlot.slice(0, 3).map((config) => (
                                            <div
                                              key={config.id}
                                              className="w-2 h-2 rounded-full"
                                              style={{ backgroundColor: config.color }}
                                            />
                                          ))}
                                          {configIds.length > 3 && (
                                            <span className="text-[10px] ml-0.5">
                                              +{configIds.length - 3}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                  </HoverCardTrigger>
                                  {configsInSlot.length > 0 && (
                                    <HoverCardContent className="w-64 p-3" align="start">
                                      <div className="space-y-2">
                                        <div className="font-semibold text-sm">
                                          {locale === 'ar' ? DAYS_AR[dayIndex] : DAYS[dayIndex]}{' '}
                                          {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                                        </div>
                                        <div className="space-y-2 text-sm">
                                          {configsInSlot.map((config) => (
                                            <div
                                              key={config.id}
                                              className="flex items-start gap-2 text-muted-foreground"
                                            >
                                              <div
                                                className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                                                style={{ backgroundColor: config.color }}
                                              />
                                              <div className="flex-1 min-w-0">
                                                <div className="text-foreground font-medium truncate">
                                                  {config.classTypeName}
                                                </div>
                                                <div className="text-xs truncate">
                                                  {config.instructorName} • {config.roomName}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </HoverCardContent>
                                  )}
                                </HoverCard>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4" />
                      {locale === 'ar' ? 'انقر على رؤوس الصفوف/الأعمدة لتحديد الكل' : 'Click row/column headers to select all'}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                    >
                      {locale === 'ar' ? 'مسح الكل' : 'Clear All'}
                    </Button>
                  </div>

                  {/* Conflicts - removed, now shown in summary card above */}
                  {false && conflicts.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-semibold mb-1">
                          {conflicts.length} {locale === 'ar' ? 'تعارضات' : 'conflicts detected'}
                        </div>
                        <ul className="text-xs space-y-1">
                          {conflicts.slice(0, 3).map((conflict, i) => (
                            <li key={i}>• {conflict}</li>
                          ))}
                          {conflicts.length > 3 && (
                            <li>
                              • {locale === 'ar' ? `و ${conflicts.length - 3} أخرى` : `and ${conflicts.length - 3} more`}
                            </li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
            </div>
          </div>

          {/* Right Panel: Duration & Summary */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold">
              {locale === 'ar' ? 'المدة والملخص' : 'Duration & Summary'}
            </h2>

            {/* Repeat Pattern */}
            <div className="rounded-lg border bg-card p-4 space-y-4">
              <h3 className="text-sm font-semibold">
                {locale === 'ar' ? 'نمط التكرار' : 'Repeat Pattern'}
              </h3>
              <RadioGroup
                value={repeatPattern}
                onValueChange={(value) => setRepeatPattern(value as 'one-time' | 'weekly')}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 space-x-reverse gap-2">
                  <RadioGroupItem value="one-time" id="one-time" />
                  <Label htmlFor="one-time" className="text-sm">
                    {locale === 'ar' ? 'لمرة واحدة (أسبوع واحد)' : 'One-time only (1 week)'}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse gap-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="text-sm">
                    {locale === 'ar' ? 'تكرار أسبوعي' : 'Repeat weekly'}
                  </Label>
                </div>
              </RadioGroup>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {locale === 'ar' ? 'الأسبوع' : 'Week'}
                  </Label>
                  <Select
                    value={nextSundays.findIndex(
                      (sunday) => format(sunday, 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd')
                    ).toString()}
                    onValueChange={(value) => {
                      const selectedSunday = nextSundays[parseInt(value)];
                      setStartDate(selectedSunday);
                    }}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {nextSundays.map((sunday, index) => {
                        const today = new Date();
                        const daysUntil = Math.ceil((sunday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <SelectItem key={index} value={index.toString()}>
                            {index === 0
                              ? `${format(sunday, "'Sun, 'MMM do")} (in ${daysUntil} days)`
                              : format(sunday, "'Sun, 'MMM do")}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {repeatPattern === 'weekly' && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {locale === 'ar' ? 'لمدة' : 'For'}
                    </Label>
                    <Select
                      value={weeks.toString()}
                      onValueChange={(value) => setWeeks(Number(value))}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {locale === 'ar' ? 'أسبوع' : 'weeks'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Card */}
            {configSummaries.length > 0 ? (
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">
                          {locale === 'ar' ? 'الجدول الأسبوعي' : 'WEEKLY SCHEDULE'}
                        </p>
                        <ul className="space-y-1.5 text-sm">
                          {configSummaries.map(({ config, slotCount }) => (
                            <li key={config.id} className="flex items-start gap-2">
                              <span className="text-muted-foreground">•</span>
                              <span>
                                {slotCount} {config.classTypeName} {locale === 'ar' ? 'حصص مع' : 'classes with'}{' '}
                                {config.instructorName} {locale === 'ar' ? 'في' : 'in'} {config.roomName}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {instructorStats.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">
                            {locale === 'ar' ? 'المدربين' : 'INSTRUCTORS'}
                          </p>
                          <ul className="space-y-1.5 text-sm">
                            {instructorStats.map((instructor, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-muted-foreground">•</span>
                                <span>
                                  {instructor.count} {locale === 'ar' ? 'حصص لـ' : 'classes by'} {instructor.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {totalClasses > 0 && (
                        <>
                          <div className="pt-2 border-t">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              {locale === 'ar' ? 'المدة' : 'DURATION'}
                            </p>
                            {repeatPattern === 'weekly' && (
                              <p className="text-sm text-muted-foreground">
                                {locale === 'ar' ? `يتكرر لمدة ${weeks} أسابيع` : `Repeats for ${weeks} weeks`}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {format(startDate, 'EEEE, MMM do')}
                              {' - '}
                              {format(scheduleInfo.endDate, 'EEEE, MMM do')}
                            </p>
                          </div>

                          <div className="pt-2 border-t">
                            <p className="text-base font-semibold">
                              {locale === 'ar' ? 'الإجمالي:' : 'Total:'} {totalClasses} {locale === 'ar' ? 'حصة ستُنشأ' : 'classes will be created'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {conflicts.length > 0 && (
                      <Alert variant="destructive" className="mt-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-semibold text-sm mb-1">
                            {conflicts.length} {locale === 'ar' ? 'تعارضات' : 'Conflicts Detected'}
                          </div>
                          <ul className="text-xs space-y-1">
                            {conflicts.slice(0, 3).map((conflict, i) => (
                              <li key={i}>• {conflict}</li>
                            ))}
                            {conflicts.length > 3 && (
                              <li>
                                • {locale === 'ar' ? `و ${conflicts.length - 3} أخرى` : `and ${conflicts.length - 3} more`}
                              </li>
                            )}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {locale === 'ar'
                    ? 'أضف تكوينات وحدد الفترات الزمنية لرؤية ملخص جدولك'
                    : 'Add configurations and select time slots to see your schedule summary'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 border-t bg-card mt-6 z-10">
        <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                {totalClasses > 0 && (
                  <div className="font-semibold">
                    {locale === 'ar'
                      ? `سيتم إنشاء ${totalClasses} حصة عبر ${configurations.length} تكوينات`
                      : `Creating ${totalClasses} classes across ${configurations.length} configurations`}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleDownloadCSV}
                  disabled={configurations.length === 0 || totalClasses === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {locale === 'ar' ? 'تنزيل CSV' : 'Download CSV'}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createClasses.isPending || configurations.length === 0 || totalClasses === 0}
                >
                  {createClasses.isPending
                    ? (locale === 'ar' ? 'جاري الإنشاء...' : 'Creating...')
                    : (locale === 'ar' ? 'إنشاء الحصص' : 'Create Classes')}
                </Button>
              </div>
            </div>
        </div>
      </footer>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingConfigId
                ? (locale === 'ar' ? 'تعديل التكوين' : 'Edit Configuration')
                : (locale === 'ar' ? 'إضافة تكوين' : 'Add Configuration')}
            </DialogTitle>
            <DialogDescription>
              {locale === 'ar'
                ? 'حدد تفاصيل الحصة لهذا التكوين'
                : 'Define the class details for this configuration'}
            </DialogDescription>
          </DialogHeader>
          <Form {...configForm}>
            <form onSubmit={configForm.handleSubmit(handleSaveConfig)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={configForm.control}
                  name="classTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{locale === 'ar' ? 'نوع الحصة' : 'Class Type'}</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={locale === 'ar' ? 'اختر' : 'Select'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classTypes?.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={configForm.control}
                  name="instructorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{locale === 'ar' ? 'المدرب' : 'Instructor'}</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={locale === 'ar' ? 'اختر' : 'Select'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {instructors?.map((instructor) => (
                            <SelectItem key={instructor.id} value={instructor.id.toString()}>
                              {instructor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={configForm.control}
                  name="classRoomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{locale === 'ar' ? 'الغرفة' : 'Room'}</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={locale === 'ar' ? 'اختر' : 'Select'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rooms?.map((room) => (
                            <SelectItem key={room.id} value={room.id.toString()}>
                              {room.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={configForm.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{locale === 'ar' ? 'المدة' : 'Duration'}</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DURATION_OPTIONS.map((duration) => (
                            <SelectItem key={duration} value={duration.toString()}>
                              {duration} {locale === 'ar' ? 'دقيقة' : 'min'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={configForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{locale === 'ar' ? 'السعة' : 'Capacity'}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit">
                  {editingConfigId
                    ? (locale === 'ar' ? 'حفظ' : 'Save')
                    : (locale === 'ar' ? 'إضافة' : 'Add')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Load Previous Schedule Dialog */}
      <LoadPreviousScheduleDialog
        open={isLoadPreviousDialogOpen}
        onOpenChange={setIsLoadPreviousDialogOpen}
        onLoad={handleLoadPreviousSchedule}
        locale={locale}
      />
    </div>
  );
}
