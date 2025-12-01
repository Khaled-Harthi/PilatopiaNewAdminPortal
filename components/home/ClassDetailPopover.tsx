'use client';

import { Check, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';
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
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/schedule/circular-progress';
import { useCheckInMember } from '@/lib/schedule/hooks';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { DailyClassDetail } from '@/lib/schedule/types';

interface ClassDetailPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classDetail: DailyClassDetail | null;
  onUpdate?: () => void;
  children: React.ReactNode;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Shared content component used by both Popover and Sheet
function ClassDetailContent({
  classDetail,
  onClose,
  onCheckIn,
  isCheckingIn,
}: {
  classDetail: DailyClassDetail;
  onClose: () => void;
  onCheckIn: (userId: number) => void;
  isCheckingIn: boolean;
}) {
  const classInfo = classDetail.class;
  const stats = classDetail.stats;
  const bookings = classDetail.bookings || [];
  const waitlist = classDetail.waitlist || [];

  const fillRate = classInfo && classInfo.capacity > 0
    ? Math.round((stats.total_booked / classInfo.capacity) * 100)
    : 0;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-sm font-medium">
          {formatDate(classInfo.schedule_time)} • {formatTime(classInfo.schedule_time)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
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
          label={`${stats.total_booked}/${classInfo.capacity}`}
          color="hsl(0, 0%, 30%)"
        />
        <p className="text-sm">
          <span className="font-medium">{classInfo.name}</span>
          {' '}with {classInfo.instructor}
          {' '}in {classInfo.class_room_name}
          {' '}for {classInfo.duration_minutes} min
        </p>
      </div>

      {/* Attendees Section */}
      <div className="px-4 py-3 border-t space-y-2">
        {/* Header with legend - tooltips only on the dots */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase font-medium">
            Attendees
          </span>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 cursor-help">
                  <span className="h-2 w-2 rounded-full bg-foreground" />
                  In
                </span>
              </TooltipTrigger>
              <TooltipContent>Checked in</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 cursor-help">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  Booked
                </span>
              </TooltipTrigger>
              <TooltipContent>Has booking, not checked in yet</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Bookings list */}
        <div className="space-y-1 max-h-[240px] overflow-y-auto">
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2 text-center">
              No bookings yet
            </p>
          ) : (
            bookings.map((booking) => {
              const isCheckedIn = booking.check_in_time !== null;

              return (
                <div
                  key={booking.booking_id}
                  className={`flex items-center justify-between py-2 px-2 rounded-md ${
                    isCheckedIn ? 'bg-green-500/10' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Link
                      href={`/members/${booking.user_id}`}
                      className="text-sm font-medium truncate hover:underline flex items-center gap-1"
                    >
                      {booking.user_name}
                      <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                    </Link>
                  </div>

                  {isCheckedIn ? (
                    <span className="h-5 w-5 rounded-full bg-foreground flex items-center justify-center">
                      <Check className="h-3 w-3 text-background" />
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onCheckIn(booking.user_id)}
                      disabled={isCheckingIn}
                    >
                      Check In
                    </Button>
                  )}
                </div>
              );
            })
          )}

          {/* Waitlist section */}
          {waitlist.length > 0 && (
            <>
              <div className="border-t my-2" />
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground font-medium">
                  Waitlist ({waitlist.length})
                </span>
              </div>
              {waitlist.map((entry, index) => (
                <div
                  key={entry.member_id}
                  className="flex items-center justify-between py-2 px-2 rounded-md bg-muted/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <Link
                      href={`/members/${entry.member_id}`}
                      className="text-sm truncate hover:underline flex items-center gap-1 text-muted-foreground"
                    >
                      {entry.member_name}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </Link>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Stats footer */}
      <div className="px-4 py-3 border-t bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{stats.checked_in}/{stats.total_booked} checked in</span>
          <span>{classInfo.capacity - stats.total_booked} spots available</span>
        </div>
      </div>
    </>
  );
}

export function ClassDetailPopover({
  open,
  onOpenChange,
  classDetail,
  onUpdate,
  children,
}: ClassDetailPopoverProps) {
  const checkInMutation = useCheckInMember();
  const isMobile = useIsMobile();

  // Return null early if no classDetail - this prevents rendering anything
  if (!classDetail) return null;

  const handleCheckIn = async (userId: number) => {
    if (!classDetail.class) return;
    try {
      await checkInMutation.mutateAsync({
        classId: classDetail.class.id,
        userId,
      });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to check in:', error);
    }
  };

  // Mobile: Use bottom Sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-0 rounded-t-xl">
          <ClassDetailContent
            classDetail={classDetail}
            onClose={() => onOpenChange(false)}
            onCheckIn={handleCheckIn}
            isCheckingIn={checkInMutation.isPending}
          />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use Popover
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start" side="right">
        <ClassDetailContent
          classDetail={classDetail}
          onClose={() => onOpenChange(false)}
          onCheckIn={handleCheckIn}
          isCheckingIn={checkInMutation.isPending}
        />
      </PopoverContent>
    </Popover>
  );
}
