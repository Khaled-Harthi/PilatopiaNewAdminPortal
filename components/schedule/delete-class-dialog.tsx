'use client';

import { useLocale } from 'next-intl';
import { toast } from 'sonner';
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
import { useDeleteClass } from '@/lib/schedule/hooks';
import type { PilatesClass } from '@/lib/schedule/types';
import { toLocalDate } from '@/lib/schedule/time-utils';

interface DeleteClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: PilatesClass | null;
}

export function DeleteClassDialog({ open, onOpenChange, classData }: DeleteClassDialogProps) {
  const locale = useLocale();
  const deleteClass = useDeleteClass();

  const handleDelete = async () => {
    if (!classData) return;

    try {
      await deleteClass.mutateAsync(classData.id);
      toast.success(locale === 'ar' ? 'تم حذف الحصة بنجاح' : 'Class deleted successfully');
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('Failed to delete class:', error);

      // Extract error message from API response
      let errorMessage = locale === 'ar' ? 'فشل في حذف الحصة' : 'Failed to delete class';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        const apiError = axiosError.response?.data?.error;
        if (apiError) {
          // Map common API errors to user-friendly messages
          if (apiError.includes('already started')) {
            errorMessage = locale === 'ar'
              ? 'لا يمكن حذف حصة بدأت بالفعل'
              : 'Cannot delete a class that has already started';
          } else if (apiError.includes('bookings')) {
            errorMessage = locale === 'ar'
              ? 'لا يمكن حذف حصة بها حجوزات'
              : 'Cannot delete a class with existing bookings';
          } else {
            errorMessage = apiError;
          }
        }
      }

      toast.error(errorMessage);
    }
  };

  if (!classData) return null;

  const classDate = toLocalDate(classData.schedule_time);
  const formattedDate = classDate.toLocaleDateString(
    locale === 'ar' ? 'ar-SA' : 'en-US',
    { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }
  );
  const formattedTime = classDate.toLocaleTimeString(
    locale === 'ar' ? 'ar-SA' : 'en-US',
    { hour: 'numeric', minute: '2-digit' }
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {locale === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              {locale === 'ar'
                ? 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف هذه الحصة نهائياً.'
                : 'This action cannot be undone. This will permanently delete this class.'}
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg space-y-1">
              <p className="font-semibold">{classData.class_type}</p>
              <p className="text-sm">
                {locale === 'ar' ? 'المدرب:' : 'Instructor:'} {classData.instructor}
              </p>
              <p className="text-sm">
                {locale === 'ar' ? 'التاريخ:' : 'Date:'} {formattedDate}
              </p>
              <p className="text-sm">
                {locale === 'ar' ? 'الوقت:' : 'Time:'} {formattedTime}
              </p>
              <p className="text-sm">
                {locale === 'ar' ? 'الغرفة:' : 'Room:'} {classData.class_room_name}
              </p>
              {classData.booked_seats > 0 && (
                <p className="text-sm text-destructive font-medium mt-2">
                  ⚠️ {classData.booked_seats} {locale === 'ar' ? 'عضو مسجل في هذه الحصة' : 'member(s) registered for this class'}
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteClass.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteClass.isPending
              ? (locale === 'ar' ? 'جاري الحذف...' : 'Deleting...')
              : (locale === 'ar' ? 'حذف الحصة' : 'Delete Class')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
