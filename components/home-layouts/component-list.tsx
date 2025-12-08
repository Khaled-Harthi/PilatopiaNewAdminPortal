'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SortableComponentItem } from './sortable-component-item';
import type { HomeLayoutComponent, DynamicComponentType } from '@/lib/home-layouts/types';

const DYNAMIC_TYPES: DynamicComponentType[] = [
  'dynamic_card',
  'dynamic_banner',
  'dynamic_image_list',
];

interface ComponentListProps {
  components: HomeLayoutComponent[];
  onReorder: (newComponents: HomeLayoutComponent[]) => void;
  onToggleVisibility: (id: number) => void;
  onEdit: (component: HomeLayoutComponent) => void;
  onDelete: (id: number) => void;
  onAddClick: () => void;
}

export function ComponentList({
  components,
  onReorder,
  onToggleVisibility,
  onEdit,
  onDelete,
  onAddClick,
}: ComponentListProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

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

  const sortedComponents = useMemo(() => {
    return [...components].sort((a, b) => a.sort_order - b.sort_order);
  }, [components]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedComponents.findIndex((c) => c.id === active.id);
      const newIndex = sortedComponents.findIndex((c) => c.id === over.id);

      const newOrder = arrayMove(sortedComponents, oldIndex, newIndex).map(
        (c, index) => ({
          ...c,
          sort_order: index,
        })
      );
      onReorder(newOrder);
    }
  };

  const isDynamicComponent = (type: string): boolean => {
    return DYNAMIC_TYPES.includes(type as DynamicComponentType);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-sm font-semibold">
          {isRTL ? 'المكونات' : 'Components'}
        </h2>
        <span className="text-xs text-muted-foreground">
          {sortedComponents.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {sortedComponents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              {isRTL
                ? 'لا توجد مكونات بعد'
                : 'No components yet'}
            </p>
            <Button variant="outline" size="sm" onClick={onAddClick}>
              <Plus className="h-4 w-4 me-2" />
              {isRTL ? 'إضافة مكون' : 'Add Component'}
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedComponents.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sortedComponents.map((component) => (
                  <SortableComponentItem
                    key={component.id}
                    component={component}
                    onToggleVisibility={onToggleVisibility}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isDynamic={isDynamicComponent(component.component_type)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {sortedComponents.length > 0 && (
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={onAddClick}>
            <Plus className="h-4 w-4 me-2" />
            {isRTL ? 'إضافة مكون' : 'Add Component'}
          </Button>
        </div>
      )}
    </div>
  );
}
