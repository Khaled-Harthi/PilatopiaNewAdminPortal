'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Download, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Generation } from '@/lib/creative-studio/types';

interface LibraryCardProps {
  task: Generation;
  onClick?: () => void;
}

export function LibraryCard({ task, onClick }: LibraryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = task.resultImageUrl || task.resultThumbnailUrl;
  const title = task.title || `Creative #${task.id}`;

  // Generate a random-ish aspect ratio for visual variety
  // In real app, you'd store actual image dimensions
  const aspectRatios = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-square', 'aspect-[5/4]'];
  const aspectRatio = aspectRatios[task.id % aspectRatios.length];

  return (
    <div
      className={cn(
        'group relative rounded-2xl overflow-hidden bg-stone-100 cursor-pointer',
        'transition-all duration-300 ease-out',
        'hover:shadow-xl hover:-translate-y-1'
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className={cn('relative', aspectRatio)}>
        {imageUrl && !imageError ? (
          <>
            {/* Skeleton while loading */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 animate-pulse" />
            )}
            <img
              src={imageUrl}
              alt={title}
              className={cn(
                'w-full h-full object-cover transition-opacity duration-300',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-400 bg-stone-200">
            No image
          </div>
        )}

        {/* Hover Overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent',
            'transition-opacity duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {task.taskStatus === 'done' && (
            <Badge
              variant="secondary"
              className="bg-green-500/90 text-white text-xs backdrop-blur-sm"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Approved
            </Badge>
          )}
          {task.versionNumber > 1 && (
            <Badge
              variant="secondary"
              className="bg-black/50 text-white text-xs backdrop-blur-sm"
            >
              v{task.versionNumber}
            </Badge>
          )}
        </div>

        {/* Hover Actions */}
        <div
          className={cn(
            'absolute top-3 right-3 flex items-center gap-1.5',
            'transition-all duration-200',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          )}
        >
          {task.resultImageUrl && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(task.resultImageUrl!, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a href={task.resultImageUrl} download>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </>
          )}
        </div>

        {/* Bottom Info (on hover) */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 p-4',
            'transition-all duration-200',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}
        >
          <h4 className="font-medium text-white text-sm truncate mb-1">
            {title}
          </h4>
          <div className="flex items-center gap-2 text-white/70 text-xs">
            <span>{task.resolution}</span>
            <span>-</span>
            <span>{format(new Date(task.completedAt || task.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
