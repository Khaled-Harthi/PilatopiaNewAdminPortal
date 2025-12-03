'use client';

import * as React from 'react';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface SimpleDateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

export function SimpleDateTimePicker({
  value,
  onChange,
  placeholder = 'Select date & time',
}: SimpleDateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | null>(value);

  // Sync internal state with external value
  React.useEffect(() => {
    setInternalDate(value);
  }, [value]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(internalDate || new Date());
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setInternalDate(newDate);
      onChange(newDate);
    }
  };

  const handleTimeChange = (
    type: 'hour' | 'minute' | 'ampm',
    timeValue: string
  ) => {
    const newDate = new Date(internalDate || new Date());
    if (type === 'hour') {
      newDate.setHours(
        (parseInt(timeValue) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
      );
    } else if (type === 'minute') {
      newDate.setMinutes(parseInt(timeValue));
    } else if (type === 'ampm') {
      const currentHours = newDate.getHours();
      const isPM = timeValue === 'PM';
      if (isPM && currentHours < 12) {
        newDate.setHours(currentHours + 12);
      } else if (!isPM && currentHours >= 12) {
        newDate.setHours(currentHours - 12);
      }
    }
    setInternalDate(newDate);
    onChange(newDate);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalDate(null);
    onChange(null);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !internalDate && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="me-2 h-4 w-4" />
          {internalDate ? (
            <span className="flex-1">{format(internalDate, 'MM/dd/yyyy hh:mm aa')}</span>
          ) : (
            <span className="flex-1">{placeholder}</span>
          )}
          {internalDate && (
            <X
              className="h-4 w-4 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={internalDate || undefined}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={
                      internalDate && (internalDate.getHours() % 12 || 12) === hour
                        ? 'default'
                        : 'ghost'
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange('hour', hour.toString())}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      internalDate && internalDate.getMinutes() === minute
                        ? 'default'
                        : 'ghost'
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange('minute', minute.toString())}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea>
              <div className="flex sm:flex-col p-2">
                {['AM', 'PM'].map((ampm) => (
                  <Button
                    key={ampm}
                    size="icon"
                    variant={
                      internalDate &&
                      ((ampm === 'AM' && internalDate.getHours() < 12) ||
                        (ampm === 'PM' && internalDate.getHours() >= 12))
                        ? 'default'
                        : 'ghost'
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange('ampm', ampm)}
                  >
                    {ampm}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
