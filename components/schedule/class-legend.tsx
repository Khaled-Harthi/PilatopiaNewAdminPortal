'use client';

import { useMemo } from 'react';
import type { PilatesClass } from '@/lib/schedule/types';

interface ClassLegendProps {
  classes: PilatesClass[];
  locale: string;
}

// Generate consistent color for a config
function getConfigColor(configKey: string): string {
  // Simple hash function to generate consistent colors
  let hash = 0;
  for (let i = 0; i < configKey.length; i++) {
    hash = configKey.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate HSL color with good saturation and lightness
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

export function ClassLegend({ classes, locale }: ClassLegendProps) {
  const configs = useMemo(() => {
    const configMap = new Map<string, { classType: string; instructor: string; color: string }>();

    classes.forEach(cls => {
      const classType = cls.name || cls.class_type || 'Unknown';
      const configKey = `${classType}|${cls.instructor}`;

      if (!configMap.has(configKey)) {
        configMap.set(configKey, {
          classType,
          instructor: cls.instructor,
          color: getConfigColor(configKey),
        });
      }
    });

    return Array.from(configMap.values()).sort((a, b) =>
      a.classType.localeCompare(b.classType) || a.instructor.localeCompare(b.instructor)
    );
  }, [classes]);

  if (configs.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
        {locale === 'ar' ? 'الدليل' : 'Legend'}
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {configs.map((config, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: config.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">
                <span className="font-semibold">{config.classType}</span>
                <span className="text-muted-foreground"> • {config.instructor}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export the color function for use in schedule cells
export { getConfigColor };
