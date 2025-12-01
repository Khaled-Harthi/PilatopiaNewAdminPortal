'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClassTypeDialog } from './class-type-dialog';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import {
  useClassTypes,
  useCreateClassType,
  useUpdateClassType,
  useDeleteClassType,
} from '@/lib/settings/hooks';
import type { ClassType, ClassTypeCreate } from '@/lib/settings/types';
import { toast } from 'sonner';

export function ClassTypesContent() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClassType, setSelectedClassType] = useState<ClassType | null>(null);

  const { data: classTypes, isLoading, error } = useClassTypes();
  const createMutation = useCreateClassType();
  const updateMutation = useUpdateClassType();
  const deleteMutation = useDeleteClassType();

  const handleAdd = () => {
    setSelectedClassType(null);
    setDialogOpen(true);
  };

  const handleEdit = (classType: ClassType) => {
    setSelectedClassType(classType);
    setDialogOpen(true);
  };

  const handleDelete = (classType: ClassType) => {
    setSelectedClassType(classType);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: ClassTypeCreate) => {
    try {
      if (selectedClassType) {
        await updateMutation.mutateAsync({ id: selectedClassType.id, payload: data });
        toast.success(isRTL ? 'تم تحديث نوع الحصة' : 'Class type updated');
      } else {
        await createMutation.mutateAsync(data);
        toast.success(isRTL ? 'تم إضافة نوع الحصة' : 'Class type added');
      }
      setDialogOpen(false);
    } catch {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedClassType) return;
    try {
      await deleteMutation.mutateAsync(selectedClassType.id);
      toast.success(isRTL ? 'تم حذف نوع الحصة' : 'Class type deleted');
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
            {isRTL ? 'أنواع الحصص' : 'Class Types'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? 'إدارة أنواع الحصص مثل ريفورمر، مات، تاور'
              : 'Manage class types like Reformer, Mat, Tower'}
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="me-2 h-4 w-4" />
          {isRTL ? 'إضافة نوع' : 'Add Type'}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isRTL ? 'الاسم' : 'Name'}</TableHead>
              <TableHead>{isRTL ? 'الوصف' : 'Description'}</TableHead>
              <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
              <TableHead className="w-[100px]">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !classTypes?.length ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  {isRTL ? 'لا توجد أنواع حصص' : 'No class types found'}
                </TableCell>
              </TableRow>
            ) : (
              classTypes.map((classType) => (
                <TableRow key={classType.id}>
                  <TableCell className="font-medium">{classType.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {classType.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={classType.is_active ? 'default' : 'secondary'}>
                      {classType.is_active
                        ? isRTL
                          ? 'نشط'
                          : 'Active'
                        : isRTL
                          ? 'غير نشط'
                          : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(classType)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(classType)}
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
      <ClassTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        classType={selectedClassType}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Class Type"
        titleAr="حذف نوع الحصة"
        itemName={selectedClassType?.name}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
