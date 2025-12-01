'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { MemberStats } from '@/lib/members/types';

interface MembersSegmentTabsProps {
  activeSegment: string;
  onSegmentChange: (segment: string) => void;
  stats?: MemberStats | null;
  locale: string;
}

export function MembersSegmentTabs({
  activeSegment,
  onSegmentChange,
  stats,
  locale,
}: MembersSegmentTabsProps) {
  const isAr = locale === 'ar';

  const segments = [
    { value: 'all', label: isAr ? 'الكل' : 'All' },
    { value: 'expiring', label: isAr ? 'قريب الانتهاء' : 'Expiring Soon', count: stats?.expiring_soon },
    { value: 'inactive', label: isAr ? 'يحتاج متابعة' : 'Need Attention', count: stats?.inactive },
    { value: 'new', label: isAr ? 'جدد' : 'New', count: stats?.new_this_month },
    { value: 'no_membership', label: isAr ? 'بدون عضوية' : 'No Membership', count: stats?.no_membership },
  ];

  return (
    <ToggleGroup
      type="single"
      value={activeSegment}
      onValueChange={(value) => value && onSegmentChange(value)}
      className="bg-muted p-1 gap-1 rounded-lg justify-start"
    >
      {segments.map((segment) => (
        <ToggleGroupItem
          key={segment.value}
          value={segment.value}
          className="data-[state=on]:bg-background px-4 py-2 text-sm"
        >
          {segment.label}
          {segment.count !== undefined && segment.count > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">({segment.count})</span>
          )}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
