'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, GitBranch, Eye, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Generation } from '@/lib/creative-studio/types';

interface KanbanTaskCardProps {
  task: Generation;
  onClick?: () => void;
}

export function KanbanTaskCard({ task, onClick }: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Determine the thumbnail to show
  const thumbnailUrl = task.resultThumbnailUrl || task.resultImageUrl || task.sourceImageUrl;
  // Only show processing state when task is actually being worked on (not in todo)
  const isProcessing = (task.status === 'pending' || task.status === 'processing') && task.taskStatus !== 'todo';
  const isFailed = task.status === 'failed';
  const isBranch = !!task.branchedFromGenerationId;

  // Get the primary badge to show (only show one for cleaner look)
  const getPrimaryBadge = () => {
    if (isProcessing) {
      return (
        <Badge className="text-xs bg-blue-100 text-blue-700 border-0">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Generating
        </Badge>
      );
    }
    if (isFailed) {
      return (
        <Badge variant="destructive" className="text-xs">
          Failed
        </Badge>
      );
    }
    if (task.versionNumber > 1) {
      return (
        <Badge variant="secondary" className="text-xs">
          v{task.versionNumber}
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-pointer transition-all group overflow-hidden',
        'hover:shadow-md hover:border-primary/20',
        isDragging && 'opacity-50 shadow-lg rotate-2 scale-105',
        isProcessing && 'ring-2 ring-blue-500/20',
        isFailed && 'border-destructive/50'
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative aspect-[3/2] bg-muted overflow-hidden">
          {thumbnailUrl ? (
            <>
              <img
                src={thumbnailUrl}
                alt={task.title || 'Generation preview'}
                className={cn(
                  'w-full h-full object-cover transition-transform group-hover:scale-105',
                  isProcessing && 'opacity-60'
                )}
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="text-center text-white">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <span className="text-xs mt-1 block">Generating...</span>
                  </div>
                </div>
              )}
              {isFailed && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 backdrop-blur-[2px]">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              )}

              {/* Hover overlay with actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-start justify-end p-2 opacity-0 group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    className="p-1.5 rounded-md bg-white/90 hover:bg-white text-foreground shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick?.();
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="p-1.5 rounded-md bg-white/90 hover:bg-white text-foreground shadow-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              {isProcessing ? (
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <span className="text-xs mt-1 block">Generating...</span>
                </div>
              ) : (
                <span className="text-xs">No image</span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="p-3 space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate leading-tight">
                {task.title || `Generation #${task.id}`}
              </h4>
              {isBranch && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <GitBranch className="h-3 w-3" />
                  <span>Branch</span>
                </div>
              )}
            </div>
          </div>

          {/* Single primary badge */}
          {getPrimaryBadge() && (
            <div className="flex">
              {getPrimaryBadge()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
