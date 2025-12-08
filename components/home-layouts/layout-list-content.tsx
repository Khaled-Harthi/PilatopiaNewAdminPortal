'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LayoutCard } from './layout-card';
import { DeleteLayoutDialog } from './delete-layout-dialog';
import {
  useHomeLayouts,
  useActivateHomeLayout,
  useDeactivateHomeLayout,
  useDuplicateHomeLayout,
  useDeleteHomeLayout,
} from '@/lib/home-layouts/hooks';
import type { HomeLayoutSummary } from '@/lib/home-layouts/types';
import { toast } from 'sonner';

export function LayoutListContent() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const { data: layouts, isLoading, error } = useHomeLayouts();
  const activateMutation = useActivateHomeLayout();
  const deactivateMutation = useDeactivateHomeLayout();
  const duplicateMutation = useDuplicateHomeLayout();
  const deleteMutation = useDeleteHomeLayout();

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    layout: HomeLayoutSummary | null;
  }>({ open: false, layout: null });

  // Separate active and inactive layouts
  const activeLayouts = layouts?.filter((l) => l.is_active) ?? [];
  const inactiveLayouts = layouts?.filter((l) => !l.is_active) ?? [];

  const handleActivate = async (id: number) => {
    try {
      await activateMutation.mutateAsync(id);
      toast.success(isRTL ? 'تم تفعيل التخطيط' : 'Layout activated');
    } catch {
      toast.error(isRTL ? 'فشل تفعيل التخطيط' : 'Failed to activate layout');
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await deactivateMutation.mutateAsync(id);
      toast.success(isRTL ? 'تم إلغاء تفعيل التخطيط' : 'Layout deactivated');
    } catch {
      toast.error(isRTL ? 'فشل إلغاء تفعيل التخطيط' : 'Failed to deactivate layout');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await duplicateMutation.mutateAsync({ id });
      toast.success(isRTL ? 'تم نسخ التخطيط' : 'Layout duplicated');
    } catch {
      toast.error(isRTL ? 'فشل نسخ التخطيط' : 'Failed to duplicate layout');
    }
  };

  const handleDeleteClick = (layout: HomeLayoutSummary) => {
    setDeleteDialog({ open: true, layout });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.layout) return;
    try {
      await deleteMutation.mutateAsync(deleteDialog.layout.id);
      toast.success(isRTL ? 'تم حذف التخطيط' : 'Layout deleted');
      setDeleteDialog({ open: false, layout: null });
    } catch {
      toast.error(isRTL ? 'فشل حذف التخطيط' : 'Failed to delete layout');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {isRTL ? 'فشل تحميل التخطيطات' : 'Failed to load layouts'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {isRTL ? 'تخطيطات الرئيسية' : 'Home Layouts'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL
              ? 'إدارة تخطيطات الشاشة الرئيسية لتطبيق الجوال'
              : 'Manage mobile app home screen layouts'}
          </p>
        </div>
        <Link href="/settings/content/home-layouts/new">
          <Button>
            <Plus className="h-4 w-4 me-2" />
            {isRTL ? 'تخطيط جديد' : 'New Layout'}
          </Button>
        </Link>
      </div>

      {/* Active Layouts */}
      {activeLayouts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {isRTL ? 'نشط' : 'Active'} ({activeLayouts.length})
          </h2>
          <div className="space-y-2">
            {activeLayouts.map((layout) => (
              <LayoutCard
                key={layout.id}
                layout={layout}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onDuplicate={handleDuplicate}
                onDelete={() => handleDeleteClick(layout)}
                isActivating={activateMutation.isPending}
                isDeactivating={deactivateMutation.isPending}
                isDuplicating={duplicateMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Layouts */}
      {inactiveLayouts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {isRTL ? 'غير نشط' : 'Inactive'} ({inactiveLayouts.length})
          </h2>
          <div className="space-y-2">
            {inactiveLayouts.map((layout) => (
              <LayoutCard
                key={layout.id}
                layout={layout}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onDuplicate={handleDuplicate}
                onDelete={() => handleDeleteClick(layout)}
                isActivating={activateMutation.isPending}
                isDeactivating={deactivateMutation.isPending}
                isDuplicating={duplicateMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {layouts?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {isRTL
              ? 'لا توجد تخطيطات بعد'
              : 'No layouts yet'}
          </p>
          <Link href="/settings/content/home-layouts/new">
            <Button>
              <Plus className="h-4 w-4 me-2" />
              {isRTL ? 'إنشاء أول تخطيط' : 'Create your first layout'}
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteLayoutDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, layout: deleteDialog.layout })}
        layoutName={deleteDialog.layout?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
