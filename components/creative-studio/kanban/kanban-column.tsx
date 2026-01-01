'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { KanbanTaskCard } from './kanban-task-card';
import type { Generation, TaskStatus } from '@/lib/creative-studio/types';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Generation[];
  onTaskClick?: (task: Generation) => void;
}

// Status dot colors for column headers
const STATUS_DOT_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  review: 'bg-amber-500',
  done: 'bg-green-500',
};

export function KanbanColumn({ id, title, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'column',
      status: id,
    },
  });

  const dotColor = STATUS_DOT_COLORS[id];
  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      className={cn(
        'flex flex-col h-full min-w-[300px] w-[300px] rounded-xl border bg-card',
        isOver && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <span className={cn('h-2 w-2 rounded-full', dotColor)} />
        <h3 className="font-medium text-sm text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <ScrollArea className="flex-1">
        <div ref={setNodeRef} className="p-3 space-y-3 min-h-[120px]">
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <KanbanTaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
              />
            ))}
          </SortableContext>

          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
              No tasks
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
