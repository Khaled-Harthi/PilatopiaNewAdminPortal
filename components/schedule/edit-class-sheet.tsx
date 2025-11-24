'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocale } from 'next-intl';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect } from 'react';

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
import { useInstructors, useClassTypes, useClassRooms, useUpdateClass } from '@/lib/schedule/hooks';
import { toUTC, toLocalDate, formatTime } from '@/lib/schedule/time-utils';
import { cn } from '@/lib/utils';
import type { PilatesClass } from '@/lib/schedule/types';

const formSchema = z.object({
  classTypeId: z.number().min(1, 'Class type is required'),
  instructorId: z.number().min(1, 'Instructor is required'),
  classRoomId: z.number().min(1, 'Room is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  durationMinutes: z.number().min(15, 'Duration must be at least 15 minutes'),
  date: z.date({ required_error: 'Date is required' }),
  time: z.string().min(1, 'Time is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface EditClassSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: PilatesClass | null;
}

const DURATION_OPTIONS = [30, 45, 50, 60, 75, 90];

export function EditClassSheet({ open, onOpenChange, classData }: EditClassSheetProps) {
  const locale = useLocale();
  const { data: instructors, isLoading: instructorsLoading } = useInstructors();
  const { data: classTypes, isLoading: classTypesLoading } = useClassTypes();
  const { data: rooms, isLoading: roomsLoading } = useClassRooms();
  const updateClass = useUpdateClass();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      capacity: 6,
      durationMinutes: 50,
      date: new Date(),
      time: '09:00',
    },
  });

  // Reset form when classData changes
  useEffect(() => {
    if (classData && open) {
      const localDate = toLocalDate(classData.schedule_time);
      const hours = localDate.getHours().toString().padStart(2, '0');
      const minutes = localDate.getMinutes().toString().padStart(2, '0');

      form.reset({
        classTypeId: classData.class_type_id,
        instructorId: classData.instructor_id,
        classRoomId: classData.class_room_id || 1,
        capacity: classData.capacity,
        durationMinutes: classData.duration_minutes,
        date: localDate,
        time: `${hours}:${minutes}`,
      });
    }
  }, [classData, open, form]);

  const onSubmit = async (values: FormValues) => {
    if (!classData) return;

    try {
      // Convert local time to UTC
      const dateStr = format(values.date, 'yyyy-MM-dd');
      const { time: utcTime } = toUTC(values.time, dateStr);

      await updateClass.mutateAsync({
        classId: classData.id,
        payload: {
          date: dateStr,
          time: utcTime,
          class_type_id: values.classTypeId,
          instructor_id: values.instructorId,
          class_room_id: values.classRoomId,
          capacity: values.capacity,
          duration: values.durationMinutes,
        },
      });

      // Close sheet
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update class:', error);
    }
  };

  if (!classData) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={locale === 'ar' ? 'left' : 'right'} className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{locale === 'ar' ? 'تعديل الحصة' : 'Edit Class'}</SheetTitle>
          <SheetDescription>
            {locale === 'ar'
              ? 'قم بتعديل تفاصيل الحصة أدناه'
              : 'Update the class details below'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Class Type */}
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
                      <SelectTrigger>
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

            {/* Instructor */}
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
                      <SelectTrigger>
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

            {/* Duration */}
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
                      <SelectTrigger>
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

            {/* Capacity */}
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
                      <SelectTrigger>
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

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{locale === 'ar' ? 'التاريخ' : 'Date'}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>{locale === 'ar' ? 'اختر التاريخ' : 'Pick a date'}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{locale === 'ar' ? 'الوقت' : 'Time'}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={updateClass.isPending}>
                {updateClass.isPending
                  ? (locale === 'ar' ? 'جاري التحديث...' : 'Updating...')
                  : (locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
