'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import type { ClassType, ClassTypeCreate } from '@/lib/settings/types';

interface ClassTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classType?: ClassType | null;
  onSubmit: (data: ClassTypeCreate) => void;
  isLoading?: boolean;
}

interface FormData {
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  is_active: boolean;
}

export function ClassTypeDialog({
  open,
  onOpenChange,
  classType,
  onSubmit,
  isLoading,
}: ClassTypeDialogProps) {
  const locale = useLocale();
  const t = useTranslations('settings');
  const isRTL = locale === 'ar';
  const isEditing = !!classType;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (open) {
      if (classType) {
        // For editing, we'd need to fetch both translations
        // For now, set the name based on current locale
        reset({
          name_en: classType.name,
          name_ar: classType.name,
          description_en: classType.description || '',
          description_ar: classType.description || '',
          is_active: classType.is_active,
        });
      } else {
        reset({
          name_en: '',
          name_ar: '',
          description_en: '',
          description_ar: '',
          is_active: true,
        });
      }
    }
  }, [open, classType, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      name_en: data.name_en,
      name_ar: data.name_ar,
      description_en: data.description_en || null,
      description_ar: data.description_ar || null,
      is_active: data.is_active,
    });
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {isEditing
                ? isRTL
                  ? 'تعديل نوع الحصة'
                  : 'Edit Class Type'
                : isRTL
                  ? 'إضافة نوع حصة'
                  : 'Add Class Type'}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {isRTL
                ? 'أدخل تفاصيل نوع الحصة باللغتين'
                : 'Enter the class type details in both languages'}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="space-y-4 py-4">
            {/* Name English */}
            <div className="space-y-2">
              <Label htmlFor="name_en">
                {isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}
              </Label>
              <Input
                id="name_en"
                dir="ltr"
                placeholder="e.g., Reformer"
                {...register('name_en', { required: true })}
                className={errors.name_en ? 'border-destructive' : ''}
              />
              {errors.name_en && (
                <p className="text-sm text-destructive">
                  {isRTL ? 'مطلوب' : 'Required'}
                </p>
              )}
            </div>

            {/* Name Arabic */}
            <div className="space-y-2">
              <Label htmlFor="name_ar">
                {isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}
              </Label>
              <Input
                id="name_ar"
                dir="rtl"
                placeholder="مثال: ريفورمر"
                {...register('name_ar', { required: true })}
                className={errors.name_ar ? 'border-destructive' : ''}
              />
              {errors.name_ar && (
                <p className="text-sm text-destructive">
                  {isRTL ? 'مطلوب' : 'Required'}
                </p>
              )}
            </div>

            {/* Description English */}
            <div className="space-y-2">
              <Label htmlFor="description_en">
                {isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}
              </Label>
              <Textarea
                id="description_en"
                dir="ltr"
                placeholder="Brief description..."
                rows={2}
                {...register('description_en')}
              />
            </div>

            {/* Description Arabic */}
            <div className="space-y-2">
              <Label htmlFor="description_ar">
                {isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
              </Label>
              <Textarea
                id="description_ar"
                dir="rtl"
                placeholder="وصف مختصر..."
                rows={2}
                {...register('description_ar')}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">
                  {isRTL ? 'نشط' : 'Active'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isRTL
                    ? 'يظهر في قائمة أنواع الحصص'
                    : 'Visible in class type selection'}
                </p>
              </div>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', checked)}
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
