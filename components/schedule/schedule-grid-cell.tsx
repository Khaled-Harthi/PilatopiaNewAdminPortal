'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PilatesClass } from '@/lib/schedule/types';
import { QuickAddClassPopover } from './quick-add-class-popover';
import { ClassDetailSheet } from './class-detail-sheet';

interface ScheduleGridCellProps {
  classes: PilatesClass[];
  allClasses: PilatesClass[]; // All classes for frequency analysis
  date: Date;
  hour: number;
  onClassClick: (classData: PilatesClass) => void;
  onDeleteClass: (classData: PilatesClass) => void;
  locale: string;
  isNowCell?: boolean;
  nowMinutePercent?: number;
}

export function ScheduleGridCell({
  classes,
  allClasses,
  date,
  hour,
  onClassClick,
  onDeleteClass,
  locale,
  isNowCell = false,
  nowMinutePercent = 0,
}: ScheduleGridCellProps) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

  // Now indicator element
  const nowIndicator = isNowCell && (
    <div
      className="absolute left-0 right-0 h-0.5 bg-primary z-10 pointer-events-none"
      style={{ top: `${nowMinutePercent}%` }}
    >
      <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary" />
    </div>
  );

  // Empty cell
  if (classes.length === 0) {
    return (
      <td className={cn(
        "border-r border-b p-1 align-top h-24 min-w-[100px] hover:bg-muted/50 transition-colors relative",
        isNowCell && "bg-accent/10"
      )}>
        {nowIndicator}
        <div className="h-full flex items-center justify-center">
          <QuickAddClassPopover
            open={quickAddOpen}
            onOpenChange={setQuickAddOpen}
            date={date}
            hour={hour}
            allClasses={allClasses}
            locale={locale}
          >
            <button
              className="p-2 rounded-md text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </QuickAddClassPopover>
        </div>
      </td>
    );
  }

  // Cell with classes
  return (
    <td className={cn(
      "border-r border-b p-1 align-top h-24 min-w-[100px] relative",
      isNowCell && "bg-accent/10"
    )}>
      {nowIndicator}
      <div className="h-full flex flex-col">
        {/* Classes */}
        <div className="flex-1 space-y-1 overflow-hidden">
          {classes.map((cls, index) => {
            const classTypeName = cls.name || cls.class_type || 'Class';
            const isFull = cls.booked_seats >= cls.capacity;

            return (
              <div key={cls.id}>
                {index > 0 && <div className="border-t my-1" />}
                <ClassDetailSheet
                  open={openPopoverId === cls.id}
                  onOpenChange={(open) => setOpenPopoverId(open ? cls.id : null)}
                  classData={cls}
                  allClasses={allClasses}
                  onDelete={onDeleteClass}
                  locale={locale}
                >
                  <button
                    className="w-full text-left p-1.5 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    {/* Class type */}
                    <div className="text-xs font-semibold truncate">
                      {classTypeName}
                    </div>

                    {/* Instructor */}
                    <div className="text-xs text-muted-foreground truncate">
                      {cls.instructor}
                    </div>

                    {/* Capacity */}
                    <div>
                      {isFull ? (
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                          FULL
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {cls.booked_seats}/{cls.capacity}
                        </span>
                      )}
                    </div>
                  </button>
                </ClassDetailSheet>
              </div>
            );
          })}
        </div>

        {/* Add button - always at bottom */}
        <div className="flex justify-center pt-1">
          <QuickAddClassPopover
            open={quickAddOpen}
            onOpenChange={setQuickAddOpen}
            date={date}
            hour={hour}
            allClasses={allClasses}
            locale={locale}
          >
            <button
              className="p-1 rounded text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </QuickAddClassPopover>
        </div>
      </div>
    </td>
  );
}
