'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocale } from 'next-intl';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import type { LoyaltyTier, LoyaltyTierCreate } from '@/lib/settings/types';

interface LoyaltyTierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier?: LoyaltyTier | null;
  onSubmit: (data: LoyaltyTierCreate) => void;
  isLoading?: boolean;
}

interface FormData {
  tier_name: string;
  min_classes: number;
  tier_color: string;
  sort_order: number;
  active: boolean;
}

export function LoyaltyTierDialog({
  open,
  onOpenChange,
  tier,
  onSubmit,
  isLoading,
}: LoyaltyTierDialogProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const isEditing = !!tier;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      tier_name: '',
      min_classes: 0,
      tier_color: '#6366f1',
      sort_order: 0,
      active: true,
    },
  });

  const isActive = watch('active');
  const tierColor = watch('tier_color');

  useEffect(() => {
    if (open) {
      if (tier) {
        reset({
          tier_name: tier.tier_name,
          min_classes: tier.min_classes,
          tier_color: tier.tier_color || '#6366f1',
          sort_order: tier.sort_order,
          active: tier.active,
        });
      } else {
        reset({
          tier_name: '',
          min_classes: 0,
          tier_color: '#6366f1',
          sort_order: 0,
          active: true,
        });
      }
    }
  }, [open, tier, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      tier_name: data.tier_name,
      min_classes: data.min_classes,
      tier_color: data.tier_color || null,
      sort_order: data.sort_order,
      active: data.active,
    });
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {isEditing
                ? isRTL
                  ? 'تعديل المستوى'
                  : 'Edit Tier'
                : isRTL
                  ? 'إضافة مستوى'
                  : 'Add Tier'}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {isRTL
                ? 'أدخل تفاصيل مستوى الولاء'
                : 'Enter the loyalty tier details'}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="space-y-4 py-4">
            {/* Tier Name */}
            <div className="space-y-2">
              <Label htmlFor="tier_name">
                {isRTL ? 'اسم المستوى' : 'Tier Name'}
              </Label>
              <Input
                id="tier_name"
                placeholder={isRTL ? 'مثال: برونزي' : 'e.g., Bronze'}
                {...register('tier_name', { required: true })}
                className={errors.tier_name ? 'border-destructive' : ''}
              />
              {errors.tier_name && (
                <p className="text-sm text-destructive">
                  {isRTL ? 'مطلوب' : 'Required'}
                </p>
              )}
            </div>

            {/* Min Classes */}
            <div className="space-y-2">
              <Label htmlFor="min_classes">
                {isRTL ? 'الحد الأدنى للحصص' : 'Minimum Classes'}
              </Label>
              <Input
                id="min_classes"
                type="number"
                min={0}
                placeholder="0"
                {...register('min_classes', { required: true, valueAsNumber: true })}
                className={errors.min_classes ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                {isRTL
                  ? 'عدد الحصص المطلوبة للوصول لهذا المستوى'
                  : 'Classes needed to reach this tier'}
              </p>
              {errors.min_classes && (
                <p className="text-sm text-destructive">
                  {isRTL ? 'مطلوب' : 'Required'}
                </p>
              )}
            </div>

            {/* Tier Color */}
            <div className="space-y-2">
              <Label htmlFor="tier_color">
                {isRTL ? 'اللون' : 'Color'}
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="tier_color"
                  type="color"
                  className="h-10 w-16 cursor-pointer p-1"
                  {...register('tier_color')}
                />
                <Input
                  type="text"
                  value={tierColor}
                  onChange={(e) => setValue('tier_color', e.target.value)}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label htmlFor="sort_order">
                {isRTL ? 'الترتيب' : 'Sort Order'}
              </Label>
              <Input
                id="sort_order"
                type="number"
                min={0}
                placeholder="0"
                {...register('sort_order', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                {isRTL
                  ? 'ترتيب العرض (الأصغر أولاً)'
                  : 'Display order (lower = first)'}
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="active">
                  {isRTL ? 'نشط' : 'Active'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isRTL
                    ? 'يظهر للأعضاء في برنامج الولاء'
                    : 'Visible to members in loyalty program'}
                </p>
              </div>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={(checked) => setValue('active', checked)}
              />
            </div>
          </div>

          <ResponsiveDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {isEditing
                ? isRTL
                  ? 'حفظ التغييرات'
                  : 'Save Changes'
                : isRTL
                  ? 'إضافة'
                  : 'Add'}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
