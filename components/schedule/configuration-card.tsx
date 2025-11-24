'use client';

import { Button } from '@/components/ui/button';
import { Edit2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClassConfiguration {
  id: string;
  classTypeId: number;
  instructorId: number;
  classRoomId: number;
  capacity: number;
  durationMinutes: number;
  color: string;
  // Display names (populated from API data)
  classTypeName?: string;
  instructorName?: string;
  roomName?: string;
}

interface ConfigurationCardProps {
  config: ClassConfiguration;
  isActive: boolean;
  slotCount: number;
  onEdit: () => void;
  onRemove: () => void;
  onClick: () => void;
  locale: string;
}

export function ConfigurationCard({
  config,
  isActive,
  slotCount,
  onEdit,
  onRemove,
  onClick,
  locale,
}: ConfigurationCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors cursor-pointer',
        isActive ? 'bg-accent border-accent' : 'bg-card'
      )}
      onClick={onClick}
    >
      <div className="space-y-1">
        {/* Header with color badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="rounded-full px-1.5 py-0.5 min-w-[24px] flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: config.color }}
            >
              <span className="text-[10px] font-semibold text-white leading-none">
                {slotCount}
              </span>
            </div>
            <h4 className="font-semibold text-sm truncate">
              {config.classTypeName || 'Unknown'}
            </h4>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="h-7 w-7"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="h-7 w-7 text-destructive hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Instructor */}
        <div className="text-xs text-muted-foreground pl-7">
          {config.instructorName || '-'}
        </div>

        {/* Details */}
        <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground pl-7">
          <span>{config.roomName || '-'}</span>
          <span>•</span>
          <span>{config.durationMinutes} {locale === 'ar' ? 'دقيقة' : 'min'}</span>
          <span>•</span>
          <span>{config.capacity} {locale === 'ar' ? 'مقاعد' : 'seats'}</span>
        </div>
      </div>
    </div>
  );
}
