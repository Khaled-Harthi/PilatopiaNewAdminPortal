'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Plus, Pencil, Trash2, Loader2, Gift, Ticket, Package } from 'lucide-react';
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
import { LoyaltyRedemptionDialog } from './loyalty-redemption-dialog';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import {
  useLoyaltyRedemptions,
  useCreateLoyaltyRedemption,
  useUpdateLoyaltyRedemption,
  useDeleteLoyaltyRedemption,
} from '@/lib/settings/hooks';
import type { LoyaltyRedemption, LoyaltyRedemptionCreate, RedemptionType } from '@/lib/settings/types';
import { toast } from 'sonner';
import Image from 'next/image';

const typeIcons: Record<RedemptionType, React.ReactNode> = {
  discount_code: <Ticket className="h-4 w-4" />,
  free_class: <Gift className="h-4 w-4" />,
  merchandise: <Package className="h-4 w-4" />,
};

const typeLabels: Record<RedemptionType, { en: string; ar: string }> = {
  discount_code: { en: 'Discount Code', ar: 'كود خصم' },
  free_class: { en: 'Free Class', ar: 'حصة مجانية' },
  merchandise: { en: 'Merchandise', ar: 'منتجات' },
};

export function LoyaltyRedemptionsContent() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState<LoyaltyRedemption | null>(null);

  const { data: redemptions, isLoading, error } = useLoyaltyRedemptions();
  const createMutation = useCreateLoyaltyRedemption();
  const updateMutation = useUpdateLoyaltyRedemption();
  const deleteMutation = useDeleteLoyaltyRedemption();

  const handleAdd = () => {
    setSelectedRedemption(null);
    setDialogOpen(true);
  };

  const handleEdit = (redemption: LoyaltyRedemption) => {
    setSelectedRedemption(redemption);
    setDialogOpen(true);
  };

  const handleDelete = (redemption: LoyaltyRedemption) => {
    setSelectedRedemption(redemption);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: LoyaltyRedemptionCreate) => {
    try {
      if (selectedRedemption) {
        await updateMutation.mutateAsync({ id: selectedRedemption.id, payload: data });
        toast.success(isRTL ? 'تم تحديث المكافأة' : 'Redemption updated');
      } else {
        await createMutation.mutateAsync(data);
        toast.success(isRTL ? 'تم إضافة المكافأة' : 'Redemption added');
      }
      setDialogOpen(false);
    } catch {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRedemption) return;
    try {
      await deleteMutation.mutateAsync(selectedRedemption.id);
      toast.success(isRTL ? 'تم حذف المكافأة' : 'Redemption deleted');
      setDeleteDialogOpen(false);
    } catch {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAvailability = (redemption: LoyaltyRedemption) => {
    if (redemption.total_available === 0) {
      return isRTL ? 'غير محدود' : 'Unlimited';
    }
    return `${redemption.total_redeemed}/${redemption.total_available}`;
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
            {isRTL ? 'مكافآت الولاء' : 'Loyalty Redemptions'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? 'إدارة المكافآت التي يمكن للأعضاء استبدالها بالنقاط'
              : 'Manage rewards members can redeem with points'}
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="me-2 h-4 w-4" />
          {isRTL ? 'إضافة مكافأة' : 'Add Redemption'}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]"></TableHead>
              <TableHead>{isRTL ? 'الاسم' : 'Name'}</TableHead>
              <TableHead>{isRTL ? 'النوع' : 'Type'}</TableHead>
              <TableHead>{isRTL ? 'النقاط' : 'Points'}</TableHead>
              <TableHead>{isRTL ? 'المتاح' : 'Available'}</TableHead>
              <TableHead>{isRTL ? 'صالح حتى' : 'Valid Until'}</TableHead>
              <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
              <TableHead className="w-[100px]">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !redemptions?.length ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {isRTL ? 'لا توجد مكافآت' : 'No redemptions found'}
                </TableCell>
              </TableRow>
            ) : (
              redemptions.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell>
                    {redemption.photo_url ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={redemption.photo_url}
                          alt={redemption.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        {typeIcons[redemption.redemption_type]}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{redemption.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {typeIcons[redemption.redemption_type]}
                      <span className="text-sm">
                        {isRTL
                          ? typeLabels[redemption.redemption_type].ar
                          : typeLabels[redemption.redemption_type].en}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{redemption.points_cost}</TableCell>
                  <TableCell>{getAvailability(redemption)}</TableCell>
                  <TableCell>{formatDate(redemption.valid_until)}</TableCell>
                  <TableCell>
                    <Badge variant={redemption.active ? 'default' : 'secondary'}>
                      {redemption.active
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
                        onClick={() => handleEdit(redemption)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(redemption)}
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
      <LoyaltyRedemptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        redemption={selectedRedemption}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Redemption"
        titleAr="حذف المكافأة"
        itemName={selectedRedemption?.name}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
