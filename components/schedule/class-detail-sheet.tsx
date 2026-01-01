'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ArrowLeft, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { checkScheduleConflicts } from '@/lib/schedule/conflict-utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { CircularProgress } from './circular-progress';
import {
  useClassDetails,
  useInstructors,
  useClassTypes,
  useClassRooms,
  useUpdateClass,
} from '@/lib/schedule/hooks';
import { getUtcPlus3Components, getLocalDateString } from '@/lib/schedule/time-utils';
import { cn } from '@/lib/utils';
import type { PilatesClass } from '@/lib/schedule/types';

// Form validation schema
const editFormSchema = z.object({
  classTypeId: z.number().min(1, 'Required'),
  instructorId: z.number().min(1, 'Required'),
  classRoomId: z.number().min(1, 'Required'),
  time: z.string().min(1, 'Required'),
  capacity: z.number().min(1, 'Must be at least 1'),
  durationMinutes: z.number().min(15, 'Must be at least 15 minutes'),
  fakeBookedSeats: z.union([z.number().min(0, 'Must be 0 or more'), z.literal('')]).optional().nullable(),
});

type EditFormValues = z.infer<typeof editFormSchema>;

const DURATION_OPTIONS = [30, 45, 50, 60, 75, 90];

// Generate time options in 30-minute increments from 6 AM to 9 PM
function generateTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let hour = 6; hour <= 21; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 21 && minute === 30) continue; // Skip 9:30 PM
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const label = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
      options.push({ value: time, label });
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

interface ClassDetailPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: PilatesClass | null;
  allClasses: PilatesClass[];
  onDelete: (classData: PilatesClass) => void;
  locale: string;
  children: React.ReactNode;
}

