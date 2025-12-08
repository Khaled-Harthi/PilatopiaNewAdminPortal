'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLocale } from 'next-intl';
import {
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Home,
  Calendar,
  CreditCard,
  Image,
  Gift,
  Award,
  BookOpen,
  Package,
  Megaphone,
  Images,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HomeLayoutComponent, HomeLayoutComponentType } from '@/lib/home-layouts/types';

// Component type labels and icons
const componentTypeConfig: Record<
  HomeLayoutComponentType,
  { label: string; labelAr: string; icon: React.ElementType }
> = {
  home_header: { label: 'Home Header', labelAr: 'رأس الصفحة', icon: Home },
  upcoming_classes_carousel: { label: 'Upcoming Classes', labelAr: 'الحصص القادمة', icon: Calendar },
  membership_card: { label: 'Membership Card', labelAr: 'بطاقة العضوية', icon: CreditCard },
  banner_carousel: { label: 'Banner Carousel', labelAr: 'البانرات', icon: Image },
  redeem_points_card: { label: 'Redeem Points', labelAr: 'استبدال النقاط', icon: Gift },
  awards_card: { label: 'Awards Card', labelAr: 'بطاقة الجوائز', icon: Award },
  info_card_classes: { label: 'Browse Classes', labelAr: 'تصفح الحصص', icon: BookOpen },
  info_card_packages: { label: 'Browse Packages', labelAr: 'تصفح الباقات', icon: Package },
  dynamic_card: { label: 'Promo Card', labelAr: 'بطاقة ترويجية', icon: Megaphone },
  dynamic_banner: { label: 'Promo Banner', labelAr: 'بانر ترويجي', icon: Image },
  dynamic_image_list: { label: 'Image List', labelAr: 'قائمة صور', icon: Images },
};

interface SortableComponentItemProps {
  component: HomeLayoutComponent;
  onToggleVisibility: (id: number) => void;
  onEdit: (component: HomeLayoutComponent) => void;
  onDelete: (id: number) => void;
  isDynamic: boolean;
}

export function SortableComponentItem({
  component,
  onToggleVisibility,
  onEdit,
  onDelete,
  isDynamic,
}: SortableComponentItemProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const config = componentTypeConfig[component.component_type];
  const Icon = config?.icon ?? Megaphone;
  const label = isRTL ? config?.labelAr : config?.label;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-card',
        isDragging && 'opacity-50 bg-accent/50',
        !component.visible && 'opacity-60'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded touch-none"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Icon */}
      <div className="flex items-center justify-center w-8 h-8 rounded bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium truncate', !component.visible && 'line-through')}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {component.component_id}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleVisibility(component.id)}
          title={component.visible ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'إظهار' : 'Show')}
        >
          {component.visible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>

        {isDynamic && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(component)}
            title={isRTL ? 'تعديل' : 'Edit'}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(component.id)}
          title={isRTL ? 'حذف' : 'Delete'}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
