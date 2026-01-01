'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Download, ExternalLink, Search, Grid3X3, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGroupedGenerations } from '@/lib/creative-studio/hooks';
import type { Generation } from '@/lib/creative-studio/types';

interface ApprovedGalleryProps {
  onTaskClick?: (task: Generation) => void;
}

export function ApprovedGallery({ onTaskClick }: ApprovedGalleryProps) {
  const { data: groupedData, isLoading, error } = useGroupedGenerations();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        Failed to load gallery. Please try again.
      </div>
    );
  }

  const approvedTasks = groupedData?.done || [];

  // Filter by search
  const filteredTasks = approvedTasks.filter((task: Generation) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      task.title?.toLowerCase().includes(searchLower) ||
      task.builtPrompt?.toLowerCase().includes(searchLower) ||
      `#${task.id}`.includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search approved creatives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredTasks.length} approved
          </span>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'large' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode('large')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p>No approved creatives yet</p>
          <p className="text-sm">Approve tasks from the Review column to see them here</p>
        </div>
      ) : (
        <div
          className={cn(
            'grid gap-4',
            viewMode === 'grid'
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {filteredTasks.map((task) => (
            <GalleryCard
              key={task.id}
              task={task}
              viewMode={viewMode}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface GalleryCardProps {
  task: Generation;
  viewMode: 'grid' | 'large';
  onClick?: () => void;
}

function GalleryCard({ task, viewMode, onClick }: GalleryCardProps) {
  const imageUrl = task.resultImageUrl || task.resultThumbnailUrl;

  return (
    <Card
      className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div
        className={cn(
          'relative bg-muted',
          viewMode === 'grid' ? 'aspect-square' : 'aspect-[4/3]'
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={task.title || 'Approved creative'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {task.resultImageUrl && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(task.resultImageUrl!, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
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
      </div>

      <CardContent className="p-3">
        <h4 className="font-medium text-sm truncate">
          {task.title || `Generation #${task.id}`}
        </h4>
        <div className="flex items-center gap-1 mt-1">
          <Badge variant="outline" className="text-xs">
            {task.resolution}
          </Badge>
          {task.versionNumber > 1 && (
            <Badge variant="secondary" className="text-xs">
              v{task.versionNumber}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
