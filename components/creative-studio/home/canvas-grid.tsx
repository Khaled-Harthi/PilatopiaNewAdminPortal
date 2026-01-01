'use client';

import { format } from 'date-fns';
import { Plus, Trash2, Loader2, RotateCcw, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCanvases, useRestoreCanvas, usePermanentDeleteCanvas } from '@/lib/creative-studio/hooks';
import type { Canvas } from '@/lib/creative-studio/types';

interface CanvasGridProps {
  onOpenCanvas: (canvasId: number) => void;
  onCreateCanvas: () => void;
}

export function CanvasGrid({ onOpenCanvas, onCreateCanvas }: CanvasGridProps) {
  const { data, isLoading, error } = useCanvases();
  const restoreCanvas = useRestoreCanvas();
  const permanentDelete = usePermanentDeleteCanvas();

  const canvases = data?.active || [];
  const trashed = data?.trashed || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Failed to load canvases. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Canvas Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Create New Canvas Card */}
        <button
          onClick={onCreateCanvas}
          className="group aspect-square rounded-xl border-2 border-dashed border-stone-200 hover:border-amber-400 bg-stone-50 hover:bg-amber-50/50 flex flex-col items-center justify-center gap-3 transition-all"
        >
          <div className="h-12 w-12 rounded-full bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
            <Plus className="h-6 w-6 text-stone-400 group-hover:text-amber-600" />
          </div>
          <span className="text-sm font-medium text-stone-500 group-hover:text-amber-700">
            New Canvas
          </span>
        </button>

        {/* Canvas Cards */}
        {canvases.map((canvas) => (
          <CanvasCard
            key={canvas.id}
            canvas={canvas}
            onClick={() => onOpenCanvas(canvas.id)}
          />
        ))}
      </div>

      {/* Trash Section */}
      {trashed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="h-4 w-4 text-stone-400" />
            <span className="text-sm font-medium text-stone-500">
              Trash ({trashed.length} {trashed.length === 1 ? 'item' : 'items'})
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trashed.map((canvas) => (
              <CanvasCard
                key={canvas.id}
                canvas={canvas}
                isTrashed
                onClick={() => onOpenCanvas(canvas.id)}
                onRestore={() => restoreCanvas.mutate(canvas.id)}
                onDelete={() => permanentDelete.mutate(canvas.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface CanvasCardProps {
  canvas: Canvas;
  isTrashed?: boolean;
  onClick: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
}

function CanvasCard({ canvas, isTrashed, onClick, onRestore, onDelete }: CanvasCardProps) {
  return (
    <div
      className={cn(
        'group aspect-square rounded-xl border bg-white overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-stone-300 relative',
        isTrashed && 'opacity-60 hover:opacity-80'
      )}
    >
      {/* Main clickable area */}
      <button
        onClick={onClick}
        className="flex-1 flex flex-col w-full"
      >
        {/* Thumbnail */}
        <div className="flex-1 bg-stone-100 flex items-center justify-center">
          {canvas.thumbnailUrl ? (
            <img
              src={canvas.thumbnailUrl}
              alt={canvas.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 text-left">
          <h3 className="text-sm font-medium text-stone-800 truncate">{canvas.name}</h3>
          <p className="text-xs text-stone-400 mt-0.5">
            {format(new Date(canvas.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
      </button>

      {/* Trash actions */}
      {isTrashed && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onRestore && (
            <Button
              size="icon"
              variant="secondary"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onRestore();
              }}
              title="Restore"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="destructive"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete permanently"
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
