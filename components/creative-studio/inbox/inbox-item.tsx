'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Generation } from '@/lib/creative-studio/types';

interface InboxItemProps {
  task: Generation;
  isSelected?: boolean;
  isChecked?: boolean;
  showCheckbox?: boolean;
  onClick?: () => void;
  onToggleCheck?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon?: React.ReactNode }> = {
  pending: {
    label: 'Generating',
    className: 'bg-blue-100 text-blue-700',
    icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
  },
  processing: {
    label: 'Generating',
    className: 'bg-blue-100 text-blue-700',
    icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-700',
    icon: <AlertCircle className="h-3 w-3 mr-1" />,
  },
  review: {
    label: 'Review',
    className: 'bg-amber-100 text-amber-700',
  },
  done: {
    label: 'Approved',
    className: 'bg-green-100 text-green-700',
    icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
  },
  todo: {
    label: 'Queued',
    className: 'bg-slate-100 text-slate-700',
  },
  in_progress: {
    label: 'Generating',
    className: 'bg-blue-100 text-blue-700',
    icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
  },
};

export function InboxItem({
  task,
  isSelected = false,
  isChecked = false,
  showCheckbox = false,
  onClick,
  onToggleCheck,
}: InboxItemProps) {
  const [imageVersions, setImageVersions] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Get the display image (result or source thumbnail)
  const displayImage = task.resultThumbnailUrl || task.resultImageUrl || task.sourceImageUrl;

  // Determine status based on generation status and task status
  const isProcessing = task.status === 'pending' || task.status === 'processing';
  const isFailed = task.status === 'failed';
  const statusKey = isFailed ? 'failed' : isProcessing ? 'processing' : task.taskStatus;
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.todo;

  // Get preview text (would come from version history in real implementation)
  const getPreviewText = () => {
    if (isFailed) {
      return task.errorMessage || 'Generation failed';
    }
    if (isProcessing) {
      return 'Working on your request...';
    }
    if (task.reviewComment) {
      return task.reviewComment;
    }
    if (task.taskStatus === 'done') {
      return 'Final version approved';
    }
    if (task.versionNumber > 1) {
      return `Version ${task.versionNumber} ready for review`;
    }
    return 'First version generated';
  };

  // Animated version preview on hover (if multiple versions)
  useEffect(() => {
    if (!isHovering || imageVersions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % imageVersions.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [isHovering, imageVersions.length]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
        isSelected ? 'bg-stone-100' : 'hover:bg-stone-50',
        isFailed && 'bg-red-50/50'
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setCurrentImageIndex(0);
      }}
    >
      {/* Checkbox (in select mode) */}
      {showCheckbox && (
        <div
          className="pt-1"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck?.();
          }}
        >
          <Checkbox checked={isChecked} />
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
        {displayImage ? (
          <img
            src={displayImage}
            alt={task.title || 'Task thumbnail'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {/* Processing overlay */}
        {isProcessing && displayImage && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}

        {/* Version indicator */}
        {task.versionNumber > 1 && !isProcessing && (
          <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[10px] px-1 rounded">
            v{task.versionNumber}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm truncate">
            {task.title || `Task #${task.id}`}
          </h4>
          <Badge className={cn('text-xs shrink-0 flex items-center', statusConfig.className)}>
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground truncate mt-0.5">
          {getPreviewText()}
        </p>

        <span className="text-xs text-muted-foreground mt-1 block">
          {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
