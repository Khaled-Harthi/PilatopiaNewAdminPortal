'use client';

import { cn } from '@/lib/utils';
import type { LoyaltyTier } from '@/lib/members/types';
import { getTierConfig } from '@/lib/members/types';

interface LoyaltyTierBadgeProps {
  tier: LoyaltyTier;
  tierColor?: string; // hex color from backend
  lifetimeClasses?: number;
  totalPoints?: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Fallback styles if no tierColor provided
const tierStyles: Record<LoyaltyTier, string> = {
  bronze: 'bg-amber-100 text-amber-800',
  silver: 'bg-slate-100 text-slate-700',
  gold: 'bg-yellow-100 text-yellow-800',
  platinum: 'bg-purple-100 text-purple-800',
  vip: 'bg-amber-50 text-amber-600 ring-1 ring-amber-300',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function LoyaltyTierBadge({
  tier,
  tierColor,
  lifetimeClasses,
  totalPoints,
  showDetails = false,
  size = 'md',
  className,
}: LoyaltyTierBadgeProps) {
  const config = getTierConfig(tier);

  // Use backend color if provided, otherwise use fallback styles
  const badgeStyle = tierColor
    ? { backgroundColor: `${tierColor}20`, color: tierColor }
    : undefined;

  return (
    <div className={cn('space-y-1', className)}>
      <span
        className={cn(
          'inline-flex items-center font-medium rounded-md uppercase tracking-wide',
          !tierColor && tierStyles[tier],
          sizeStyles[size]
        )}
        style={badgeStyle}
      >
        {config.label}
      </span>
      {showDetails && (lifetimeClasses !== undefined || totalPoints !== undefined) && (
        <p className="text-sm text-muted-foreground">
          {lifetimeClasses !== undefined && (
            <span>{lifetimeClasses.toLocaleString()} lifetime classes</span>
          )}
          {lifetimeClasses !== undefined && totalPoints !== undefined && (
            <span className="mx-1">·</span>
          )}
          {totalPoints !== undefined && (
            <span>{totalPoints.toLocaleString()} points</span>
          )}
        </p>
      )}
    </div>
  );
}
