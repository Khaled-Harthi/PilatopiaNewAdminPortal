'use client';

import { useState, useMemo } from 'react';
import { Search, X, Check, Loader2, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { useMembers, useCreateMemberBooking } from '@/lib/members/hooks';
import { useDailyDetailed } from '@/lib/schedule/hooks';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import type { Member } from '@/lib/members/types';
import type { DailyClassDetail } from '@/lib/schedule/types';

interface AddBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper to format date as YYYY-MM-DD
function formatDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format time
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Helper to format display date
function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (dateStr === formatDateParam(today)) return 'Today';
  if (dateStr === formatDateParam(tomorrow)) return 'Tomorrow';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Check if class is in the past
function isClassPast(scheduleTime: string): boolean {
  return new Date(scheduleTime) < new Date();
}

export function AddBookingDialog({ open, onOpenChange }: AddBookingDialogProps) {
  // Form state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedDate, setSelectedDate] = useState(formatDateParam(new Date()));
  const [selectedClass, setSelectedClass] = useState<DailyClassDetail | null>(null);

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Queries
  const membersQuery = useMembers(
    { search: debouncedSearch, limit: 10 },
    debouncedSearch.length >= 2
  );

  const classesQuery = useDailyDetailed(selectedDate);

  // Mutation
  const createBooking = useCreateMemberBooking();

  // Filter classes to only upcoming ones with availability
  const availableClasses = useMemo(() => {
    if (!classesQuery.data?.classes) return [];
    return classesQuery.data.classes.filter(
      (c) => !isClassPast(c.class.schedule_time)
    );
  }, [classesQuery.data?.classes]);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Reset form state
      setSearchQuery('');
      setSelectedMember(null);
      setSelectedDate(formatDateParam(new Date()));
      setSelectedClass(null);
    }
    onOpenChange(isOpen);
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setSearchQuery('');
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setSelectedClass(null);
  };

  const handleSelectClass = (classDetail: DailyClassDetail) => {
    const isFull = classDetail.stats.total_booked >= classDetail.class.capacity;
    if (isFull) return;
    setSelectedClass(classDetail);
  };

  const handleBook = async () => {
    if (!selectedMember || !selectedClass) return;

    try {
      await createBooking.mutateAsync({
        memberId: selectedMember.id,
        classId: selectedClass.class.id,
      });

      toast.success(
        `Booked ${selectedMember.name} for ${selectedClass.class.name || 'Class'} at ${formatTime(selectedClass.class.schedule_time)}`
      );
      onOpenChange(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create booking';
      toast.error(errorMessage);
    }
  };

  const today = formatDateParam(new Date());
  const tomorrow = formatDateParam(new Date(Date.now() + 24 * 60 * 60 * 1000));

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Add Booking</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Book a class for a member.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-4 py-4 px-4 sm:px-0">
          {/* Step 1: Member Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Member</label>

            {selectedMember ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedMember.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedMember.phoneNumber}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={handleClearMember}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>

                {/* Search Results */}
                {debouncedSearch.length >= 2 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {membersQuery.isLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : membersQuery.data?.members?.length === 0 ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        No members found
                      </div>
                    ) : (
                      <div className="divide-y">
                        {membersQuery.data?.members?.map((member) => (
                          <button
                            key={member.id}
                            className="w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                            onClick={() => handleSelectMember(member)}
                          >
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.phoneNumber}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Date Selection (shown after member selected) */}
          {selectedMember && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </label>
              <div className="flex gap-2">
                <Button
                  variant={selectedDate === today ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedDate(today);
                    setSelectedClass(null);
                  }}
                >
                  Today
                </Button>
                <Button
                  variant={selectedDate === tomorrow ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedDate(tomorrow);
                    setSelectedClass(null);
                  }}
                >
                  Tomorrow
                </Button>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedClass(null);
                  }}
                  min={today}
                  className="w-auto"
                />
              </div>
            </div>
          )}

          {/* Step 3: Class Selection (shown after date selected) */}
          {selectedMember && selectedDate && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Class ({formatDisplayDate(selectedDate)})
              </label>

              {classesQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : availableClasses.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground bg-muted/30 rounded-lg">
                  No upcoming classes on this date
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {availableClasses.map((classDetail) => {
                    const isFull = classDetail.stats.total_booked >= classDetail.class.capacity;
                    const isSelected = selectedClass?.class.id === classDetail.class.id;
                    const spotsLeft = classDetail.class.capacity - classDetail.stats.total_booked;

                    return (
                      <button
                        key={classDetail.class.id}
                        className={`w-full p-3 rounded-lg border text-left transition-colors ${
                          isSelected
                            ? 'border-foreground bg-accent'
                            : isFull
                            ? 'border-muted bg-muted/30 opacity-50 cursor-not-allowed'
                            : 'border-border hover:border-foreground/30 hover:bg-muted/50'
                        }`}
                        onClick={() => handleSelectClass(classDetail)}
                        disabled={isFull}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {formatTime(classDetail.class.schedule_time)}
                              </span>
                              <span className="text-sm">
                                {classDetail.class.name || 'Class'}
                              </span>
                              {isSelected && (
                                <Check className="h-4 w-4 text-foreground shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {classDetail.class.instructor} · {classDetail.class.class_room_name}
                            </p>
                          </div>
                          <span className={`text-xs shrink-0 ${isFull ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {isFull ? 'Full' : `${spotsLeft} left`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Book Button */}
          {selectedMember && selectedClass && (
            <div className="pt-2 border-t">
              <Button
                className="w-full"
                onClick={handleBook}
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    Book {selectedMember.name.split(' ')[0]} for{' '}
                    {selectedClass.class.name || 'Class'} at{' '}
                    {formatTime(selectedClass.class.schedule_time)}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
