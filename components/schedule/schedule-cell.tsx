'use client';

import { Plus } from 'lucide-react';
import { CircularProgress } from './circular-progress';
import { getConfigColor } from './class-legend';
import { cn } from '@/lib/utils';
import type { PilatesClass } from '@/lib/schedule/types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Edit, Trash2 } from 'lucide-react';

interface ScheduleCellProps {
  classes: PilatesClass[];
  onQuickAdd?: () => void;
  onEditClass?: (classData: PilatesClass) => void;
  onDeleteClass?: (classData: PilatesClass) => void;
  locale: string;
}

export function ScheduleCell({
  classes,
  onQuickAdd,
  onEditClass,
  onDeleteClass,
  locale,
}: ScheduleCellProps) {
  if (classes.length === 0) {
    // Empty cell - show quick add
    return (
      <td
        className="border p-2 text-center cursor-pointer hover:bg-muted transition-colors min-w-[3rem] h-12"
        onClick={onQuickAdd}
      >
        <Plus className="h-4 w-4 text-muted-foreground inline-block" />
      </td>
    );
  }

  if (classes.length === 1) {
    // Single class - show all info
    const cls = classes[0];
    const fillPercentage = (cls.booked_seats / cls.capacity) * 100;
    const classTypeName = cls.name || cls.class_type || 'Class';
    const configKey = `${classTypeName}|${cls.instructor}`;
    const configColor = getConfigColor(configKey);

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <td className="border p-2 cursor-pointer hover:bg-accent/50 transition-colors min-w-[3rem]">
            <div className="flex flex-col items-center gap-2 min-h-[6rem]">
              {/* Color dot */}
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: configColor }}
              />

              {/* Class info */}
              <div className="w-full text-center flex-1 flex flex-col justify-center">
                <p className="text-xs font-semibold truncate">{classTypeName}</p>
                <p className="text-xs text-muted-foreground truncate">{cls.instructor}</p>
              </div>

              {/* Progress indicator */}
              <CircularProgress
                value={fillPercentage}
                size="sm"
                label={`${cls.booked_seats}/${cls.capacity}`}
              />
            </div>
          </td>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {onEditClass && (
            <ContextMenuItem onClick={() => onEditClass(cls)}>
              <Edit className="h-4 w-4 mr-2" />
              {locale === 'ar' ? 'تعديل' : 'Edit'}
            </ContextMenuItem>
          )}
          {onDeleteClass && (
            <ContextMenuItem
              onClick={() => onDeleteClass(cls)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  // Multiple classes - stack vertically
  return (
    <td className="border p-2 min-w-[3rem]">
      <div className="flex flex-col divide-y">
        {classes.map((cls) => {
          const fillPercentage = (cls.booked_seats / cls.capacity) * 100;
          const classTypeName = cls.name || cls.class_type || 'Class';
          const configKey = `${classTypeName}|${cls.instructor}`;
          const configColor = getConfigColor(configKey);

          return (
            <ContextMenu key={cls.id}>
              <ContextMenuTrigger asChild>
                <div className="py-2 flex flex-col items-center gap-2 cursor-pointer hover:bg-accent/50 transition-colors min-h-[6rem]">
                  {/* Color dot */}
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: configColor }}
                  />

                  {/* Class info */}
                  <div className="w-full text-center flex-1 flex flex-col justify-center">
                    <p className="text-xs font-semibold truncate">{classTypeName}</p>
                    <p className="text-xs text-muted-foreground truncate">{cls.instructor}</p>
                  </div>

                  {/* Progress indicator */}
                  <CircularProgress
                    value={fillPercentage}
                    size="sm"
                    label={`${cls.booked_seats}/${cls.capacity}`}
                  />
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                {onEditClass && (
                  <ContextMenuItem onClick={() => onEditClass(cls)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {locale === 'ar' ? 'تعديل' : 'Edit'}
                  </ContextMenuItem>
                )}
                {onDeleteClass && (
                  <ContextMenuItem
                    onClick={() => onDeleteClass(cls)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                  </ContextMenuItem>
                )}
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>
    </td>
  );
}
