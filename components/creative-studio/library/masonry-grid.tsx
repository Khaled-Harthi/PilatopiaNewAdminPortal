'use client';

import { useMemo, useRef, useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MasonryGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getItemKey: (item: T) => string | number;
  columns?: number;
  gap?: number;
  className?: string;
}

export function MasonryGrid<T>({
  items,
  renderItem,
  getItemKey,
  columns = 4,
  gap = 16,
  className,
}: MasonryGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Responsive columns based on container width
  const responsiveColumns = useMemo(() => {
    if (containerWidth < 480) return 2;
    if (containerWidth < 768) return 3;
    if (containerWidth < 1024) return columns;
    return columns + 1;
  }, [containerWidth, columns]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Distribute items into columns for masonry effect
  const columnItems = useMemo(() => {
    const cols: T[][] = Array.from({ length: responsiveColumns }, () => []);

    items.forEach((item, index) => {
      // Simple round-robin distribution
      // For true masonry, you'd track column heights
      const columnIndex = index % responsiveColumns;
      cols[columnIndex].push(item);
    });

    return cols;
  }, [items, responsiveColumns]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn('w-full', className)}
      style={{ display: 'flex', gap: `${gap}px` }}
    >
      {columnItems.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex-1 flex flex-col"
          style={{ gap: `${gap}px` }}
        >
          {column.map((item, itemIndex) => (
            <div key={getItemKey(item)}>
              {renderItem(item, columnIndex * column.length + itemIndex)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
