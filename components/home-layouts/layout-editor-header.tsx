'use client';

import { useLocale } from 'next-intl';
import { ArrowLeft, ArrowRight, Undo2, Redo2, Loader2, Save, Power, PowerOff } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface LayoutEditorHeaderProps {
  name: string;
  onNameChange: (name: string) => void;
  isActive: boolean;
  onSave: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  isSaving: boolean;
  isActivating: boolean;
  isDeactivating: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  hasChanges: boolean;
}

export function LayoutEditorHeader({
  name,
  onNameChange,
  isActive,
  onSave,
  onActivate,
  onDeactivate,
  isSaving,
  isActivating,
  isDeactivating,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  hasChanges,
}: LayoutEditorHeaderProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const isLoading = isSaving || isActivating || isDeactivating;

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <Link href="/settings/content/home-layouts">
          <Button variant="ghost" size="sm" className="gap-2">
            <BackArrow className="h-4 w-4" />
            {isRTL ? 'التخطيطات' : 'Layouts'}
          </Button>
        </Link>

        {/* Name Input */}
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-[200px] h-8 text-sm"
            placeholder={isRTL ? 'اسم التخطيط' : 'Layout name'}
          />
          {isActive && (
            <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
              {isRTL ? 'نشط' : 'Active'}
            </Badge>
          )}
          {hasChanges && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              {isRTL ? 'غير محفوظ' : 'Unsaved'}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-e pe-2 me-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo || isLoading}
            title={isRTL ? 'تراجع' : 'Undo'}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo || isLoading}
            title={isRTL ? 'إعادة' : 'Redo'}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Save Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={isLoading || !hasChanges}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 me-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 me-2" />
          )}
          {isRTL ? 'حفظ' : 'Save'}
        </Button>

        {/* Activate/Deactivate Button */}
        {isActive ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onDeactivate}
            disabled={isLoading}
          >
            {isDeactivating ? (
              <Loader2 className="h-4 w-4 me-2 animate-spin" />
            ) : (
              <PowerOff className="h-4 w-4 me-2" />
            )}
            {isRTL ? 'إلغاء التفعيل' : 'Deactivate'}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onActivate}
            disabled={isLoading || hasChanges}
            title={hasChanges ? (isRTL ? 'احفظ التغييرات أولاً' : 'Save changes first') : undefined}
          >
            {isActivating ? (
              <Loader2 className="h-4 w-4 me-2 animate-spin" />
            ) : (
              <Power className="h-4 w-4 me-2" />
            )}
            {isRTL ? 'تفعيل' : 'Activate'}
          </Button>
        )}
      </div>
    </div>
  );
}
