'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { checkScheduleConflicts, type ScheduleConflict } from '@/lib/schedule/conflict-utils';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInstructors, useClassTypes, useClassRooms, useCreateClasses } from '@/lib/schedule/hooks';
import type { PilatesClass } from '@/lib/schedule/types';

const formSchema = z.object({
  classTypeId: z.number().min(1, 'Required'),
  instructorId: z.number().min(1, 'Required'),
  classRoomId: z.number().min(1, 'Required'),
  capacity: z.number().min(1, 'Must be at least 1'),
  durationMinutes: z.number().min(15, 'Must be at least 15 minutes'),
});

type FormValues = z.infer<typeof formSchema>;

const DURATION_OPTIONS = [30, 45, 50, 60, 75, 90];

// Utility to get most frequent value from array
function getMostFrequentValue<T>(values: (T | undefined | null)[]): T | undefined {
  const counts = new Map<T, number>();

  values.forEach((value) => {
    if (value !== undefined && value !== null) {
      counts.set(value, (counts.get(value) || 0) + 1);
    }
  });

  if (counts.size === 0) return undefined;

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0];
}

// Get smart defaults based on frequency analysis of current week's classes
function getSmartDefaults(classTypeId: number, classTypeName: string, classes: PilatesClass[]) {
  // Filter classes matching this class type (by ID or name)
  const matching = classes.filter(
    (c) => c.class_type_id === classTypeId || c.name === classTypeName
  );

  if (matching.length === 0) return null;

  return {
    instructorId: getMostFrequentValue(matching.map((c) => c.instructor_id)),
    classRoomId: getMostFrequentValue(matching.map((c) => c.class_room_id)),
    durationMinutes: getMostFrequentValue(matching.map((c) => c.duration_minutes)),
    capacity: getMostFrequentValue(matching.map((c) => c.capacity)),
  };
}

interface QuickAddClassPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  hour: number;
  allClasses: PilatesClass[]; // Current week's classes for frequency analysis
  locale: string;
  children: React.ReactNode; // Trigger element
}

