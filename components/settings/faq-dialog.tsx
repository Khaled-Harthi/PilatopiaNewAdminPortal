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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { FAQ, FAQCreate } from '@/lib/settings/types';

interface FAQDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq?: FAQ | null;
  onSubmit: (data: FAQCreate) => void;
  isLoading?: boolean;
}

interface FormData {
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
}

export function FAQDialog({
  open,
  onOpenChange,
  faq,
  onSubmit,
  isLoading,
}: FAQDialogProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const isEditing = !!faq;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      question_en: '',
      question_ar: '',
      answer_en: '',
      answer_ar: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (faq) {
        reset({
          question_en: faq.question,
          question_ar: faq.question,
          answer_en: faq.answer,
          answer_ar: faq.answer,
        });
      } else {
        reset({
          question_en: '',
          question_ar: '',
          answer_en: '',
          answer_ar: '',
        });
      }
    }
  }, [open, faq, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      question_en: data.question_en,
      question_ar: data.question_ar,
      answer_en: data.answer_en,
      answer_ar: data.answer_ar,
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
                  ? 'تعديل السؤال'
                  : 'Edit FAQ'
                : isRTL
                  ? 'إضافة سؤال'
                  : 'Add FAQ'}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {isRTL
                ? 'أدخل السؤال والجواب باللغتين'
                : 'Enter question and answer in both languages'}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="space-y-4 py-4">
            {/* Question English */}
            <div className="space-y-2">
              <Label htmlFor="question_en">
                {isRTL ? 'السؤال (إنجليزي)' : 'Question (English)'}
              </Label>
              <Textarea
                id="question_en"
                dir="ltr"
                placeholder="e.g., What should I bring to class?"
                rows={2}
                {...register('question_en', { required: true })}
                className={errors.question_en ? 'border-destructive' : ''}
              />
            </div>

            {/* Question Arabic */}
            <div className="space-y-2">
              <Label htmlFor="question_ar">
                {isRTL ? 'السؤال (عربي)' : 'Question (Arabic)'}
              </Label>
              <Textarea
                id="question_ar"
                dir="rtl"
                placeholder="مثال: ماذا يجب أن أحضر للحصة؟"
                rows={2}
                {...register('question_ar', { required: true })}
                className={errors.question_ar ? 'border-destructive' : ''}
              />
            </div>

            {/* Answer English */}
            <div className="space-y-2">
              <Label htmlFor="answer_en">
                {isRTL ? 'الجواب (إنجليزي)' : 'Answer (English)'}
              </Label>
              <Textarea
                id="answer_en"
                dir="ltr"
                placeholder="Detailed answer..."
                rows={3}
                {...register('answer_en', { required: true })}
                className={errors.answer_en ? 'border-destructive' : ''}
              />
            </div>

            {/* Answer Arabic */}
            <div className="space-y-2">
              <Label htmlFor="answer_ar">
                {isRTL ? 'الجواب (عربي)' : 'Answer (Arabic)'}
              </Label>
              <Textarea
                id="answer_ar"
                dir="rtl"
                placeholder="الجواب المفصل..."
                rows={3}
                {...register('answer_ar', { required: true })}
                className={errors.answer_ar ? 'border-destructive' : ''}
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
