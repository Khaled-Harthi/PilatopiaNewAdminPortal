'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocale } from 'next-intl';
import { CalendarIcon, Info, AlertTriangle } from 'lucide-react';
import { format, addDays, startOfWeek, nextSunday, addWeeks } from 'date-fns';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInstructors, useClassTypes, useClassRooms, useCreateClasses } from '@/lib/schedule/hooks';
import { toUTC } from '@/lib/schedule/time-utils';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  classTypeId: z.number().min(1, 'Class type is required'),
  instructorId: z.number().min(1, 'Instructor is required'),
  classRoomId: z.number().min(1, 'Room is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  durationMinutes: z.number().min(15, 'Duration must be at least 15 minutes'),
  repeatPattern: z.enum(['one-time', 'weekly']),
  startDate: z.date({ required_error: 'Start date is required' }),
  weeks: z.number().min(1).max(52).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BulkClassSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DURATION_OPTIONS = [30, 45, 50, 60, 75, 90];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// Generate next 4 Sundays starting from today or next Sunday
function getNextSundays(): Date[] {
  const today = new Date();
  const firstSunday = today.getDay() === 0 ? today : nextSunday(today);

  return Array.from({ length: 4 }, (_, i) => addWeeks(firstSunday, i));
}

export function BulkClassSheet({ open, onOpenChange }: BulkClassSheetProps) {
  const locale = useLocale();
  const { data: instructors, isLoading: instructorsLoading } = useInstructors();
  const { data: classTypes, isLoading: classTypesLoading } = useClassTypes();
  const { data: rooms, isLoading: roomsLoading } = useClassRooms();
  const createClasses = useCreateClasses();

  // Time slot selection state: { dayIndex: { hour: boolean } }
  const [selectedSlots, setSelectedSlots] = useState<Record<number, Record<number, boolean>>>({});

  // Get next 4 Sundays
  const nextSundays = useMemo(() => getNextSundays(), []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      capacity: 6,
      durationMinutes: 50,
      repeatPattern: 'one-time',
      startDate: nextSundays[0],
      weeks: 12,
    },
  });

  const repeatPattern = form.watch('repeatPattern');
  const weeks = form.watch('weeks');
  const startDate = form.watch('startDate');
  const classTypeId = form.watch('classTypeId');
  const instructorId = form.watch('instructorId');

  // Calculate selected slots count
  const selectedSlotsCount = useMemo(() => {
    let count = 0;
    Object.values(selectedSlots).forEach((daySlots) => {
      count += Object.values(daySlots).filter(Boolean).length;
    });
    return count;
  }, [selectedSlots]);

  // Calculate total classes to be created
  const totalClasses = useMemo(() => {
    if (repeatPattern === 'one-time') {
      return selectedSlotsCount;
    }
    return selectedSlotsCount * (weeks || 1);
  }, [selectedSlotsCount, repeatPattern, weeks]);

  // Generate confirmation message
  const confirmationMessage = useMemo(() => {
    if (totalClasses === 0 || !startDate || !classTypeId || !instructorId) {
      return null;
    }

    const classType = classTypes?.find((t) => t.id === classTypeId);
    const instructor = instructors?.find((i) => i.id === instructorId);

    if (!classType || !instructor) {
      return null;
    }

    const weekStart = startOfWeek(startDate, { weekStartsOn: 0 }); // Sunday
    const weeksToCreate = repeatPattern === 'one-time' ? 1 : (weeks || 1);
    const lastWeekStart = addWeeks(weekStart, weeksToCreate - 1);
    const weekEnd = addDays(lastWeekStart, 6); // Saturday

    const startStr = format(weekStart, 'EEE MMM do'); // "Sun Nov 23rd"
    const endStr = format(weekEnd, 'EEE MMM do'); // "Sat Nov 29th"

    if (locale === 'ar') {
      return `سيتم إنشاء ${totalClasses} حصة من ${classType.name} مع ${instructor.name} بدءاً من ${startStr} حتى ${endStr}`;
    }

    return `This will create ${totalClasses} ${classType.name} with ${instructor.name} starting ${startStr} until ${endStr}`;
  }, [totalClasses, startDate, classTypeId, instructorId, classTypes, instructors, repeatPattern, weeks, locale]);

  // Toggle a specific time slot
  const toggleSlot = (dayIndex: number, hour: number) => {
    setSelectedSlots((prev) => {
      const newSlots = { ...prev };
      if (!newSlots[dayIndex]) {
        newSlots[dayIndex] = {};
      }
      newSlots[dayIndex] = {
        ...newSlots[dayIndex],
        [hour]: !newSlots[dayIndex][hour],
      };
      return newSlots;
    });
  };

  // Toggle entire row (all days for a specific hour)
  const toggleRow = (hour: number) => {
    const allSelected = DAYS.every((_, dayIndex) => selectedSlots[dayIndex]?.[hour]);

    setSelectedSlots((prev) => {
      const newSlots = { ...prev };
      DAYS.forEach((_, dayIndex) => {
        if (!newSlots[dayIndex]) {
          newSlots[dayIndex] = {};
        }
        newSlots[dayIndex] = {
          ...newSlots[dayIndex],
          [hour]: !allSelected,
        };
      });
      return newSlots;
    });
  };

  // Toggle entire column (all hours for a specific day)
  const toggleColumn = (dayIndex: number) => {
    const allSelected = HOURS.every((hour) => selectedSlots[dayIndex]?.[hour]);

    setSelectedSlots((prev) => {
      const newSlots = { ...prev };
      if (!newSlots[dayIndex]) {
        newSlots[dayIndex] = {};
      }
      HOURS.forEach((hour) => {
        newSlots[dayIndex][hour] = !allSelected;
      });
      return newSlots;
    });
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedSlots({});
  };

  // Quick pattern: Weekday mornings (Mon-Fri, 6-9 AM)
  const selectWeekdayMornings = () => {
    setSelectedSlots((prev) => {
      const newSlots = { ...prev };
      [1, 2, 3, 4, 5].forEach((dayIndex) => { // Mon-Fri
        if (!newSlots[dayIndex]) {
          newSlots[dayIndex] = {};
        }
        [6, 7, 8, 9].forEach((hour) => {
          newSlots[dayIndex][hour] = true;
        });
      });
      return newSlots;
    });
  };

  // Quick pattern: Mon/Wed/Fri (all hours)
  const selectMWF = () => {
    setSelectedSlots((prev) => {
      const newSlots = { ...prev };
      [1, 3, 5].forEach((dayIndex) => { // Mon, Wed, Fri
        if (!newSlots[dayIndex]) {
          newSlots[dayIndex] = {};
        }
        HOURS.forEach((hour) => {
          newSlots[dayIndex][hour] = true;
        });
      });
      return newSlots;
    });
  };

  // Quick pattern: Weekend afternoons (Sat-Sun, 12-6 PM)
  const selectWeekendAfternoons = () => {
    setSelectedSlots((prev) => {
      const newSlots = { ...prev };
      [6, 0].forEach((dayIndex) => { // Sat, Sun
        if (!newSlots[dayIndex]) {
          newSlots[dayIndex] = {};
        }
        [12, 13, 14, 15, 16, 17, 18].forEach((hour) => {
          newSlots[dayIndex][hour] = true;
        });
      });
      return newSlots;
    });
  };

  const onSubmit = async (values: FormValues) => {
    if (selectedSlotsCount === 0) {
      alert(locale === 'ar' ? 'يرجى تحديد فترة زمنية واحدة على الأقل' : 'Please select at least one time slot');
      return;
    }

    try {
      // Convert selected slots to dates and times
      const slots: { date: string; time: string }[] = [];

      // Get the start of the week for the selected start date
      const weekStart = startOfWeek(values.startDate, { weekStartsOn: 0 }); // Sunday

      // Calculate number of weeks to create
      const weeksToCreate = values.repeatPattern === 'one-time' ? 1 : (values.weeks || 1);

      // Generate all date-time combinations
      for (let weekIndex = 0; weekIndex < weeksToCreate; weekIndex++) {
        Object.entries(selectedSlots).forEach(([dayIndexStr, daySlots]) => {
          const dayIndex = parseInt(dayIndexStr);
          Object.entries(daySlots).forEach(([hourStr, isSelected]) => {
            if (isSelected) {
              const hour = parseInt(hourStr);

              // Calculate the date for this slot
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
            classTypeId: values.classTypeId,
            instructorId: values.instructorId,
            classRoomId: values.classRoomId,
            capacity: values.capacity,
            durationMinutes: values.durationMinutes,
          },
          dates,
          startTime: utcTime,
        });
      }

      // Close sheet and reset form
      onOpenChange(false);
      form.reset();
      setSelectedSlots({});
    } catch (error) {
      console.error('Failed to create classes:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={locale === 'ar' ? 'left' : 'right'}
        className="sm:max-w-4xl overflow-y-auto"
      >
        <SheetHeader className="space-y-3 pb-6">
          <SheetTitle>{locale === 'ar' ? 'إنشاء جدول حصص' : 'Create Class Schedule'}</SheetTitle>
          <SheetDescription>
            {locale === 'ar'
              ? 'قم بإنشاء حصص متعددة بنقرة واحدة'
              : 'Create multiple classes at once'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 mt-6">
            {/* Step 1: Define Class Details */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-foreground">
                {locale === 'ar' ? 'الخطوة 1: تفاصيل الحصة' : 'Step 1: Define Class Details'}
              </h3>

              <div className="space-y-5">
                {/* Class Type and Instructor - Side by side on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="classTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{locale === 'ar' ? 'نوع الحصة' : 'Class Type'}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                          disabled={classTypesLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={locale === 'ar' ? 'اختر نوع الحصة' : 'Select class type'} />
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
                    control={form.control}
                    name="instructorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{locale === 'ar' ? 'المدرب' : 'Instructor'}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString()}
                          disabled={instructorsLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={locale === 'ar' ? 'اختر المدرب' : 'Select instructor'} />
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

                {/* Duration and Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{locale === 'ar' ? 'المدة' : 'Duration'}</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DURATION_OPTIONS.map((duration) => (
                              <SelectItem key={duration} value={duration.toString()}>
                                {duration} {locale === 'ar' ? 'دقيقة' : 'minutes'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
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
                </div>

                {/* Room */}
                <FormField
                  control={form.control}
                  name="classRoomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{locale === 'ar' ? 'الغرفة' : 'Room'}</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                        disabled={roomsLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={locale === 'ar' ? 'اختر الغرفة' : 'Select room'} />
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
              </div>
            </div>

            {/* Step 2: Select Time Slots */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-foreground">
                {locale === 'ar' ? 'الخطوة 2: اختر الأوقات' : 'Step 2: Select Time Slots'}
              </h3>

              <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  {locale === 'ar' ? 'انقر لتحديد أوقات متعددة:' : 'Click to select multiple times:'}
                </p>

                {/* Quick patterns */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={selectWeekdayMornings}
                  >
                    {locale === 'ar' ? 'صباح أيام الأسبوع' : 'Weekday Mornings'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={selectMWF}
                  >
                    {locale === 'ar' ? 'الإثنين/الأربعاء/الجمعة' : 'Mon/Wed/Fri'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={selectWeekendAfternoons}
                  >
                    {locale === 'ar' ? 'عصر عطلة نهاية الأسبوع' : 'Weekend Afternoons'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={clearAll}
                  >
                    {locale === 'ar' ? 'مسح الكل' : 'Clear All'}
                  </Button>
                </div>

                {/* Time slot grid */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr>
                        <th className="border p-1 bg-muted/50"></th>
                        {DAYS.map((day, index) => (
                          <th
                            key={day}
                            className="border p-1 bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => toggleColumn(index)}
                          >
                            {locale === 'ar' ? DAYS_AR[index] : day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {HOURS.map((hour) => (
                        <tr key={hour}>
                          <td
                            className="border p-1 bg-muted/50 text-center cursor-pointer hover:bg-muted transition-colors font-medium"
                            onClick={() => toggleRow(hour)}
                          >
                            {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                          </td>
                          {DAYS.map((_, dayIndex) => (
                            <td
                              key={`${dayIndex}-${hour}`}
                              className={cn(
                                'border p-1 text-center cursor-pointer transition-colors',
                                selectedSlots[dayIndex]?.[hour]
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-muted'
                              )}
                              onClick={() => toggleSlot(dayIndex, hour)}
                            >
                              {selectedSlots[dayIndex]?.[hour] ? '✓' : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  {locale === 'ar' ? 'انقر على رؤوس الصفوف/الأعمدة لتحديد الكل' : 'Click row/column headers to select all'}
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {locale === 'ar' ? 'المحدد:' : 'Selected:'} {selectedSlotsCount} {locale === 'ar' ? 'فترة' : 'time slots'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Step 3: Repeat Pattern */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-foreground">
                {locale === 'ar' ? 'الخطوة 3: نمط التكرار' : 'Step 3: Repeat Pattern'}
              </h3>

              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="repeatPattern"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="one-time" id="one-time" />
                            <Label htmlFor="one-time">
                              {locale === 'ar' ? 'لمرة واحدة (أسبوع واحد)' : 'One-time only (1 week)'}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="weekly" id="weekly" />
                            <Label htmlFor="weekly">
                              {locale === 'ar' ? 'تكرار أسبوعي' : 'Repeat weekly'}
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {locale === 'ar' ? 'الأسبوع' : 'Week'}
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const selectedSunday = nextSundays[parseInt(value)];
                          field.onChange(selectedSunday);
                        }}
                        value={nextSundays.findIndex((sunday) =>
                          format(sunday, 'yyyy-MM-dd') === format(field.value, 'yyyy-MM-dd')
                        ).toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={locale === 'ar' ? 'اختر الأسبوع' : 'Select week'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nextSundays.map((sunday, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {index === 0
                                ? format(sunday, "'Sunday,' MMM do")
                                : format(sunday, "'Sun' MMM do")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {repeatPattern === 'weekly' && (
                  <FormField
                    control={form.control}
                    name="weeks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{locale === 'ar' ? 'لمدة' : 'For'}</FormLabel>
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
                            {[1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 26, 52].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {locale === 'ar' ? 'أسبوع' : 'weeks'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {confirmationMessage && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {confirmationMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={createClasses.isPending || selectedSlotsCount === 0}>
                {createClasses.isPending
                  ? (locale === 'ar' ? 'جاري الإنشاء...' : 'Creating...')
                  : (locale === 'ar' ? 'إنشاء الحصص' : 'Create Classes')}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
