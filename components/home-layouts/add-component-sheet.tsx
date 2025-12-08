'use client';

import { useLocale } from 'next-intl';
import {
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
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { cn } from '@/lib/utils';
import type { BuiltInComponentType, DynamicComponentType, HomeLayoutComponentType } from '@/lib/home-layouts/types';

interface ComponentOption {
  type: HomeLayoutComponentType;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ElementType;
  category: 'built-in' | 'dynamic';
}

const componentOptions: ComponentOption[] = [
  // Built-in components
  {
    type: 'home_header',
    label: 'Home Header',
    labelAr: 'رأس الصفحة',
    description: 'User greeting and profile',
    descriptionAr: 'ترحيب المستخدم والملف الشخصي',
    icon: Home,
    category: 'built-in',
  },
  {
    type: 'upcoming_classes_carousel',
    label: 'Upcoming Classes',
    labelAr: 'الحصص القادمة',
    description: 'Carousel of scheduled classes',
    descriptionAr: 'عرض الحصص المجدولة',
    icon: Calendar,
    category: 'built-in',
  },
  {
    type: 'membership_card',
    label: 'Membership Card',
    labelAr: 'بطاقة العضوية',
    description: 'Active membership status',
    descriptionAr: 'حالة العضوية النشطة',
    icon: CreditCard,
    category: 'built-in',
  },
  {
    type: 'banner_carousel',
    label: 'Banner Carousel',
    labelAr: 'البانرات',
    description: 'Promotional banners',
    descriptionAr: 'البانرات الترويجية',
    icon: Image,
    category: 'built-in',
  },
  {
    type: 'redeem_points_card',
    label: 'Redeem Points',
    labelAr: 'استبدال النقاط',
    description: 'Points redemption card',
    descriptionAr: 'بطاقة استبدال النقاط',
    icon: Gift,
    category: 'built-in',
  },
  {
    type: 'awards_card',
    label: 'Awards Card',
    labelAr: 'بطاقة الجوائز',
    description: 'User achievements',
    descriptionAr: 'إنجازات المستخدم',
    icon: Award,
    category: 'built-in',
  },
  {
    type: 'info_card_classes',
    label: 'Browse Classes',
    labelAr: 'تصفح الحصص',
    description: 'Quick link to classes',
    descriptionAr: 'رابط سريع للحصص',
    icon: BookOpen,
    category: 'built-in',
  },
  {
    type: 'info_card_packages',
    label: 'Browse Packages',
    labelAr: 'تصفح الباقات',
    description: 'Quick link to packages',
    descriptionAr: 'رابط سريع للباقات',
    icon: Package,
    category: 'built-in',
  },
  // Dynamic components
  {
    type: 'dynamic_card',
    label: 'Promo Card',
    labelAr: 'بطاقة ترويجية',
    description: 'Custom promotional card',
    descriptionAr: 'بطاقة ترويجية مخصصة',
    icon: Megaphone,
    category: 'dynamic',
  },
  {
    type: 'dynamic_banner',
    label: 'Promo Banner',
    labelAr: 'بانر ترويجي',
    description: 'Full-width promotional banner',
    descriptionAr: 'بانر ترويجي بعرض كامل',
    icon: Image,
    category: 'dynamic',
  },
  {
    type: 'dynamic_image_list',
    label: 'Image List',
    labelAr: 'قائمة صور',
    description: 'Scrollable image gallery',
    descriptionAr: 'معرض صور قابل للتمرير',
    icon: Images,
    category: 'dynamic',
  },
];

interface AddComponentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: HomeLayoutComponentType) => void;
  existingTypes: HomeLayoutComponentType[];
}

export function AddComponentSheet({
  open,
  onOpenChange,
  onSelect,
  existingTypes,
}: AddComponentSheetProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const builtInOptions = componentOptions.filter((o) => o.category === 'built-in');
  const dynamicOptions = componentOptions.filter((o) => o.category === 'dynamic');

  // Built-in components can only be added once
  const isDisabled = (option: ComponentOption): boolean => {
    if (option.category === 'dynamic') return false;
    return existingTypes.includes(option.type);
  };

  const handleSelect = (type: HomeLayoutComponentType) => {
    onSelect(type);
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {isRTL ? 'إضافة مكون' : 'Add Component'}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {isRTL
              ? 'اختر نوع المكون لإضافته إلى التخطيط'
              : 'Choose a component type to add to your layout'}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-6 py-4">
          {/* Built-in Components */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {isRTL ? 'مكونات مدمجة' : 'Built-in Components'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {builtInOptions.map((option) => {
                const Icon = option.icon;
                const disabled = isDisabled(option);
                return (
                  <button
                    key={option.type}
                    onClick={() => handleSelect(option.type)}
                    disabled={disabled}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border text-start transition-colors',
                      disabled
                        ? 'opacity-50 cursor-not-allowed bg-muted'
                        : 'hover:bg-accent cursor-pointer'
                    )}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-muted shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {isRTL ? option.labelAr : option.label}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {isRTL ? option.descriptionAr : option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Components */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {isRTL ? 'مكونات ديناميكية' : 'Dynamic Components'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {dynamicOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.type}
                    onClick={() => handleSelect(option.type)}
                    className="flex items-start gap-3 p-3 rounded-lg border text-start transition-colors hover:bg-accent cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {isRTL ? option.labelAr : option.label}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {isRTL ? option.descriptionAr : option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL
                ? 'المكونات الديناميكية تتطلب تكوينًا إضافيًا'
                : 'Dynamic components require additional configuration'}
            </p>
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
