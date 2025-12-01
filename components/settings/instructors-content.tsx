'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Plus, Pencil, Trash2, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InstructorDialog } from './instructor-dialog';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import {
  useInstructors,
  useCreateInstructor,
  useUpdateInstructor,
  useDeleteInstructor,
} from '@/lib/settings/hooks';
import type { Instructor, InstructorCreate } from '@/lib/settings/types';
import { toast } from 'sonner';

export function InstructorsContent() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  const { data: instructors, isLoading, error } = useInstructors();
  const createMutation = useCreateInstructor();
  const updateMutation = useUpdateInstructor();
  const deleteMutation = useDeleteInstructor();

  const handleAdd = () => {
    setSelectedInstructor(null);
    setDialogOpen(true);
  };

  const handleEdit = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setDialogOpen(true);
  };

  const handleDelete = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: InstructorCreate) => {
    try {
      if (selectedInstructor) {
        await updateMutation.mutateAsync({ id: selectedInstructor.id, payload: data });
        toast.success(isRTL ? 'تم تحديث المدرب' : 'Instructor updated');
      } else {
        await createMutation.mutateAsync(data);
        toast.success(isRTL ? 'تم إضافة المدرب' : 'Instructor added');
      }
      setDialogOpen(false);
    } catch {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedInstructor) return;
    try {
      await deleteMutation.mutateAsync(selectedInstructor.id);
      toast.success(isRTL ? 'تم حذف المدرب' : 'Instructor deleted');
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
            {isRTL ? 'المدربون' : 'Instructors'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? 'إدارة المدربين وملفاتهم الشخصية'
              : 'Manage instructors and their profiles'}
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="me-2 h-4 w-4" />
          {isRTL ? 'إضافة مدرب' : 'Add Instructor'}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isRTL ? 'المدرب' : 'Instructor'}</TableHead>
              <TableHead>{isRTL ? 'النبذة' : 'Bio'}</TableHead>
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
            ) : !instructors?.length ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  {isRTL ? 'لا يوجد مدربون' : 'No instructors found'}
                </TableCell>
              </TableRow>
            ) : (
              instructors.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={instructor.photo_url || undefined} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{instructor.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {instructor.bio || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={instructor.is_active ? 'default' : 'secondary'}>
                      {instructor.is_active
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
                        onClick={() => handleEdit(instructor)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(instructor)}
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
      <InstructorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        instructor={selectedInstructor}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Instructor"
        titleAr="حذف المدرب"
        itemName={selectedInstructor?.name}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
