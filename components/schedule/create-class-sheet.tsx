'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocale } from 'next-intl';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

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
import { useInstructors, useClassTypes, useClassRooms, useCreateClasses } from '@/lib/schedule/hooks';
import { toUTC } from '@/lib/schedule/time-utils';
import { cn } from '@/lib/utils';

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

interface CreateClassSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  defaultTime?: string;
}

const DURATION_OPTIONS = [30, 45, 50, 60, 75, 90];

export function CreateClassSheet({ open, onOpenChange, defaultDate, defaultTime }: CreateClassSheetProps) {
  const locale = useLocale();
  const { data: instructors, isLoading: instructorsLoading } = useInstructors();
  const { data: classTypes, isLoading: classTypesLoading } = useClassTypes();
  const { data: rooms, isLoading: roomsLoading } = useClassRooms();
  const createClasses = useCreateClasses();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      capacity: 6,
      durationMinutes: 50,
      date: defaultDate || new Date(),
      time: defaultTime || '09:00',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Convert local time to UTC
      const dateStr = format(values.date, 'yyyy-MM-dd');
      const { time: utcTime } = toUTC(values.time, dateStr);

      await createClasses.mutateAsync({
        classesConfig: {
          classTypeId: values.classTypeId,
          instructorId: values.instructorId,
          classRoomId: values.classRoomId,
          capacity: values.capacity,
          durationMinutes: values.durationMinutes,
        },
        dates: [dateStr],
        startTime: utcTime,
      });

      // Close sheet and reset form
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Failed to create class:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={locale === 'ar' ? 'left' : 'right'} className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{locale === 'ar' ? 'إنشاء حصة' : 'Create Class'}</SheetTitle>
          <SheetDescription>
            {locale === 'ar'
              ? 'قم بملء التفاصيل أدناه لإنشاء حصة جديدة'
              : 'Fill in the details below to create a new class'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-6">
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
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={createClasses.isPending}>
                {createClasses.isPending
                  ? (locale === 'ar' ? 'جاري الإنشاء...' : 'Creating...')
                  : (locale === 'ar' ? 'إنشاء الحصة' : 'Create Class')}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
