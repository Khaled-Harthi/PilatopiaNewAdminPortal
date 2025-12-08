'use client';

import { useForm } from 'react-hook-form';
import { useLocale } from 'next-intl';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter, Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateHomeLayout } from '@/lib/home-layouts/hooks';
import { toast } from 'sonner';

interface FormData {
  name: string;
}

export function CreateLayoutForm() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const router = useRouter();

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const createMutation = useCreateHomeLayout();
  const isSubmitting = createMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const layout = await createMutation.mutateAsync({
        name: data.name,
        is_active: false,
      });
      toast.success(isRTL ? 'تم إنشاء التخطيط' : 'Layout created');
      router.push(`/settings/content/home-layouts/${layout.id}`);
    } catch {
      toast.error(isRTL ? 'فشل إنشاء التخطيط' : 'Failed to create layout');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/settings/content/home-layouts">
          <Button variant="ghost" size="sm" className="gap-2">
            <BackArrow className="h-4 w-4" />
            {isRTL ? 'التخطيطات' : 'Layouts'}
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">
            {isRTL ? 'تخطيط جديد' : 'New Layout'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? 'أدخل اسمًا للتخطيط الجديد'
              : 'Enter a name for your new layout'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="name">
            {isRTL ? 'اسم التخطيط' : 'Layout Name'} *
          </Label>
          <Input
            id="name"
            {...register('name', {
              required: isRTL ? 'الاسم مطلوب' : 'Name is required',
              maxLength: {
                value: 100,
                message: isRTL
                  ? 'الاسم يجب أن يكون أقل من 100 حرف'
                  : 'Name must be less than 100 characters',
              },
            })}
            placeholder={isRTL ? 'مثال: تخطيط الصيف' : 'e.g., Summer Campaign'}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <Link href="/settings/content/home-layouts">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {isRTL ? 'إنشاء والمتابعة' : 'Create & Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
}
