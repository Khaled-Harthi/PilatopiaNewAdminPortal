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
  name: string;
  bio: string;
  avatar_url: string;
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
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      bio: '',
      avatar_url: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (instructor) {
        reset({
          name: instructor.name,
          bio: instructor.bio || '',
          avatar_url: instructor.avatar_url || '',
        });
      } else {
        reset({
          name: '',
          bio: '',
          avatar_url: '',
        });
      }
    }
  }, [open, instructor, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      name: data.name,
      bio: data.bio || undefined,
      avatar_url: data.avatar_url || undefined,
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
                ? 'أدخل بيانات المدرب'
                : 'Enter instructor details'}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{isRTL ? 'الاسم' : 'Name'}</Label>
              <Input
                id="name"
                placeholder={isRTL ? 'مثال: سارة جونسون' : 'e.g., Sarah Johnson'}
                {...register('name', { required: true })}
                className={errors.name ? 'border-destructive' : ''}
              />
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label htmlFor="avatar_url">
                {isRTL ? 'رابط الصورة' : 'Avatar URL'}{' '}
                <span className="text-muted-foreground text-xs">
                  ({isRTL ? 'اختياري' : 'optional'})
                </span>
              </Label>
              <Input
                id="avatar_url"
                dir="ltr"
                type="url"
                placeholder="https://..."
                {...register('avatar_url')}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">
                {isRTL ? 'النبذة' : 'Bio'}{' '}
                <span className="text-muted-foreground text-xs">
                  ({isRTL ? 'اختياري' : 'optional'})
                </span>
              </Label>
              <Textarea
                id="bio"
                placeholder={isRTL ? 'نبذة مختصرة...' : 'Brief bio...'}
                rows={3}
                {...register('bio')}
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
