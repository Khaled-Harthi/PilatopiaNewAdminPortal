'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCompareSliderProps {
  originalUrl: string;
  resultUrl: string;
  initialPosition?: number; // 0-100, default 50
  className?: string;
}

export function ImageCompareSlider({
  originalUrl,
  resultUrl,
  initialPosition = 50,
  className,
}: ImageCompareSliderProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      handleMove(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full aspect-[4/3] overflow-hidden rounded-xl select-none',
        isDragging && 'cursor-col-resize',
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Original image (background/left side) */}
      <img
        src={originalUrl}
        alt="Original"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Result image (foreground/right side, clipped) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 0 0 ${position}%)`,
        }}
      >
        <img
          src={resultUrl}
          alt="Result"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        {/* Handle grip */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Top/bottom arrows */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-white" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white" />
      </div>

      {/* Labels */}
      <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white text-xs rounded">
        Original
      </div>
      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded">
        Result
      </div>
    </div>
  );
}
