'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { MoreHorizontal, Pencil, Copy, Power, PowerOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { HomeLayoutSummary } from '@/lib/home-layouts/types';

interface LayoutCardProps {
  layout: HomeLayoutSummary;
  onActivate: (id: number) => void;
  onDeactivate: (id: number) => void;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
  isActivating?: boolean;
  isDeactivating?: boolean;
  isDuplicating?: boolean;
}

export function LayoutCard({
  layout,
  onActivate,
  onDeactivate,
  onDuplicate,
  onDelete,
  isActivating,
  isDeactivating,
  isDuplicating,
}: LayoutCardProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const dateLocale = isRTL ? ar : enUS;

  const isLoading = isActivating || isDeactivating || isDuplicating;

  const timeAgo = formatDistanceToNow(new Date(layout.updated_at), {
    addSuffix: true,
    locale: dateLocale,
  });

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/settings/content/home-layouts/${layout.id}`}
            className="font-medium hover:underline truncate"
          >
            {layout.name}
          </Link>
          <Badge variant={layout.is_active ? 'default' : 'secondary'}>
            {layout.is_active
              ? isRTL
                ? 'نشط'
                : 'Active'
              : isRTL
                ? 'غير نشط'
                : 'Inactive'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {isRTL
            ? `${layout.component_count} مكون · v${layout.version} · ${timeAgo}`
            : `${layout.component_count} components · v${layout.version} · ${timeAgo}`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/settings/content/home-layouts/${layout.id}`}>
          <Button variant="ghost" size="sm" disabled={isLoading}>
            <Pencil className="h-4 w-4 me-1" />
            {isRTL ? 'تعديل' : 'Edit'}
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isLoading}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{isRTL ? 'المزيد' : 'More'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
            <DropdownMenuItem onClick={() => onDuplicate(layout.id)}>
              <Copy className="h-4 w-4 me-2" />
              {isRTL ? 'نسخ' : 'Duplicate'}
            </DropdownMenuItem>

            {layout.is_active ? (
              <DropdownMenuItem onClick={() => onDeactivate(layout.id)}>
                <PowerOff className="h-4 w-4 me-2" />
                {isRTL ? 'إلغاء التفعيل' : 'Deactivate'}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onActivate(layout.id)}>
                <Power className="h-4 w-4 me-2" />
                {isRTL ? 'تفعيل' : 'Activate'}
              </DropdownMenuItem>
            )}

            {!layout.is_active && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(layout.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  {isRTL ? 'حذف' : 'Delete'}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
