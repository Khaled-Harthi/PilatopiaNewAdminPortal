'use client';

import { useState, useMemo } from 'react';
import { Search, Download, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useLibrary, useCanvases } from '@/lib/creative-studio/hooks';
import type { LibraryItem } from '@/lib/creative-studio/api';

interface LibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedded?: boolean;
}

export function LibraryModal({ open, onOpenChange, embedded = false }: LibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [canvasFilter, setCanvasFilter] = useState<string>('all');

  // Fetch library and canvases
  const canvasIdFilter = canvasFilter !== 'all' ? parseInt(canvasFilter, 10) : undefined;
  const { data: libraryItems = [], isLoading } = useLibrary(canvasIdFilter);
  const { data: canvasesData } = useCanvases();

  // Filter by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) return libraryItems;
    const query = searchQuery.toLowerCase();
    return libraryItems.filter((item) =>
      item.title?.toLowerCase().includes(query) ||
      item.canvasName?.toLowerCase().includes(query) ||
      item.versionLabel?.toLowerCase().includes(query)
    );
  }, [libraryItems, searchQuery]);

  const canvases = canvasesData?.active || [];

  const content = (
    <div className={cn('flex flex-col', embedded ? 'h-full' : 'h-[80vh]')}>
      {/* Header with search and filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search library..."
            className="pl-10"
          />
        </div>
        <Select value={canvasFilter} onValueChange={setCanvasFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2 text-stone-400" />
            <SelectValue placeholder="All canvases" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All canvases</SelectItem>
            {canvases.map((canvas) => (
              <SelectItem key={canvas.id} value={canvas.id.toString()}>
                {canvas.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Masonry Grid */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-4">
            <span className="text-4xl">📸</span>
          </div>
          <h3 className="text-lg font-medium text-stone-800 mb-1">
            Your library is empty
          </h3>
          <p className="text-sm text-stone-500 max-w-xs">
            Liked images from your canvases will appear here for easy access and download.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
            {filteredItems.map((item) => (
              <LibraryCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh]">
        <DialogHeader>
          <DialogTitle>Library</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}

interface LibraryCardProps {
  item: LibraryItem;
}

function LibraryCard({ item }: LibraryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = item.resultImageUrl || item.resultThumbnailUrl;

  if (!imageUrl) return null;

  return (
    <div
      className="relative rounded-xl overflow-hidden bg-stone-100 break-inside-avoid group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={imageUrl}
        alt={item.title || item.versionLabel}
        className="w-full h-auto"
      />

      {/* Hover overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/40 flex items-end p-3">
          <div className="flex-1">
            <p className="text-white text-sm font-medium truncate">
              {item.title || item.versionLabel}
            </p>
            <p className="text-white/70 text-xs truncate">
              {item.canvasName}
            </p>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8"
            asChild
          >
            <a href={imageUrl} download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
