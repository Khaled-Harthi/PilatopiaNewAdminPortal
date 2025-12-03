'use client';

import { useState, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Pencil, Trash2, Loader2, GripVertical, Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import {
  useBanners,
  useDeleteBanner,
  useReorderBanners,
} from '@/lib/settings/hooks';
import type { Banner } from '@/lib/settings/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function getBannerStatus(banner: Banner): 'active' | 'scheduled' | 'expired' {
  const now = new Date();

  if (banner.start_date && new Date(banner.start_date) > now) {
    return 'scheduled';
  }

  if (banner.end_date && new Date(banner.end_date) < now) {
    return 'expired';
  }

  return 'active';
}

function StatusBadge({ status, isRTL }: { status: 'active' | 'scheduled' | 'expired'; isRTL: boolean }) {
  const variants = {
    active: {
      className: 'bg-green-500/10 text-green-700 hover:bg-green-500/20',
      label: isRTL ? 'نشط' : 'Active',
    },
    scheduled: {
      className: 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20',
      label: isRTL ? 'مجدول' : 'Scheduled',
    },
    expired: {
      className: 'bg-red-500/10 text-red-700 hover:bg-red-500/20',
      label: isRTL ? 'منتهي' : 'Expired',
    },
  };

  const variant = variants[status];

  return (
    <Badge variant="secondary" className={variant.className}>
      {variant.label}
    </Badge>
  );
}

interface SortableBannerRowProps {
  banner: Banner;
  isRTL: boolean;
  onDelete: (banner: Banner) => void;
}

function SortableBannerRow({ banner, isRTL, onDelete }: SortableBannerRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const status = getBannerStatus(banner);

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'opacity-50 bg-accent/50')}
    >
      <TableCell className="w-[50px]">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded touch-none"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="w-[80px]">
        <div className="relative w-16 h-10 rounded overflow-hidden bg-muted">
          {banner.image_url ? (
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="font-medium">{banner.title}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {banner.display_type === 'modal' ? (
            <span className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              {isRTL ? 'منبثق' : 'Modal'}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Monitor className="h-3 w-3" />
              {isRTL ? 'صفحة' : 'Screen'}
            </span>
          )}
        </Badge>
      </TableCell>
      <TableCell>
        <StatusBadge status={status} isRTL={isRTL} />
      </TableCell>
      <TableCell className="w-[100px]">
        <div className="flex items-center gap-1">
          <Link href={`/settings/content/banners/${banner.id}`}>
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(banner)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function BannersContent() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [localBanners, setLocalBanners] = useState<Banner[] | null>(null);

  const { data: banners, isLoading, error } = useBanners();
  const deleteMutation = useDeleteBanner();
  const reorderMutation = useReorderBanners();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Use local state for optimistic updates during drag, otherwise use fetched data
  const sortedBanners = useMemo(() => {
    const data = localBanners ?? banners ?? [];
    return [...data].sort((a, b) => a.sort_order - b.sort_order);
  }, [localBanners, banners]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedBanners.findIndex((b) => b.id === active.id);
      const newIndex = sortedBanners.findIndex((b) => b.id === over.id);

      const newOrder = arrayMove(sortedBanners, oldIndex, newIndex);
      setLocalBanners(newOrder);

      try {
        await reorderMutation.mutateAsync(newOrder.map((b) => b.id));
        toast.success(isRTL ? 'تم إعادة الترتيب' : 'Banners reordered');
      } catch {
        setLocalBanners(null);
        toast.error(isRTL ? 'فشل إعادة الترتيب' : 'Failed to reorder');
      } finally {
        setLocalBanners(null);
      }
    }
  };

  const handleDelete = (banner: Banner) => {
    setSelectedBanner(banner);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBanner) return;
    try {
      await deleteMutation.mutateAsync(selectedBanner.id);
      toast.success(isRTL ? 'تم حذف البانر' : 'Banner deleted');
      setDeleteDialogOpen(false);
    } catch {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          {isRTL ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {isRTL ? 'البانرات' : 'Banners'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? 'إدارة بانرات الصفحة الرئيسية في التطبيق'
              : 'Manage home screen carousel banners for the mobile app'}
          </p>
        </div>
        <Link href="/settings/content/banners/new">
          <Button>
            <Plus className="me-2 h-4 w-4" />
            {isRTL ? 'إضافة بانر' : 'Add Banner'}
          </Button>
        </Link>
      </div>

      {/* Table */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-[80px]">{isRTL ? 'الصورة' : 'Image'}</TableHead>
                <TableHead>{isRTL ? 'العنوان' : 'Title'}</TableHead>
                <TableHead>{isRTL ? 'النوع' : 'Type'}</TableHead>
                <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                <TableHead className="w-[100px]">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : !sortedBanners.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {isRTL ? 'لا توجد بانرات' : 'No banners found'}
                  </TableCell>
                </TableRow>
              ) : (
                <SortableContext
                  items={sortedBanners.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedBanners.map((banner) => (
                    <SortableBannerRow
                      key={banner.id}
                      banner={banner}
                      isRTL={isRTL}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </div>
      </DndContext>

      <p className="text-xs text-muted-foreground">
        {isRTL
          ? 'اسحب وأفلت لإعادة ترتيب البانرات. البانر الأول سيظهر أولاً في التطبيق.'
          : 'Drag and drop to reorder banners. The first banner will appear first in the app.'}
      </p>

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Banner"
        titleAr="حذف البانر"
        itemName={selectedBanner?.title}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
