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
import type { Room, RoomCreate } from '@/lib/settings/types';

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: Room | null;
  onSubmit: (data: RoomCreate) => void;
  isLoading?: boolean;
}

interface FormData {
  name_en: string;
  name_ar: string;
  is_active: boolean;
}

export function RoomDialog({
  open,
  onOpenChange,
  room,
  onSubmit,
  isLoading,
}: RoomDialogProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const isEditing = !!room;

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
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (open) {
      if (room) {
        reset({
          name_en: room.name,
          name_ar: room.name,
          is_active: room.is_active,
        });
      } else {
        reset({
          name_en: '',
          name_ar: '',
          is_active: true,
        });
      }
    }
  }, [open, room, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      name_en: data.name_en,
      name_ar: data.name_ar,
      is_active: data.is_active,
    });
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {isEditing
                ? isRTL
                  ? 'تعديل الغرفة'
                  : 'Edit Room'
                : isRTL
                  ? 'إضافة غرفة'
                  : 'Add Room'}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {isRTL
                ? 'أدخل اسم الغرفة باللغتين'
                : 'Enter the room name in both languages'}
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
                placeholder="e.g., Studio A"
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
                placeholder="مثال: استوديو أ"
                {...register('name_ar', { required: true })}
                className={errors.name_ar ? 'border-destructive' : ''}
              />
              {errors.name_ar && (
                <p className="text-sm text-destructive">
                  {isRTL ? 'مطلوب' : 'Required'}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">
                  {isRTL ? 'نشط' : 'Active'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isRTL
                    ? 'يظهر في قائمة الغرف'
                    : 'Visible in room selection'}
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