export function QuickAddClassPopover({
  open,
  onOpenChange,
  date,
  hour,
  allClasses,
  locale,
  children,
}: QuickAddClassPopoverProps) {
  const { data: instructors, isLoading: instructorsLoading } = useInstructors();
  const { data: classTypes, isLoading: classTypesLoading } = useClassTypes();
  const { data: rooms, isLoading: roomsLoading } = useClassRooms();
  const createClasses = useCreateClasses();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classTypeId: 0,
      instructorId: 0,
      classRoomId: 0,
      capacity: 6,
      durationMinutes: 50,
    },
  });

  // Reset form when popover opens
  useEffect(() => {
    if (open) {
      form.reset({
        classTypeId: 0,
        instructorId: 0,
        classRoomId: 0,
        capacity: 6,
        durationMinutes: 50,
      });
    }
  }, [open, form]);

  // Watch class type changes to apply smart defaults
  const watchClassTypeId = form.watch('classTypeId');

  useEffect(() => {
    if (watchClassTypeId && watchClassTypeId > 0 && classTypes) {
      const selectedType = classTypes.find((t) => t.id === watchClassTypeId);
      if (selectedType) {
        const defaults = getSmartDefaults(watchClassTypeId, selectedType.name, allClasses);
        if (defaults) {
          if (defaults.instructorId) {
            form.setValue('instructorId', defaults.instructorId);
          }
          if (defaults.classRoomId) {
            form.setValue('classRoomId', defaults.classRoomId);
          }
          if (defaults.durationMinutes) {
            form.setValue('durationMinutes', defaults.durationMinutes);
          }
          if (defaults.capacity) {
            form.setValue('capacity', defaults.capacity);
          }
        }
      }
    }
  }, [watchClassTypeId, classTypes, allClasses, form]);

  // Watch form values for conflict detection
  const watchInstructorId = form.watch('instructorId');
  const watchClassRoomId = form.watch('classRoomId');
  const watchDurationMinutes = form.watch('durationMinutes');

  // Check for conflicts
  const conflicts = useMemo(() => {
    if (!watchInstructorId || !watchClassRoomId || !watchDurationMinutes) {
      return [];
    }
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    return checkScheduleConflicts(
      {
        instructorId: watchInstructorId,
        classRoomId: watchClassRoomId,
        date: format(date, 'yyyy-MM-dd'),
        time: timeString,
        durationMinutes: watchDurationMinutes,
      },
      allClasses
    );
  }, [watchInstructorId, watchClassRoomId, watchDurationMinutes, hour, date, allClasses]);

  // Format the date and time for display
  const displayDate = format(date, 'EEE, MMM d');
  const displayTime = format(new Date(date.setHours(hour, 0, 0, 0)), 'h:mm a');
  const timeString = `${hour.toString().padStart(2, '0')}:00`;

  const onSubmit = async (values: FormValues) => {
    try {
      // Send local time directly - backend expects local time (UTC+3)
      const dateStr = format(date, 'yyyy-MM-dd');

      await createClasses.mutateAsync({
        classesConfig: {
          classTypeId: values.classTypeId,
          instructorId: values.instructorId,
          classRoomId: values.classRoomId,
          capacity: values.capacity,
          durationMinutes: values.durationMinutes,
        },
        dates: [dateStr],
        startTime: timeString, // Send local time directly
      });

      toast.success(locale === 'ar' ? 'تم إنشاء الحصة بنجاح' : 'Class created successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create class:', error);
      toast.error(locale === 'ar' ? 'فشل في إنشاء الحصة' : 'Failed to create class');
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start" side="right">
        {/* Header with close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-medium">
            {displayDate} • {displayTime}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Sentence-style form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-3">
            {/* Row 1: [Class Type] */}
            <FormField
              control={form.control}
              name="classTypeId"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? field.value.toString() : ''}
                    disabled={classTypesLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue
                          placeholder={locale === 'ar' ? 'نوع الحصة' : 'Class type'}
                        />
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
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Row 2: with [Instructor] */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0 w-8">
                {locale === 'ar' ? 'مع' : 'with'}
              </span>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="instructorId"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value ? field.value.toString() : ''}
                        disabled={instructorsLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue
                              placeholder={locale === 'ar' ? 'مدرب' : 'Instructor'}
                            />
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
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Row 3: in [Room] */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0 w-8">
                {locale === 'ar' ? 'في' : 'in'}
              </span>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="classRoomId"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value ? field.value.toString() : ''}
                        disabled={roomsLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue
                              placeholder={locale === 'ar' ? 'غرفة' : 'Room'}
                            />
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
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Row 4: [Duration] • [Capacity] spots */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0 w-8">
                {locale === 'ar' ? 'لـ' : 'for'}
              </span>
              {/* Duration */}
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem className="shrink-0">
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DURATION_OPTIONS.map((duration) => (
                          <SelectItem key={duration} value={duration.toString()}>
                            {duration} {locale === 'ar' ? 'د' : 'min'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <span className="text-muted-foreground shrink-0">•</span>

              {/* Capacity */}
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          className="h-9 text-sm w-14 text-center"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">
                        {locale === 'ar' ? 'مقاعد' : 'spots'}
                      </span>
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Conflict Warning */}
            {conflicts.length > 0 && (
              <div className="rounded-md bg-orange-50 dark:bg-orange-950/20 p-3 mt-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800 dark:text-orange-200">
                      {locale === 'ar' ? 'تعارض في الجدول' : 'Scheduling conflict'}
                    </p>
                    <ul className="mt-1 text-orange-700 dark:text-orange-300 space-y-0.5">
                      {conflicts.map((conflict, i) => (
                        <li key={i} className="text-xs">• {conflict.message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-2 border-t mt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" size="sm" disabled={createClasses.isPending}>
                {createClasses.isPending
                  ? locale === 'ar'
                    ? 'جاري...'
                    : 'Creating...'
                  : locale === 'ar'
                  ? 'إنشاء'
                  : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
}
