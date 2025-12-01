'use client';

import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
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
import apiClient from '@/lib/axios';

interface AvailableClass {
  id: number;
  name: string;
  schedule_time: string;
  instructor_name: string;
  available_seats: number;
}

interface BookClassDialogProps {
  memberId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BookClassDialog({
  memberId,
  open,
  onOpenChange,
  onSuccess,
}: BookClassDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  const loadAvailableClasses = async (date: Date) => {
    setIsLoadingClasses(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await apiClient.get('/admin/schedules/classes/by-date-range', {
        params: { startDate: dateStr, endDate: dateStr },
      });
      setAvailableClasses(response.data.classes || []);
    } catch (error) {
      console.error('Failed to load available classes:', error);
      setAvailableClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Reset state and load classes for today
      setSelectedClassId('');
      setSelectedDate(new Date());
      loadAvailableClasses(new Date());
    }
    onOpenChange(isOpen);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedClassId('');
      loadAvailableClasses(date);
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedClassId) return;

    setIsCreatingBooking(true);
    try {
      await apiClient.post(`/admin/members/${memberId}/bookings`, {
        classId: parseInt(selectedClassId),
      });
      onOpenChange(false);
      setSelectedClassId('');
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create booking');
      console.error('Failed to create booking:', error);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Book a Class</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Select a date and available class to book for this member.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Class Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Available Classes</label>
            {isLoadingClasses ? (
              <p className="text-sm text-muted-foreground py-2">Loading classes...</p>
            ) : availableClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No classes available on this date
              </p>
            ) : (
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{cls.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(cls.schedule_time), 'p')} · {cls.instructor_name} · {cls.available_seats} seats
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitBooking}
            disabled={!selectedClassId || isCreatingBooking}
          >
            {isCreatingBooking ? 'Booking...' : 'Book Class'}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
