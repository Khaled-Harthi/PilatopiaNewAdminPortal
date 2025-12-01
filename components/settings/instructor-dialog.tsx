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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import type { Instructor, InstructorCreate } from '@/lib/settings/types';

interface InstructorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructor?: Instructor | null;
  onSubmit: (data: InstructorCreate) => void;
  isLoading?: boolean;
}

interface FormData {
  name_en: string;
  name_ar: string;
  bio_en: string;
  bio_ar: string;
  photo_url: string;
  is_active: boolean;
}

export function InstructorDialog({
  open,
  onOpenChange,
  instructor,
  onSubmit,
  isLoading,
}: InstructorDialogProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const isEditing = !!instructor;

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
      bio_en: '',
      bio_ar: '',
      photo_url: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (open) {
      if (instructor) {
        reset({
          name_en: instructor.name,
          name_ar: instructor.name,
          bio_en: instructor.bio || '',
          bio_ar: instructor.bio || '',
          photo_url: instructor.photo_url || '',
          is_active: instructor.is_active,
        });
      } else {
        reset({
          name_en: '',
          name_ar: '',
          bio_en: '',
          bio_ar: '',
          photo_url: '',
          is_active: true,
        });
      }
    }
  }, [open, instructor, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      name_en: data.name_en,
      name_ar: data.name_ar,
      bio_en: data.bio_en || null,
      bio_ar: data.bio_ar || null,
      photo_url: data.photo_url || null,
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
                  ? 'تعديل المدرب'
                  : 'Edit Instructor'
                : isRTL
                  ? 'إضافة مدرب'
                  : 'Add Instructor'}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {isRTL
                ? 'أدخل بيانات المدرب باللغتين'
                : 'Enter instructor details in both languages'}
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
                placeholder="e.g., Sarah Johnson"
                {...register('name_en', { required: true })}
                className={errors.name_en ? 'border-destructive' : ''}
              />
            </div>

            {/* Name Arabic */}
            <div className="space-y-2">
              <Label htmlFor="name_ar">
                {isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}
              </Label>
              <Input
                id="name_ar"
                dir="rtl"
                placeholder="مثال: سارة جونسون"
                {...register('name_ar', { required: true })}
                className={errors.name_ar ? 'border-destructive' : ''}
              />
            </div>

            {/* Photo URL */}
            <div className="space-y-2">
              <Label htmlFor="photo_url">
                {isRTL ? 'رابط الصورة' : 'Photo URL'}{' '}
                <span className="text-muted-foreground text-xs">
                  ({isRTL ? 'اختياري' : 'optional'})
                </span>
              </Label>
              <Input
                id="photo_url"
                dir="ltr"
                type="url"
                placeholder="https://..."
                {...register('photo_url')}
              />
            </div>

            {/* Bio English */}
            <div className="space-y-2">
              <Label htmlFor="bio_en">
                {isRTL ? 'النبذة (إنجليزي)' : 'Bio (English)'}
              </Label>
              <Textarea
                id="bio_en"
                dir="ltr"
                placeholder="Brief bio..."
                rows={2}
                {...register('bio_en')}
              />
            </div>

            {/* Bio Arabic */}
            <div className="space-y-2">
              <Label htmlFor="bio_ar">
                {isRTL ? 'النبذة (عربي)' : 'Bio (Arabic)'}
              </Label>
              <Textarea
                id="bio_ar"
                dir="rtl"
                placeholder="نبذة مختصرة..."
                rows={2}
                {...register('bio_ar')}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">{isRTL ? 'نشط' : 'Active'}</Label>
                <p className="text-sm text-muted-foreground">
                  {isRTL
                    ? 'يظهر في قائمة المدربين'
                    : 'Visible in instructor selection'}
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
