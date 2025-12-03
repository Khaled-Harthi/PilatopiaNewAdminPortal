'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocale } from 'next-intl';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter, Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/form/rich-text-editor';
import { SimpleDateTimePicker } from '@/components/form/simple-date-time-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useBanner,
  useBannerCTAOptions,
  useCreateBanner,
  useUpdateBanner,
} from '@/lib/settings/hooks';
import type { BannerCreate, BannerDisplayType } from '@/lib/settings/types';
import { toast } from 'sonner';

interface BannerFormData {
  image_url: string;
  title: string;
  title_ar: string;
  subtitle: string;
  subtitle_ar: string;
  content_html: string;
  content_html_ar: string;
  cta_text: string;
  cta_text_ar: string;
  cta_link: string;
  custom_cta_link: string;
  display_type: BannerDisplayType;
  start_date: Date | null;
  end_date: Date | null;
}

interface BannerFormProps {
  bannerId?: number;
}

const CUSTOM_URL_VALUE = 'custom';

export function BannerForm({ bannerId }: BannerFormProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('english');

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const { data: bannerData, isLoading: isBannerLoading } = useBanner(
    bannerId ?? null
  );
  const { data: ctaOptions = [] } = useBannerCTAOptions();
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();

  const isEditing = !!bannerId;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BannerFormData>({
    defaultValues: {
      image_url: '',
      title: '',
      title_ar: '',
      subtitle: '',
      subtitle_ar: '',
      content_html: '',
      content_html_ar: '',
      cta_text: '',
      cta_text_ar: '',
      cta_link: '',
      custom_cta_link: '',
      display_type: 'modal',
      start_date: null,
      end_date: null,
    },
  });

  const watchedCtaLink = watch('cta_link');
  const watchedDisplayType = watch('display_type');
  const watchedImageUrl = watch('image_url');
  const watchedContentHtml = watch('content_html');
  const watchedContentHtmlAr = watch('content_html_ar');
  const watchedStartDate = watch('start_date');
  const watchedEndDate = watch('end_date');

  useEffect(() => {
    if (bannerId && bannerData) {
      // Determine if CTA link is a custom URL
      const isCustomUrl =
        bannerData.cta_link &&
        !ctaOptions.some((opt) => opt.value === bannerData.cta_link);

      reset({
        image_url: bannerData.image_url || '',
        title: bannerData.title || '',
        title_ar: bannerData.title_ar || '',
        subtitle: bannerData.subtitle || '',
        subtitle_ar: bannerData.subtitle_ar || '',
        content_html: bannerData.content_html || '',
        content_html_ar: bannerData.content_html_ar || '',
        cta_text: bannerData.cta_text || '',
        cta_text_ar: bannerData.cta_text_ar || '',
        cta_link: isCustomUrl ? CUSTOM_URL_VALUE : bannerData.cta_link || '',
        custom_cta_link: isCustomUrl ? bannerData.cta_link || '' : '',
        display_type: bannerData.display_type || 'modal',
        start_date: bannerData.start_date
          ? new Date(bannerData.start_date)
          : null,
        end_date: bannerData.end_date ? new Date(bannerData.end_date) : null,
      });
    }
  }, [bannerId, bannerData, reset, ctaOptions]);

  const handleFormSubmit = async (data: BannerFormData) => {
    const finalCtaLink =
      data.cta_link === CUSTOM_URL_VALUE ? data.custom_cta_link : data.cta_link;

    const payload: BannerCreate = {
      image_url: data.image_url,
      title: data.title,
      title_ar: data.title_ar || undefined,
      subtitle: data.subtitle || undefined,
      subtitle_ar: data.subtitle_ar || undefined,
      content_html: data.content_html,
      content_html_ar: data.content_html_ar || undefined,
      cta_text: data.cta_text || undefined,
      cta_text_ar: data.cta_text_ar || undefined,
      cta_link: finalCtaLink || undefined,
      display_type: data.display_type,
      start_date: data.start_date ? data.start_date.toISOString() : undefined,
      end_date: data.end_date ? data.end_date.toISOString() : undefined,
    };

    try {
      if (isEditing && bannerId) {
        await updateMutation.mutateAsync({ id: bannerId, payload });
        toast.success(isRTL ? 'تم تحديث البانر' : 'Banner updated');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(isRTL ? 'تم إضافة البانر' : 'Banner created');
      }
      router.push('/settings/content/banners');
    } catch {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const showCustomUrlInput = watchedCtaLink === CUSTOM_URL_VALUE;

  const pageTitle = isEditing
    ? isRTL
      ? 'تعديل البانر'
      : 'Edit Banner'
    : isRTL
      ? 'إضافة بانر جديد'
      : 'Add New Banner';

  if (isBannerLoading && bannerId) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/settings/content/banners">
            <Button variant="ghost" size="sm" className="gap-2">
              <BackArrow className="h-4 w-4" />
              {isRTL ? 'البانرات' : 'Banners'}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {isRTL
                ? 'قم بتعبئة المعلومات أدناه لإنشاء أو تعديل البانر'
                : 'Fill in the information below to create or edit a banner'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6 max-w-2xl"
      >
        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="image_url">
            {isRTL ? 'رابط الصورة' : 'Image URL'} *
          </Label>
          <Input
            id="image_url"
            {...register('image_url', { required: true })}
            placeholder="https://cdn.example.com/banner.jpg"
          />
          {watchedImageUrl && (
            <div className="mt-2 relative rounded-lg overflow-hidden border bg-muted/30">
              <img
                src={watchedImageUrl}
                alt="Banner preview"
                className="w-full h-32 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {isRTL
              ? 'الأبعاد الموصى بها: 800x400 بكسل (نسبة 2:1)'
              : 'Recommended: 800x400px (2:1 ratio)'}
          </p>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="english">
              {isRTL ? 'الإنجليزية' : 'English'}
            </TabsTrigger>
            <TabsTrigger value="arabic">
              {isRTL ? 'العربية' : 'Arabic'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="english" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                {isRTL ? 'العنوان (EN)' : 'Title (EN)'} *
              </Label>
              <Input
                id="title"
                {...register('title', { required: true })}
                placeholder="Summer Special Offer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">
                {isRTL ? 'العنوان الفرعي (EN)' : 'Subtitle (EN)'}
              </Label>
              <Input
                id="subtitle"
                {...register('subtitle')}
                placeholder="Limited time only"
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'المحتوى (EN)' : 'Content (EN)'} *</Label>
              <RichTextEditor
                value={watchedContentHtml}
                onChange={(val) => setValue('content_html', val)}
                placeholder={
                  isRTL ? 'اكتب محتوى البانر...' : 'Write banner content...'
                }
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta_text">
                {isRTL ? 'نص الزر (EN)' : 'CTA Button Text (EN)'}
              </Label>
              <Input
                id="cta_text"
                {...register('cta_text')}
                placeholder="Get Offer"
              />
            </div>
          </TabsContent>

          <TabsContent value="arabic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title_ar">
                {isRTL ? 'العنوان (AR)' : 'Title (AR)'}
              </Label>
              <Input
                id="title_ar"
                {...register('title_ar')}
                placeholder="عرض الصيف الخاص"
                dir="rtl"
              />
              <p className="text-xs text-muted-foreground">
                {isRTL
                  ? 'سيتم استخدام الإنجليزية إذا كان فارغاً'
                  : 'Falls back to English if empty'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle_ar">
                {isRTL ? 'العنوان الفرعي (AR)' : 'Subtitle (AR)'}
              </Label>
              <Input
                id="subtitle_ar"
                {...register('subtitle_ar')}
                placeholder="لفترة محدودة فقط"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'المحتوى (AR)' : 'Content (AR)'}</Label>
              <RichTextEditor
                value={watchedContentHtmlAr}
                onChange={(val) => setValue('content_html_ar', val)}
                placeholder={
                  isRTL
                    ? 'اكتب محتوى البانر بالعربية...'
                    : 'Write Arabic banner content...'
                }
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta_text_ar">
                {isRTL ? 'نص الزر (AR)' : 'CTA Button Text (AR)'}
              </Label>
              <Input
                id="cta_text_ar"
                {...register('cta_text_ar')}
                placeholder="احصل على العرض"
                dir="rtl"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Settings Section */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium">{isRTL ? 'الإعدادات' : 'Settings'}</h3>

          {/* Display Type */}
          <div className="space-y-3">
            <Label>{isRTL ? 'نوع العرض' : 'Display Type'} *</Label>
            <RadioGroup
              value={watchedDisplayType}
              onValueChange={(value) =>
                setValue('display_type', value as BannerDisplayType)
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="modal" id="modal" />
                <Label htmlFor="modal" className="font-normal cursor-pointer">
                  {isRTL ? 'نافذة منبثقة' : 'Modal (bottom sheet)'}
                </Label>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value="screen" id="screen" />
                <Label htmlFor="screen" className="font-normal cursor-pointer">
                  {isRTL ? 'صفحة كاملة' : 'Full Screen'}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* CTA Destination */}
          <div className="space-y-2">
            <Label>{isRTL ? 'وجهة الزر' : 'CTA Destination'}</Label>
            <Select
              value={watchedCtaLink || 'none'}
              onValueChange={(value) =>
                setValue('cta_link', value === 'none' ? '' : value)
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={isRTL ? 'اختر الوجهة' : 'Select destination'}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {isRTL ? 'بدون رابط' : 'No link'}
                </SelectItem>
                {ctaOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_URL_VALUE}>
                  {isRTL ? 'رابط مخصص...' : 'Custom URL...'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom URL Input */}
          {showCustomUrlInput && (
            <div className="space-y-2">
              <Label htmlFor="custom_cta_link">
                {isRTL ? 'الرابط المخصص' : 'Custom URL'}
              </Label>
              <Input
                id="custom_cta_link"
                {...register('custom_cta_link')}
                placeholder="https://..."
              />
            </div>
          )}

          {/* Scheduling */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground">
              {isRTL ? 'الجدولة (اختياري)' : 'Scheduling (Optional)'}
            </h4>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{isRTL ? 'تاريخ البدء' : 'Start Date'}</Label>
                <SimpleDateTimePicker
                  value={watchedStartDate}
                  onChange={(date) => setValue('start_date', date)}
                  placeholder={isRTL ? 'اختر التاريخ' : 'Select date'}
                />
                <p className="text-xs text-muted-foreground">
                  {isRTL
                    ? 'اتركه فارغاً للبدء فوراً'
                    : 'Leave empty to start immediately'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? 'تاريخ الانتهاء' : 'End Date'}</Label>
                <SimpleDateTimePicker
                  value={watchedEndDate}
                  onChange={(date) => setValue('end_date', date)}
                  placeholder={isRTL ? 'اختر التاريخ' : 'Select date'}
                />
                <p className="text-xs text-muted-foreground">
                  {isRTL
                    ? 'اتركه فارغاً لعدم الانتهاء'
                    : 'Leave empty for no expiry'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Link href="/settings/content/banners">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {isEditing
              ? isRTL
                ? 'حفظ التغييرات'
                : 'Save Changes'
              : isRTL
                ? 'إنشاء البانر'
                : 'Create Banner'}
          </Button>
        </div>
      </form>
    </div>
  );
}
