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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { NotificationTemplate, NotificationTemplateCreate } from '@/lib/settings/types';

interface NotificationTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: NotificationTemplate | null;
  onSubmit: (data: NotificationTemplateCreate) => void;
  isLoading?: boolean;
}

interface FormData {
  key: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  channel: 'push' | 'whatsapp' | 'sms' | 'email';
  is_active: boolean;
}

const CHANNELS = [
  { value: 'push', label: 'Push Notification', labelAr: 'إشعار التطبيق' },
  { value: 'whatsapp', label: 'WhatsApp', labelAr: 'واتساب' },
  { value: 'sms', label: 'SMS', labelAr: 'رسالة نصية' },
  { value: 'email', label: 'Email', labelAr: 'بريد إلكتروني' },
] as const;

export function NotificationTemplateDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
  isLoading,
}: NotificationTemplateDialogProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const isEditing = !!template;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      key: '',
      title_en: '',
      title_ar: '',
      body_en: '',
      body_ar: '',
      channel: 'push',
      is_active: true,
    },
  });

  const isActive = watch('is_active');
  const selectedChannel = watch('channel');

  useEffect(() => {
    if (open) {
      if (template) {
        reset({
          key: template.key,
          title_en: template.title,
          title_ar: template.title,
          body_en: template.body,
          body_ar: template.body,
          channel: template.channel,
          is_active: template.is_active,
        });
      } else {
        reset({
          key: '',
          title_en: '',
          title_ar: '',
          body_en: '',
          body_ar: '',
          channel: 'push',
          is_active: true,
        });
      }
    }
  }, [open, template, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      key: data.key,
      title_en: data.title_en,
      title_ar: data.title_ar,
      body_en: data.body_en,
      body_ar: data.body_ar,
      channel: data.channel,
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
                  ? 'تعديل قالب الإشعار'
                  : 'Edit Notification Template'
                : isRTL
                  ? 'إضافة قالب إشعار'
                  : 'Add Notification Template'}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {isRTL
                ? 'أدخل تفاصيل قالب الإشعار'
                : 'Enter notification template details'}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="space-y-4 py-4">
            {/* Key */}
            <div className="space-y-2">
              <Label htmlFor="key">
                {isRTL ? 'المفتاح' : 'Key'}
              </Label>
              <Input
                id="key"
                dir="ltr"
                placeholder="e.g., booking_confirmed"
                disabled={isEditing}
                {...register('key', { required: true })}
                className={errors.key ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                {isRTL
                  ? 'معرف فريد للقالب (لا يمكن تغييره بعد الإنشاء)'
                  : 'Unique identifier for the template (cannot be changed after creation)'}
              </p>
            </div>

            {/* Channel */}
            <div className="space-y-2">
              <Label>{isRTL ? 'القناة' : 'Channel'}</Label>
              <Select
                value={selectedChannel}
                onValueChange={(value) =>
                  setValue('channel', value as FormData['channel'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((ch) => (
                    <SelectItem key={ch.value} value={ch.value}>
                      {isRTL ? ch.labelAr : ch.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title English */}
            <div className="space-y-2">
              <Label htmlFor="title_en">
                {isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'}
              </Label>
              <Input
                id="title_en"
                dir="ltr"
                placeholder="e.g., Booking Confirmed"
                {...register('title_en', { required: true })}
                className={errors.title_en ? 'border-destructive' : ''}
              />
            </div>

            {/* Title Arabic */}
            <div className="space-y-2">
              <Label htmlFor="title_ar">
                {isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}
              </Label>
              <Input
                id="title_ar"
                dir="rtl"
                placeholder="مثال: تم تأكيد الحجز"
                {...register('title_ar', { required: true })}
                className={errors.title_ar ? 'border-destructive' : ''}
              />
            </div>

            {/* Body English */}
            <div className="space-y-2">
              <Label htmlFor="body_en">
                {isRTL ? 'المحتوى (إنجليزي)' : 'Body (English)'}
              </Label>
              <Textarea
                id="body_en"
                dir="ltr"
                placeholder="Your booking for {{class_name}} has been confirmed..."
                rows={3}
                {...register('body_en', { required: true })}
                className={errors.body_en ? 'border-destructive' : ''}
              />
            </div>

            {/* Body Arabic */}
            <div className="space-y-2">
              <Label htmlFor="body_ar">
                {isRTL ? 'المحتوى (عربي)' : 'Body (Arabic)'}
              </Label>
              <Textarea
                id="body_ar"
                dir="rtl"
                placeholder="تم تأكيد حجزك لحصة {{class_name}}..."
                rows={3}
                {...register('body_ar', { required: true })}
                className={errors.body_ar ? 'border-destructive' : ''}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">{isRTL ? 'نشط' : 'Active'}</Label>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'يتم إرسال هذا الإشعار' : 'This notification will be sent'}
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
