'use client';

import { useState, useMemo } from 'react';
import { Plus, CheckSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGroupedGenerations } from '@/lib/creative-studio/hooks';
import { InboxItem } from './inbox-item';
import type { Generation } from '@/lib/creative-studio/types';

interface InboxListProps {
  onTaskClick: (task: Generation) => void;
  onCreateClick: () => void;
  selectedTaskId?: number | null;
}

export function InboxList({ onTaskClick, onCreateClick, selectedTaskId }: InboxListProps) {
  const { data: groupedData, isLoading, error } = useGroupedGenerations();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Flatten and sort tasks by priority
  const sortedTasks = useMemo(() => {
    if (!groupedData) return [];

    const allTasks: Generation[] = [
      ...(groupedData.todo || []),
      ...(groupedData.in_progress || []),
      ...(groupedData.review || []),
      ...(groupedData.done || []),
    ];

    // Priority sorting: Failed > Ready for Review > Processing > Recent
    return allTasks.sort((a, b) => {
      // Priority 1: Failed tasks (highest priority)
      const aFailed = a.status === 'failed';
      const bFailed = b.status === 'failed';
      if (aFailed && !bFailed) return -1;
      if (!aFailed && bFailed) return 1;

      // Priority 2: Ready for review (completed, not yet approved)
      const aReview = a.taskStatus === 'review' && a.status === 'completed';
      const bReview = b.taskStatus === 'review' && b.status === 'completed';
      if (aReview && !bReview) return -1;
      if (!aReview && bReview) return 1;

      // Priority 3: Processing tasks
      const aProcessing = a.status === 'pending' || a.status === 'processing';
      const bProcessing = b.status === 'pending' || b.status === 'processing';
      if (aProcessing && !bProcessing) return -1;
      if (!aProcessing && bProcessing) return 1;

      // Priority 4: Sort by updated time (most recent first)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [groupedData]);

  const handleToggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sortedTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedTasks.map((t) => t.id)));
    }
  };

  const handleExitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <p>Failed to load tasks</p>
        <p className="text-sm text-muted-foreground mt-1">Please try again</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-stone-50/50 sticky top-0 z-10">
        <Button
          onClick={onCreateClick}
          size="sm"
          className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''}
          </span>
          {!selectMode ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectMode(true)}
              className="text-muted-foreground"
            >
              <CheckSquare className="h-4 w-4 mr-1.5" />
              Select
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedIds.size === sortedTasks.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExitSelectMode}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk action bar (when items selected) */}
      {selectMode && selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-stone-50">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Approve All
            </Button>
            <Button variant="outline" size="sm" className="text-destructive">
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="flex-1 overflow-auto">
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-4">
              <span className="text-3xl">🎨</span>
            </div>
            <h3 className="font-medium text-lg text-stone-800 mb-1">Your creative inbox is empty</h3>
            <p className="text-sm text-stone-500 mb-4 max-w-xs">
              Start creating beautiful AI-generated images for your pilates studio
            </p>
            <Button
              onClick={onCreateClick}
              size="sm"
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Your First
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {sortedTasks.map((task) => (
              <InboxItem
                key={task.id}
                task={task}
                isSelected={selectedTaskId === task.id}
                isChecked={selectedIds.has(task.id)}
                showCheckbox={selectMode}
                onClick={() => !selectMode && onTaskClick(task)}
                onToggleCheck={() => handleToggleSelect(task.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
