'use client';

import { useLocale } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface DeleteLayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layoutName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteLayoutDialog({
  open,
  onOpenChange,
  layoutName,
  onConfirm,
  isLoading,
}: DeleteLayoutDialogProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isRTL ? 'حذف التخطيط' : 'Delete Layout'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isRTL
              ? `هل أنت متأكد من حذف "${layoutName}"؟ لا يمكن التراجع عن هذا الإجراء.`
              : `Are you sure you want to delete "${layoutName}"? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {isRTL ? 'حذف' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
