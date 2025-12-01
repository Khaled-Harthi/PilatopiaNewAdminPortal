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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Tag, TagCreate, TagCategory } from '@/lib/settings/types';
import { useTagCategories } from '@/lib/settings/hooks';

interface TagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: Tag | null;
  onSubmit: (data: TagCreate) => void;
  isLoading?: boolean;
}

interface FormData {
  name_en: string;
  name_ar: string;
  icon: string;
  color: string;
  category_id: string;
  is_active: boolean;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export function TagDialog({
  open,
  onOpenChange,
  tag,
  onSubmit,
  isLoading,
}: TagDialogProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const isEditing = !!tag;

  const { data: categories } = useTagCategories();

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
      icon: '',
      color: '#3b82f6',
      category_id: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');
  const selectedColor = watch('color');
  const selectedCategory = watch('category_id');

  useEffect(() => {
    if (open) {
      if (tag) {
        reset({
          name_en: tag.name,
          name_ar: tag.name,
          icon: tag.icon || '',
          color: tag.color || '#3b82f6',
          category_id: tag.category_id || '',
          is_active: tag.is_active,
        });
      } else {
        reset({
          name_en: '',
          name_ar: '',
          icon: '',
          color: '#3b82f6',
          category_id: '',
          is_active: true,
        });
      }
    }
  }, [open, tag, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      name_en: data.name_en,
      name_ar: data.name_ar,
      icon: data.icon || null,
      color: data.color || null,
      category_id: data.category_id || null,
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
                  ? 'تعديل التاج'
                  : 'Edit Tag'
                : isRTL
                  ? 'إضافة تاج'
                  : 'Add Tag'}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {isRTL
                ? 'أدخل تفاصيل التاج'
                : 'Enter tag details'}
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
                placeholder="e.g., Beginner Friendly"
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
                placeholder="مثال: مناسب للمبتدئين"
                {...register('name_ar', { required: true })}
                className={errors.name_ar ? 'border-destructive' : ''}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>{isRTL ? 'الفئة' : 'Category'}</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر فئة (اختياري)' : 'Select category (optional)'} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label htmlFor="icon">
                {isRTL ? 'الأيقونة' : 'Icon'} <span className="text-muted-foreground text-xs">({isRTL ? 'اختياري' : 'optional'})</span>
              </Label>
              <Input
                id="icon"
                dir="ltr"
                placeholder="e.g., star, heart, fire"
                {...register('icon')}
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>{isRTL ? 'اللون' : 'Color'}</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 transition-transform ${
                      selectedColor === color
                        ? 'scale-110 border-foreground'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setValue('color', color)}
                  />
                ))}
                <Input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setValue('color', e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded-full border-0 p-0"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">{isRTL ? 'نشط' : 'Active'}</Label>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'يظهر في قائمة التاجات' : 'Visible in tag selection'}
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
