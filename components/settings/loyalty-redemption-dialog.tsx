'use client';

import { useEffect, useState, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, X } from 'lucide-react';
import type { LoyaltyRedemption, LoyaltyRedemptionCreate, RedemptionType } from '@/lib/settings/types';
import Image from 'next/image';

interface LoyaltyRedemptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redemption?: LoyaltyRedemption | null;
  onSubmit: (data: LoyaltyRedemptionCreate) => void;
  isLoading?: boolean;
}

interface FormData {
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  redemption_type: RedemptionType;
  points_cost: number;
  max_per_user: number;
  total_available: number;
  valid_from: string;
  valid_until: string;
  active: boolean;
}

const redemptionTypes: { value: RedemptionType; labelEn: string; labelAr: string }[] = [
  { value: 'discount_code', labelEn: 'Discount Code', labelAr: 'كود خصم' },
  { value: 'free_class', labelEn: 'Free Class', labelAr: 'حصة مجانية' },
  { value: 'merchandise', labelEn: 'Merchandise', labelAr: 'منتجات' },
];

export function LoyaltyRedemptionDialog({
  open,
  onOpenChange,
  redemption,
  onSubmit,
  isLoading,
}: LoyaltyRedemptionDialogProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const isEditing = !!redemption;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      redemption_type: 'discount_code',
      points_cost: 100,
      max_per_user: 0,
      total_available: 0,
      valid_from: '',
      valid_until: '',
      active: true,
    },
  });

  const isActive = watch('active');
  const redemptionType = watch('redemption_type');

  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      if (redemption) {
        reset({
          name_en: redemption.name,
          name_ar: redemption.name,
          description_en: redemption.description || '',
          description_ar: redemption.description || '',
          redemption_type: redemption.redemption_type,
          points_cost: redemption.points_cost,
          max_per_user: redemption.max_per_user,
          total_available: redemption.total_available,
          valid_from: redemption.valid_from?.split('T')[0] || '',
          valid_until: redemption.valid_until?.split('T')[0] || '',
          active: redemption.active,
        });
        setPreviewUrl(redemption.photo_url);
      } else {
        reset({
          name_en: '',
          name_ar: '',
          description_en: '',
          description_ar: '',
          redemption_type: 'discount_code',
          points_cost: 100,
          max_per_user: 0,
          total_available: 0,
          valid_from: '',
          valid_until: '',
          active: true,
        });
        setPreviewUrl(null);
      }
    }
  }, [open, redemption, reset]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      name_en: data.name_en,
      name_ar: data.name_ar,
      description_en: data.description_en || null,
      description_ar: data.description_ar || null,
      redemption_type: data.redemption_type,
      points_cost: data.points_cost,
      max_per_user: data.max_per_user,
      total_available: data.total_available,
      valid_from: data.valid_from || null,
      valid_until: data.valid_until || null,
      active: data.active,
      photo: selectedFile || undefined,
    });
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {isEditing
                ? isRTL
                  ? 'تعديل المكافأة'
                  : 'Edit Redemption'
                : isRTL
                  ? 'إضافة مكافأة'
                  : 'Add Redemption'}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {isRTL
                ? 'أدخل تفاصيل المكافأة باللغتين'
                : 'Enter the redemption details in both languages'}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="space-y-4 py-4">
            {/* Translation Tabs */}
            <Tabs defaultValue="en" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ar">العربية</TabsTrigger>
              </TabsList>

              <TabsContent value="en" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name_en">
                    {isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}
                  </Label>
                  <Input
                    id="name_en"
                    dir="ltr"
                    placeholder="e.g., Free Mat Class"
                    {...register('name_en', { required: true })}
                    className={errors.name_en ? 'border-destructive' : ''}
                  />
                  {errors.name_en && (
                    <p className="text-sm text-destructive">Required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_en">
                    {isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}
                  </Label>
                  <Textarea
                    id="description_en"
                    dir="ltr"
                    placeholder="Describe the reward..."
                    rows={2}
                    {...register('description_en')}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ar" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name_ar">
                    {isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}
                  </Label>
                  <Input
                    id="name_ar"
                    dir="rtl"
                    placeholder="مثال: حصة مات مجانية"
                    {...register('name_ar', { required: true })}
                    className={errors.name_ar ? 'border-destructive' : ''}
                  />
                  {errors.name_ar && (
                    <p className="text-sm text-destructive">مطلوب</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_ar">
                    {isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
                  </Label>
                  <Textarea
                    id="description_ar"
                    dir="rtl"
                    placeholder="وصف المكافأة..."
                    rows={2}
                    {...register('description_ar')}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>{isRTL ? 'صورة' : 'Photo'}</Label>
              <div className="flex items-center gap-4">
                {previewUrl ? (
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed hover:bg-muted/50"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'PNG, JPG حتى 2MB' : 'PNG, JPG up to 2MB'}
                </p>
              </div>
            </div>

            {/* Redemption Type */}
            <div className="space-y-2">
              <Label>{isRTL ? 'النوع' : 'Type'}</Label>
              <Select
                value={redemptionType}
                onValueChange={(value) => setValue('redemption_type', value as RedemptionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {redemptionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {isRTL ? type.labelAr : type.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Points Cost */}
            <div className="space-y-2">
              <Label htmlFor="points_cost">
                {isRTL ? 'النقاط المطلوبة' : 'Points Required'}
              </Label>
              <Input
                id="points_cost"
                type="number"
                min={0}
                {...register('points_cost', { required: true, valueAsNumber: true })}
                className={errors.points_cost ? 'border-destructive' : ''}
              />
              {errors.points_cost && (
                <p className="text-sm text-destructive">
                  {isRTL ? 'مطلوب' : 'Required'}
                </p>
              )}
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_per_user">
                  {isRTL ? 'الحد للعضو' : 'Max per User'}
                </Label>
                <Input
                  id="max_per_user"
                  type="number"
                  min={0}
                  {...register('max_per_user', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  {isRTL ? '0 = غير محدود' : '0 = unlimited'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_available">
                  {isRTL ? 'الكمية المتاحة' : 'Total Available'}
                </Label>
                <Input
                  id="total_available"
                  type="number"
                  min={0}
                  {...register('total_available', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  {isRTL ? '0 = غير محدود' : '0 = unlimited'}
                </p>
              </div>
            </div>

            {/* Validity Period */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid_from">
                  {isRTL ? 'صالح من' : 'Valid From'}
                </Label>
                <Input
                  id="valid_from"
                  type="date"
                  {...register('valid_from')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_until">
                  {isRTL ? 'صالح حتى' : 'Valid Until'}
                </Label>
                <Input
                  id="valid_until"
                  type="date"
                  {...register('valid_until')}
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="active">
                  {isRTL ? 'نشط' : 'Active'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isRTL
                    ? 'يظهر للأعضاء للاستبدال'
                    : 'Visible for members to redeem'}
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
