'use client';

import { useLocale } from 'next-intl';
import {
  Home,
  Calendar,
  CreditCard,
  Image as ImageIcon,
  Gift,
  Award,
  BookOpen,
  Package,
  ChevronRight,
  ChevronLeft,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  HomeLayoutComponent,
  HomeLayoutComponentType,
  DynamicCardProps,
  DynamicBannerProps,
  DynamicImageListProps,
} from '@/lib/home-layouts/types';

interface ComponentPreviewProps {
  component: HomeLayoutComponent;
}

export function ComponentPreview({ component }: ComponentPreviewProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  if (!component.visible) {
    return null;
  }

  const props = component.props as DynamicCardProps | DynamicBannerProps | null;

  switch (component.component_type) {
    case 'home_header':
      return <HomeHeaderPreview isRTL={isRTL} />;
    case 'upcoming_classes_carousel':
      return <UpcomingClassesPreview isRTL={isRTL} />;
    case 'membership_card':
      return <MembershipCardPreview isRTL={isRTL} />;
    case 'banner_carousel':
      return <BannerCarouselPreview isRTL={isRTL} />;
    case 'redeem_points_card':
      return <RedeemPointsPreview isRTL={isRTL} />;
    case 'awards_card':
      return <AwardsCardPreview isRTL={isRTL} />;
    case 'info_card_classes':
      return <InfoCardPreview isRTL={isRTL} type="classes" />;
    case 'info_card_packages':
      return <InfoCardPreview isRTL={isRTL} type="packages" />;
    case 'dynamic_card':
      return <DynamicCardPreview isRTL={isRTL} props={props as DynamicCardProps} />;
    case 'dynamic_banner':
      return <DynamicBannerPreview isRTL={isRTL} props={props as DynamicBannerProps} />;
    case 'dynamic_image_list':
      return <DynamicImageListPreview isRTL={isRTL} props={props as DynamicImageListProps} />;
    default:
      return <PlaceholderPreview type={component.component_type} />;
  }
}

// Home Header
function HomeHeaderPreview({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {isRTL ? 'مرحباً' : 'Hello'}
          </p>
          <p className="text-sm font-medium">Sarah</p>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-muted" />
    </div>
  );
}

// Upcoming Classes
function UpcomingClassesPreview({ isRTL }: { isRTL: boolean }) {
  const Arrow = isRTL ? ChevronLeft : ChevronRight;
  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {isRTL ? 'الحصص القادمة' : 'Upcoming Classes'}
        </p>
        <Arrow className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-32 h-20 rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

// Membership Card
function MembershipCardPreview({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="px-4 py-3">
      <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-4 text-primary-foreground">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4" />
          <span className="text-xs font-medium">
            {isRTL ? 'العضوية' : 'Membership'}
          </span>
        </div>
        <p className="text-lg font-semibold">Gold Member</p>
        <p className="text-xs opacity-80">
          {isRTL ? 'صالحة حتى 31 ديسمبر' : 'Valid until Dec 31'}
        </p>
      </div>
    </div>
  );
}

// Banner Carousel
function BannerCarouselPreview({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="px-4 py-3">
      <div className="relative h-32 rounded-xl bg-muted overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                i === 1 ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Redeem Points
function RedeemPointsPreview({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="px-4 py-3">
      <div className="rounded-xl bg-amber-500/10 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Gift className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {isRTL ? 'استبدل نقاطك' : 'Redeem Points'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isRTL ? '1,250 نقطة متاحة' : '1,250 points available'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Awards Card
function AwardsCardPreview({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="px-4 py-3">
      <div className="rounded-xl bg-purple-500/10 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Award className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {isRTL ? 'إنجازاتك' : 'Your Awards'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isRTL ? '3 شارات جديدة' : '3 new badges'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Info Cards
function InfoCardPreview({ isRTL, type }: { isRTL: boolean; type: 'classes' | 'packages' }) {
  const Icon = type === 'classes' ? BookOpen : Package;
  const title = type === 'classes'
    ? (isRTL ? 'تصفح الحصص' : 'Browse Classes')
    : (isRTL ? 'تصفح الباقات' : 'Browse Packages');

  return (
    <div className="px-4 py-3">
      <div className="rounded-xl bg-muted p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{title}</p>
        </div>
        {isRTL ? (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

// Dynamic Card
function DynamicCardPreview({
  isRTL,
  props,
}: {
  isRTL: boolean;
  props: DynamicCardProps | null;
}) {
  const title = isRTL ? props?.title_ar : props?.title_en;
  const description = isRTL ? props?.description_ar : props?.description_en;

  return (
    <div className="px-4 py-3">
      <div
        className="rounded-xl p-4 flex items-center gap-4"
        style={{ backgroundColor: props?.backgroundColor || '#F3F4F6' }}
      >
        {props?.imageUrl ? (
          <img
            src={props.imageUrl}
            alt=""
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {title || (isRTL ? 'عنوان البطاقة' : 'Card Title')}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Dynamic Banner
function DynamicBannerPreview({
  isRTL,
  props,
}: {
  isRTL: boolean;
  props: DynamicBannerProps | null;
}) {
  const title = isRTL ? props?.title_ar : props?.title_en;
  const description = isRTL ? props?.description_ar : props?.description_en;

  return (
    <div className="px-4 py-3">
      <div
        className="relative rounded-xl overflow-hidden h-32"
        style={{ backgroundColor: props?.backgroundColor || '#F3F4F6' }}
      >
        {props?.imageUrl ? (
          <img
            src={props.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-sm font-semibold">
            {title || (isRTL ? 'عنوان البانر' : 'Banner Title')}
          </p>
          {description && (
            <p className="text-xs opacity-90 line-clamp-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Dynamic Image List
function DynamicImageListPreview({
  isRTL,
  props,
}: {
  isRTL: boolean;
  props: DynamicImageListProps | null;
}) {
  const title = isRTL ? props?.title_ar : props?.title_en;

  return (
    <div className="px-4 py-3 space-y-2">
      <p className="text-sm font-medium">
        {title || (isRTL ? 'قائمة الصور' : 'Image Gallery')}
      </p>
      <div className="flex gap-2 overflow-hidden">
        {props?.items && props.items.length > 0 ? (
          props.items.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden"
            >
              <img
                src={item.imageUrl}
                alt={isRTL ? item.label_ar : item.label_en}
                className="w-full h-full object-cover"
              />
            </div>
          ))
        ) : (
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-20 h-20 rounded-lg bg-muted flex items-center justify-center"
            >
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Placeholder for unknown types
function PlaceholderPreview({ type }: { type: HomeLayoutComponentType }) {
  return (
    <div className="px-4 py-3">
      <div className="rounded-xl bg-muted p-4 flex items-center justify-center h-16">
        <p className="text-xs text-muted-foreground">{type}</p>
      </div>
    </div>
  );
}
