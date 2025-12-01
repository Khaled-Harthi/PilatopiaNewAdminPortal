'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Plus, Pencil, Trash2, Loader2, Bell, MessageCircle, Mail, Smartphone } from 'lucide-react';
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
import { NotificationTemplateDialog } from './notification-template-dialog';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import {
  useNotificationTemplates,
  useCreateNotificationTemplate,
  useUpdateNotificationTemplate,
  useDeleteNotificationTemplate,
} from '@/lib/settings/hooks';
import type { NotificationTemplate, NotificationTemplateCreate } from '@/lib/settings/types';
import { toast } from 'sonner';

const CHANNEL_ICONS = {
  push: Bell,
  whatsapp: MessageCircle,
  sms: Smartphone,
  email: Mail,
};

const CHANNEL_LABELS = {
  push: { en: 'Push', ar: 'إشعار' },
  whatsapp: { en: 'WhatsApp', ar: 'واتساب' },
  sms: { en: 'SMS', ar: 'SMS' },
  email: { en: 'Email', ar: 'بريد' },
};

export function NotificationsContent() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);

  const { data: templates, isLoading, error } = useNotificationTemplates();
  const createMutation = useCreateNotificationTemplate();
  const updateMutation = useUpdateNotificationTemplate();
  const deleteMutation = useDeleteNotificationTemplate();

  const handleAdd = () => {
    setSelectedTemplate(null);
    setDialogOpen(true);
  };

  const handleEdit = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleDelete = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: NotificationTemplateCreate) => {
    try {
      if (selectedTemplate) {
        await updateMutation.mutateAsync({ id: selectedTemplate.id, payload: data });
        toast.success(isRTL ? 'تم تحديث القالب' : 'Template updated');
      } else {
        await createMutation.mutateAsync(data);
        toast.success(isRTL ? 'تم إضافة القالب' : 'Template added');
      }
      setDialogOpen(false);
    } catch {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTemplate) return;
    try {
      await deleteMutation.mutateAsync(selectedTemplate.id);
      toast.success(isRTL ? 'تم حذف القالب' : 'Template deleted');
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
            {isRTL ? 'قوالب الإشعارات' : 'Notification Templates'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? 'إدارة قوالب الإشعارات للتطبيق'
              : 'Manage notification templates for the app'}
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="me-2 h-4 w-4" />
          {isRTL ? 'إضافة قالب' : 'Add Template'}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isRTL ? 'المفتاح' : 'Key'}</TableHead>
              <TableHead>{isRTL ? 'العنوان' : 'Title'}</TableHead>
              <TableHead>{isRTL ? 'القناة' : 'Channel'}</TableHead>
              <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
              <TableHead className="w-[100px]">{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !templates?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {isRTL ? 'لا توجد قوالب' : 'No templates found'}
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => {
                const ChannelIcon = CHANNEL_ICONS[template.channel];
                return (
                  <TableRow key={template.id}>
                    <TableCell className="font-mono text-sm">{template.key}</TableCell>
                    <TableCell className="font-medium">{template.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ChannelIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {CHANNEL_LABELS[template.channel][isRTL ? 'ar' : 'en']}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active
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
                          onClick={() => handleEdit(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(template)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <NotificationTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={selectedTemplate}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Template"
        titleAr="حذف القالب"
        itemName={selectedTemplate?.key}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
