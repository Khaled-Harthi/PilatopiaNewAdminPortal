'use client';

import { useLocale } from 'next-intl';
import { ComponentPreview } from './component-preview';
import type { HomeLayoutComponent } from '@/lib/home-layouts/types';
import { useMemo } from 'react';

interface PhoneFramePreviewProps {
  components: HomeLayoutComponent[];
  layoutName: string;
}

export function PhoneFramePreview({ components, layoutName }: PhoneFramePreviewProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const sortedComponents = useMemo(() => {
    return [...components]
      .filter((c) => c.visible)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [components]);

  // Current time for status bar
  const currentTime = new Date().toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-sm font-semibold">
          {isRTL ? 'المعاينة' : 'Preview'}
        </h2>
        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
          {layoutName || (isRTL ? 'تخطيط جديد' : 'New Layout')}
        </span>
      </div>

      {/* Phone Frame */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-hidden bg-muted/30">
        <div className="relative">
          {/* iPhone Frame */}
          <div className="relative w-[280px] h-[580px] bg-black rounded-[45px] p-[10px] shadow-2xl">
            {/* Inner bezel */}
            <div className="absolute inset-[3px] border-2 border-gray-800 rounded-[42px] pointer-events-none" />

            {/* Dynamic Island */}
            <div className="absolute top-[15px] left-1/2 -translate-x-1/2 w-[90px] h-[25px] bg-black rounded-full z-20" />

            {/* Screen */}
            <div className="w-full h-full bg-background rounded-[35px] overflow-hidden">
              {/* Status Bar */}
              <div className="flex items-center justify-between px-6 pt-[45px] pb-2 text-[10px] text-foreground">
                <span className="font-medium">{currentTime}</span>
                <div className="flex items-center gap-1">
                  {/* Signal */}
                  <svg className="w-4 h-2.5" viewBox="0 0 18 12" fill="currentColor">
                    <rect x="0" y="6" width="3" height="6" rx="0.5" opacity="0.3" />
                    <rect x="5" y="4" width="3" height="8" rx="0.5" opacity="0.5" />
                    <rect x="10" y="2" width="3" height="10" rx="0.5" opacity="0.7" />
                    <rect x="15" y="0" width="3" height="12" rx="0.5" />
                  </svg>
                  {/* WiFi */}
                  <svg className="w-4 h-3" viewBox="0 0 16 12" fill="currentColor">
                    <path d="M8 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                    <path d="M4.5 8a5 5 0 017 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M2 5.5a8 8 0 0112 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                    <path d="M0 3a11 11 0 0116 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                  </svg>
                  {/* Battery */}
                  <div className="flex items-center">
                    <div className="w-5 h-2.5 border border-current rounded-sm p-[1px]">
                      <div className="w-full h-full bg-current rounded-[1px]" />
                    </div>
                    <div className="w-[2px] h-1.5 bg-current rounded-r-sm" />
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div
                className="h-[calc(100%-65px)] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {sortedComponents.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center p-4">
                    <p className="text-xs text-muted-foreground">
                      {isRTL
                        ? 'أضف مكونات لمعاينتها هنا'
                        : 'Add components to preview them here'}
                    </p>
                  </div>
                ) : (
                  <div className="pb-8">
                    {sortedComponents.map((component) => (
                      <ComponentPreview key={component.id} component={component} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-foreground/30 rounded-full" />
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="p-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          {isRTL
            ? 'معاينة تقريبية - قد يختلف المظهر في التطبيق'
            : 'Approximate preview - appearance may vary in app'}
        </p>
      </div>
    </div>
  );
}
