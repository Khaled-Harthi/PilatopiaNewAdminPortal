'use client';

import { useLocale } from 'next-intl';
import { Construction } from 'lucide-react';

interface SettingsPlaceholderProps {
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
}

export function SettingsPlaceholder({
  title,
  titleAr,
  description = 'This section is under development.',
  descriptionAr = 'هذا القسم قيد التطوير.',
}: SettingsPlaceholderProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{isRTL ? titleAr : title}</h1>
      </div>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Construction className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-medium mb-2">
          {isRTL ? 'قريباً' : 'Coming Soon'}
        </h2>
        <p className="text-muted-foreground max-w-md">
          {isRTL ? descriptionAr : description}
        </p>
      </div>
    </div>
  );
}
