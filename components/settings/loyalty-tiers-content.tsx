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
import { LoyaltyTierDialog } from './loyalty-tier-dialog';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import {
  useLoyaltyTiers,
  useCreateLoyaltyTier,
  useUpdateLoyaltyTier,
  useDeleteLoyaltyTier,
} from '@/lib/settings/hooks';
import type { LoyaltyTier, LoyaltyTierCreate } from '@/lib/settings/types';
import { toast } from 'sonner';

export function LoyaltyTiersContent() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<LoyaltyTier | null>(null);

  const { data: tiers, isLoading, error } = useLoyaltyTiers();
  const createMutation = useCreateLoyaltyTier();
  const updateMutation = useUpdateLoyaltyTier();
  const deleteMutation = useDeleteLoyaltyTier();

  const handleAdd = () => {
    setSelectedTier(null);
    setDialogOpen(true);
  };

  const handleEdit = (tier: LoyaltyTier) => {
    setSelectedTier(tier);
    setDialogOpen(true);
  };

  const handleDelete = (tier: LoyaltyTier) => {
    setSelectedTier(tier);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: LoyaltyTierCreate) => {
    try {
      if (selectedTier) {
        await updateMutation.mutateAsync({ id: selectedTier.id, payload: data });
        toast.success(isRTL ? 'تم تحديث المستوى' : 'Tier updated');
      } else {
        await createMutation.mutateAsync(data);
        toast.success(isRTL ? 'تم إضافة المستوى' : 'Tier added');
      }
      setDialogOpen(false);
    } catch {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTier) return;
    try {
      await deleteMutation.mutateAsync(selectedTier.id);
      toast.success(isRTL ? 'تم حذف المستوى' : 'Tier deleted');
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
            {isRTL ? 'مستويات الولاء' : 'Loyalty Tiers'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? 'إدارة مستويات برنامج الولاء والمكافآت'
              : 'Manage loyalty program tiers and thresholds'}
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="me-2 h-4 w-4" />
          {isRTL ? 'إضافة مستوى' : 'Add Tier'}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isRTL ? 'اللون' : 'Color'}</TableHead>
              <TableHead>{isRTL ? 'الاسم' : 'Name'}</TableHead>
              <TableHead>{isRTL ? 'الحد الأدنى للحصص' : 'Min Classes'}</TableHead>
              <TableHead>{isRTL ? 'الترتيب' : 'Order'}</TableHead>
              <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
              <TableHead className="w-[100px]">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !tiers?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {isRTL ? 'لا توجد مستويات' : 'No tiers found'}
                </TableCell>
              </TableRow>
            ) : (
              tiers
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell>
                      {tier.tier_color ? (
                        <div
                          className="h-6 w-6 rounded-full border"
                          style={{ backgroundColor: tier.tier_color }}
                          title={tier.tier_color}
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full border bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{tier.tier_name}</TableCell>
                    <TableCell>{tier.min_classes}</TableCell>
                    <TableCell>{tier.sort_order}</TableCell>
                    <TableCell>
                      <Badge variant={tier.active ? 'default' : 'secondary'}>
                        {tier.active
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
                          onClick={() => handleEdit(tier)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tier)}
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
      <LoyaltyTierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tier={selectedTier}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Tier"
        titleAr="حذف المستوى"
        itemName={selectedTier?.tier_name}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