export function ClassDetailSheet({
  open,
  onOpenChange,
  classData,
  allClasses,
  onDelete,
  locale,
  children,
}: ClassDetailPopoverProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = useIsMobile();

  // Fetch detailed class info with bookings
  const { data: details, isLoading } = useClassDetails(open && classData ? classData.id : null);

  // Fetch data for edit form
  const { data: instructors, isLoading: instructorsLoading } = useInstructors();
  const { data: classTypes, isLoading: classTypesLoading } = useClassTypes();
  const { data: rooms, isLoading: roomsLoading } = useClassRooms();
  const updateClass = useUpdateClass();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      classTypeId: 0,
      instructorId: 0,
      classRoomId: 0,
      time: '09:00',
      capacity: 6,
      durationMinutes: 50,
      fakeBookedSeats: undefined,
    },
  });

  // Reset edit state when popover closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
    }
  }, [open]);

  // Function to enter edit mode and populate form
  const handleEnterEditMode = () => {
    if (classData) {
      // Use timezone-aware utilities to get the correct local time
      const { hours, minutes } = getUtcPlus3Components(classData.schedule_time);
      // Snap to nearest 30-minute interval for time select
      const snappedMinutes = minutes < 15 ? 0 : minutes < 45 ? 30 : 0;
      const snappedHours = minutes >= 45 ? hours + 1 : hours;
      const timeValue = `${snappedHours.toString().padStart(2, '0')}:${snappedMinutes.toString().padStart(2, '0')}`;

      form.reset({
        classTypeId: classData.class_type_id,
        instructorId: classData.instructor_id,
        classRoomId: classData.class_room_id || 1,
        time: timeValue,
        capacity: classData.capacity,
        durationMinutes: classData.duration_minutes,
        fakeBookedSeats: classData.fake_booked_seats ?? undefined,
      });
      setIsEditing(true);
    }
  };

  if (!classData) return null;

  const classTypeName = classData.name || classData.class_type || 'Class';
  const scheduleDate = new Date(classData.schedule_time);
  const fillRate = classData.capacity > 0
    ? Math.round((classData.booked_seats / classData.capacity) * 100)
    : 0;

  // Format display
  const displayDate = format(scheduleDate, 'EEE, MMM d');
  const displayTime = format(scheduleDate, 'h:mm a');

  // Watch form values for conflict detection
  const watchInstructorId = form.watch('instructorId');
  const watchClassRoomId = form.watch('classRoomId');
  const watchTime = form.watch('time');
  const watchDurationMinutes = form.watch('durationMinutes');

  // Check for conflicts (only when editing)
  const conflicts = useMemo(() => {
    if (!isEditing || !watchInstructorId || !watchClassRoomId || !watchTime || !watchDurationMinutes) {
      return [];
    }
    return checkScheduleConflicts(
      {
        instructorId: watchInstructorId,
        classRoomId: watchClassRoomId,
        date: format(scheduleDate, 'yyyy-MM-dd'),
        time: watchTime,
        durationMinutes: watchDurationMinutes,
        excludeClassId: classData.id, // Exclude the class being edited
      },
      allClasses
    );
  }, [isEditing, watchInstructorId, watchClassRoomId, watchTime, watchDurationMinutes, scheduleDate, classData.id, allClasses]);

  const onSubmit = async (values: EditFormValues) => {
    if (!classData) return;

    try {
      // Use timezone-aware utility to get the date in UTC+3
      const dateStr = getLocalDateString(classData.schedule_time);

      // Send local time directly (database column is 'timestamp without time zone')
      // The database stores times in Saudi local time (UTC+3) without timezone info
      const scheduleTime = `${dateStr}T${values.time}:00`; // No Z suffix - local time

      await updateClass.mutateAsync({
        classId: classData.id,
        payload: {
          classTypeId: values.classTypeId,
          instructorId: values.instructorId,
          classRoomId: values.classRoomId,
          scheduleTime: scheduleTime,
          capacity: values.capacity,
          durationMinutes: values.durationMinutes,
          ...(values.fakeBookedSeats !== undefined && values.fakeBookedSeats !== ''
            ? { fakeBookedSeats: values.fakeBookedSeats as number }
            : {}),
        },
      });

      toast.success(locale === 'ar' ? 'تم تحديث الحصة بنجاح' : 'Class updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update class:', error);
      toast.error(locale === 'ar' ? 'فشل في تحديث الحصة' : 'Failed to update class');
    }
  };

  // Shared content for both Popover and Sheet
  const content = isEditing ? (
          /* Edit Mode */
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <button
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsEditing(false)}
              >
                <ArrowLeft className="h-4 w-4" />
                {locale === 'ar' ? 'رجوع' : 'Back'}
              </button>
              <span className="text-sm font-medium">{displayDate}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Edit Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-3">
                {/* Class Type */}
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

                {/* Instructor */}
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

                {/* Room */}
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

                {/* Time */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground shrink-0 w-8">
                    {locale === 'ar' ? 'في' : 'at'}
                  </span>
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TIME_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
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

                {/* Duration & Capacity */}
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

                {/* Fake Booked Seats - Advanced Option */}
                <div className="flex items-center gap-2 pt-2 border-t border-dashed">
                  <span className="text-xs text-muted-foreground shrink-0">
                    {locale === 'ar' ? 'عرض المقاعد' : 'Display seats'}
                  </span>
                  <FormField
                    control={form.control}
                    name="fakeBookedSeats"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder={locale === 'ar' ? 'تلقائي' : 'Auto'}
                              className="h-8 text-xs w-16 text-center"
                              value={field.value === undefined || field.value === null || field.value === '' ? '' : String(field.value)}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                if (val === '') {
                                  field.onChange(undefined);
                                } else {
                                  field.onChange(Number(val));
                                }
                              }}
                            />
                          </FormControl>
                          <span className="text-xs text-muted-foreground">
                            {locale === 'ar' ? '(يظهر للمستخدم)' : '(shown to user)'}
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
                    onClick={() => setIsEditing(false)}
                  >
                    {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button type="submit" size="sm" disabled={updateClass.isPending}>
                    {updateClass.isPending
                      ? locale === 'ar'
                        ? 'جاري...'
                        : 'Saving...'
                      : locale === 'ar'
                      ? 'حفظ'
                      : 'Save'}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        ) : (
          /* Detail Mode */
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="text-sm font-medium">
                {displayDate} • {displayTime}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Class Info with Circular Progress */}
            <div className="flex items-start gap-3 px-4 py-3">
              <CircularProgress
                value={fillRate}
                size="sm"
                showLabel={true}
                label={`${classData.booked_seats}/${classData.capacity}`}
                color="hsl(0, 0%, 30%)"
              />
              <p className="text-sm">
                <span className="font-medium">{classTypeName}</span>
                {' '}
                {locale === 'ar' ? 'مع' : 'with'} {classData.instructor}
                {' '}
                {locale === 'ar' ? 'في' : 'in'} {classData.class_room_name}
                {' '}
                {locale === 'ar' ? 'لمدة' : 'for'} {classData.duration_minutes} {locale === 'ar' ? 'دقيقة' : 'min'}
              </p>
            </div>

            {/* Attendees Section */}
            <div className="px-4 py-3 border-t space-y-2">
              {/* Header with legend */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase font-medium">
                  {locale === 'ar' ? 'الحضور' : 'Attendees'}
                </span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-foreground" />
                    {locale === 'ar' ? 'حضر' : 'In'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                    {locale === 'ar' ? 'حجز' : 'Booked'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    {locale === 'ar' ? 'انتظار' : 'Wait'}
                  </span>
                </div>
              </div>

              {/* Combined list: bookings + waitlist */}
              <div className="space-y-1">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground py-2">
                    {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </p>
                ) : (
                  <>
                    {/* Bookings */}
                    {details?.bookings && details.bookings.length > 0 ? (
                      details.bookings.map((booking) => (
                        <div
                          key={booking.booking_id}
                          className="flex items-center justify-between py-1.5"
                        >
                          <span className="text-sm">{booking.user_name}</span>
                          <span
                            className={cn(
                              'h-2 w-2 rounded-full',
                              booking.check_in_time ? 'bg-foreground' : 'bg-muted-foreground/40'
                            )}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground py-2">
                        {locale === 'ar' ? 'لا توجد حجوزات' : 'No bookings yet'}
                      </p>
                    )}

                    {/* Waitlist */}
                    {details?.waitlist && details.waitlist.length > 0 && (
                      details.waitlist.map((entry) => (
                        <div
                          key={entry.member_id}
                          className="flex items-center justify-between py-1.5"
                        >
                          <span className="text-sm text-muted-foreground">
                            {entry.member_name}
                          </span>
                          <span className="h-2 w-2 rounded-full bg-orange-400" />
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <button
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleEnterEditMode}
              >
                {locale === 'ar' ? 'تعديل' : 'Edit'}
              </button>
              <button
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => {
                  onDelete(classData);
                  onOpenChange(false);
                }}
              >
                {locale === 'ar' ? 'إلغاء الحصة' : 'Cancel Class'}
              </button>
            </div>
          </>
        );

  // Mobile: Use bottom Sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto p-0 rounded-t-xl">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use Popover
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start" side="right">
        {content}
      </PopoverContent>
    </Popover>
  );
}
