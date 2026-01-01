'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Loader2 } from 'lucide-react';
import { KanbanColumn } from './kanban-column';
import { KanbanTaskCard } from './kanban-task-card';
import { useGroupedGenerations, useUpdateTaskStatus, useReorderTasks } from '@/lib/creative-studio/hooks';
import type { Generation, TaskStatus, GroupedGenerations } from '@/lib/creative-studio/types';

interface KanbanBoardProps {
  onTaskClick?: (task: Generation) => void;
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

export function KanbanBoard({ onTaskClick }: KanbanBoardProps) {
  const { data: responseData, isLoading, error } = useGroupedGenerations();
  const updateTaskStatus = useUpdateTaskStatus();
  const reorderTasks = useReorderTasks();

  const [activeTask, setActiveTask] = useState<Generation | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as Generation | undefined;
    if (task) {
      setActiveTask(task);
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Handle visual feedback during drag
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const activeTask = active.data.current?.task as Generation | undefined;
      if (!activeTask) return;

      // Determine the target status
      let targetStatus: TaskStatus | null = null;

      // Check if dropped on a column
      if (over.data.current?.type === 'column') {
        targetStatus = over.data.current.status as TaskStatus;
      }
      // Check if dropped on another task
      else if (over.data.current?.type === 'task') {
        const overTask = over.data.current.task as Generation;
        targetStatus = overTask.taskStatus;
      }
      // Check if dropped on column ID directly
      else if (COLUMNS.some((col) => col.id === over.id)) {
        targetStatus = over.id as TaskStatus;
      }

      if (!targetStatus) return;

      // Only update if status changed
      if (activeTask.taskStatus !== targetStatus) {
        updateTaskStatus.mutate({ id: activeTask.id, taskStatus: targetStatus });
      }
    },
    [updateTaskStatus]
  );

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
        Failed to load tasks. Please try again.
      </div>
    );
  }

  const groupedData: GroupedGenerations = responseData || {
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-220px)]">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={groupedData[column.id] || []}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <KanbanTaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
