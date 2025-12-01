'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FAQDialog } from './faq-dialog';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import {
  useFAQs,
  useCreateFAQ,
  useUpdateFAQ,
  useDeleteFAQ,
} from '@/lib/settings/hooks';
import type { FAQ, FAQCreate } from '@/lib/settings/types';
import { toast } from 'sonner';

export function FAQContent() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);

  const { data: faqs, isLoading, error } = useFAQs();
  const createMutation = useCreateFAQ();
  const updateMutation = useUpdateFAQ();
  const deleteMutation = useDeleteFAQ();

  const handleAdd = () => {
    setSelectedFAQ(null);
    setDialogOpen(true);
  };

  const handleEdit = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setDialogOpen(true);
  };

  const handleDelete = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: FAQCreate) => {
    try {
      if (selectedFAQ) {
        await updateMutation.mutateAsync({ id: selectedFAQ.id, payload: data });
        toast.success(isRTL ? 'تم تحديث السؤال' : 'FAQ updated');
      } else {
        await createMutation.mutateAsync(data);
        toast.success(isRTL ? 'تم إضافة السؤال' : 'FAQ added');
      }
      setDialogOpen(false);
    } catch {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedFAQ) return;
    try {
      await deleteMutation.mutateAsync(selectedFAQ.id);
      toast.success(isRTL ? 'تم حذف السؤال' : 'FAQ deleted');
      setDeleteDialogOpen(false);
    } catch {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          {isRTL ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {isRTL ? 'الأسئلة الشائعة' : 'FAQ'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? 'إدارة الأسئلة المتكررة للأعضاء'
              : 'Manage frequently asked questions for members'}
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="me-2 h-4 w-4" />
          {isRTL ? 'إضافة سؤال' : 'Add FAQ'}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">{isRTL ? 'السؤال' : 'Question'}</TableHead>
              <TableHead>{isRTL ? 'الجواب' : 'Answer'}</TableHead>
              <TableHead className="w-[100px]">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !faqs?.length ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  {isRTL ? 'لا توجد أسئلة' : 'No FAQs found'}
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="font-medium">{faq.question}</TableCell>
                  <TableCell className="max-w-[400px] truncate text-muted-foreground">
                    {faq.answer}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(faq)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(faq)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <FAQDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        faq={selectedFAQ}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete FAQ"
        titleAr="حذف السؤال"
        itemName={selectedFAQ?.question}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
