'use client';

import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number; // 0-100 percentage
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string; // e.g., "8/10" or "85%"
  className?: string;
  color?: string; // Optional custom color (e.g., "hsl(200, 65%, 55%)")
}

export function CircularProgress({
  value,
  size = 'md',
  showLabel = true,
  label,
  className,
  color,
}: CircularProgressProps) {
  // Determine color based on value (only used when no custom color provided)
  const getColorClass = () => {
    if (color) return ''; // Custom color will be applied via style
    if (value >= 100) return 'text-red-500';
    if (value >= 75) return 'text-orange-500';
    if (value >= 50) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  // Size configurations
  const sizeConfig = {
    sm: { circle: 24, stroke: 3, fontSize: 'text-[11px]' },
    md: { circle: 32, stroke: 4, fontSize: 'text-[10px]' },
    lg: { circle: 48, stroke: 5, fontSize: 'text-xs' },
  };

  const config = sizeConfig[size];
  const radius = (config.circle - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <svg
        width={config.circle}
        height={config.circle}
        className={cn('transform -rotate-90', getColorClass())}
        style={color ? { color } : undefined}
      >
        {/* Background circle */}
        <circle
          cx={config.circle / 2}
          cy={config.circle / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          opacity={0.2}
        />
        {/* Progress circle */}
        <circle
          cx={config.circle / 2}
          cy={config.circle / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      {showLabel && label && (
        <span
          className={cn(config.fontSize, 'font-medium', getColorClass())}
          style={color ? { color } : undefined}
        >
          {label}
        </span>
      )}
    </div>
  );
}
