'use client';

import { useState, useMemo } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useGroupedGenerations } from '@/lib/creative-studio/hooks';
import { MasonryGrid } from './masonry-grid';
import { LibraryCard } from './library-card';
import type { Generation } from '@/lib/creative-studio/types';

interface LibraryProps {
  onTaskClick?: (task: Generation) => void;
}

export function Library({ onTaskClick }: LibraryProps) {
  const { data: groupedData, isLoading, error } = useGroupedGenerations();
  const [search, setSearch] = useState('');

  // Get all approved tasks from the 'done' column
  const approvedTasks = useMemo(() => {
    return groupedData?.done || [];
  }, [groupedData]);

  // Filter by search
  const filteredTasks = useMemo(() => {
    if (!search.trim()) return approvedTasks;

    const searchLower = search.toLowerCase();
    return approvedTasks.filter((task: Generation) => {
      return (
        task.title?.toLowerCase().includes(searchLower) ||
        task.builtPrompt?.toLowerCase().includes(searchLower) ||
        `#${task.id}`.includes(searchLower)
      );
    });
  }, [approvedTasks, search]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-stone-500">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <span className="text-sm">Loading your library...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-4xl mb-4">😕</div>
        <h3 className="font-medium text-lg text-stone-700 mb-1">Couldn't load library</h3>
        <p className="text-sm text-stone-500">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search your creatives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-stone-50 border-stone-200 rounded-xl focus:bg-white transition-colors"
          />
        </div>
        <span className="text-sm text-stone-500">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'creative' : 'creatives'}
        </span>
      </div>

      {/* Masonry Grid */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
          {approvedTasks.length === 0 ? (
            <>
              <Sparkles className="h-12 w-12 text-amber-400 mb-4" />
              <h3 className="font-medium text-lg text-stone-700 mb-2">
                Your library is empty
              </h3>
              <p className="text-sm text-stone-500 max-w-sm">
                Approved creatives will appear here. Start by creating a new task
                and approving the results you love!
              </p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-medium text-lg text-stone-700 mb-1">
                No matches found
              </h3>
              <p className="text-sm text-stone-500">
                Try a different search term
              </p>
            </>
          )}
        </div>
      ) : (
        <MasonryGrid
          items={filteredTasks}
          getItemKey={(task) => task.id}
          columns={4}
          gap={20}
          renderItem={(task) => (
            <LibraryCard
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          )}
        />
      )}
    </div>
  );
}
