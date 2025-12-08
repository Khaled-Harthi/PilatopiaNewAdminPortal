'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUndoRedo } from '@/hooks/use-undo-redo';
import { LayoutEditorHeader } from './layout-editor-header';
import { ComponentList } from './component-list';
import { AddComponentSheet } from './add-component-sheet';
import { ConfigureComponentDialog } from './configure-component-dialog';
import { PhoneFramePreview } from './phone-frame-preview';
import { DeleteLayoutDialog } from './delete-layout-dialog';
import {
  useHomeLayout,
  useUpdateHomeLayout,
  useActivateHomeLayout,
  useDeactivateHomeLayout,
  useAddComponent,
  useUpdateComponent,
  useRemoveComponent,
  useReorderComponents,
} from '@/lib/home-layouts/hooks';
import type {
  HomeLayoutComponent,
  HomeLayoutComponentType,
  DynamicComponentType,
  ComponentProps,
} from '@/lib/home-layouts/types';
import { toast } from 'sonner';

const DYNAMIC_TYPES: DynamicComponentType[] = [
  'dynamic_card',
  'dynamic_banner',
  'dynamic_image_list',
];

interface LayoutEditorProps {
  layoutId: number;
}

export function LayoutEditor({ layoutId }: LayoutEditorProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const isMobile = useIsMobile();

  // State
  const [name, setName] = useState('');
  const [mobileTab, setMobileTab] = useState<'components' | 'preview'>('components');
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [configureDialog, setConfigureDialog] = useState<{
    open: boolean;
    component: HomeLayoutComponent | null;
    newType: DynamicComponentType | null;
  }>({ open: false, component: null, newType: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    componentId: number | null;
  }>({ open: false, componentId: null });

  // Data fetching
  const { data: layout, isLoading, error } = useHomeLayout(layoutId);

  // Mutations
  const updateLayoutMutation = useUpdateHomeLayout();
  const activateMutation = useActivateHomeLayout();
  const deactivateMutation = useDeactivateHomeLayout();
  const addComponentMutation = useAddComponent();
  const updateComponentMutation = useUpdateComponent();
  const deleteComponentMutation = useRemoveComponent();
  const reorderMutation = useReorderComponents();

  // Local component state with undo/redo
  const [components, { set: setComponents, undo, redo, canUndo, canRedo, reset: resetComponents }] =
    useUndoRedo<HomeLayoutComponent[]>([]);

  // Track if there are unsaved changes
  const [originalName, setOriginalName] = useState('');
  const [originalComponents, setOriginalComponents] = useState<HomeLayoutComponent[]>([]);

  const hasChanges = useMemo(() => {
    if (name !== originalName) return true;
    if (components.length !== originalComponents.length) return true;

    const sortedCurrent = [...components].sort((a, b) => a.id - b.id);
    const sortedOriginal = [...originalComponents].sort((a, b) => a.id - b.id);

    return JSON.stringify(sortedCurrent) !== JSON.stringify(sortedOriginal);
  }, [name, originalName, components, originalComponents]);

  // Initialize state from fetched data
  useEffect(() => {
    if (layout) {
      setName(layout.name);
      setOriginalName(layout.name);
      setComponents(layout.components || []);
      resetComponents(layout.components || []);
      setOriginalComponents(layout.components || []);
    }
  }, [layout, setComponents, resetComponents]);

  // Get existing component IDs for validation
  const existingComponentIds = useMemo(() => {
    return components.map((c) => c.component_id);
  }, [components]);

  // Get existing component types for built-in validation
  const existingTypes = useMemo(() => {
    return components.map((c) => c.component_type);
  }, [components]);

  // Handlers
  const handleSave = async () => {
    try {
      // Update layout name if changed
      if (name !== originalName) {
        await updateLayoutMutation.mutateAsync({
          id: layoutId,
          payload: { name },
        });
      }

      // Sync component order to server
      const componentIds = [...components]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((c) => c.id);
      await reorderMutation.mutateAsync({ layoutId, payload: { order: componentIds } });

      setOriginalName(name);
      setOriginalComponents(components);
      toast.success(isRTL ? 'تم الحفظ' : 'Saved');
    } catch {
      toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save');
    }
  };

  const handleActivate = async () => {
    try {
      await activateMutation.mutateAsync(layoutId);
      toast.success(isRTL ? 'تم تفعيل التخطيط' : 'Layout activated');
    } catch {
      toast.error(isRTL ? 'فشل التفعيل' : 'Failed to activate');
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync(layoutId);
      toast.success(isRTL ? 'تم إلغاء التفعيل' : 'Layout deactivated');
    } catch {
      toast.error(isRTL ? 'فشل إلغاء التفعيل' : 'Failed to deactivate');
    }
  };

  const handleReorder = useCallback((newComponents: HomeLayoutComponent[]) => {
    setComponents(newComponents);
  }, [setComponents]);

  const handleToggleVisibility = useCallback(async (id: number) => {
    const component = components.find((c) => c.id === id);
    if (!component) return;

    try {
      await updateComponentMutation.mutateAsync({
        layoutId,
        componentId: id,
        payload: { visible: !component.visible },
      });

      setComponents(
        components.map((c) =>
          c.id === id ? { ...c, visible: !c.visible } : c
        )
      );
    } catch {
      toast.error(isRTL ? 'فشل تحديث الرؤية' : 'Failed to update visibility');
    }
  }, [components, setComponents, layoutId, updateComponentMutation, isRTL]);

  const handleEdit = useCallback((component: HomeLayoutComponent) => {
    setConfigureDialog({
      open: true,
      component,
      newType: null,
    });
  }, []);

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteDialog({ open: true, componentId: id });
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.componentId) return;

    try {
      await deleteComponentMutation.mutateAsync({
        layoutId,
        componentId: deleteDialog.componentId,
      });

      setComponents(components.filter((c) => c.id !== deleteDialog.componentId));
      setDeleteDialog({ open: false, componentId: null });
      toast.success(isRTL ? 'تم حذف المكون' : 'Component deleted');
    } catch {
      toast.error(isRTL ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  const handleAddComponent = (type: HomeLayoutComponentType) => {
    if (DYNAMIC_TYPES.includes(type as DynamicComponentType)) {
      setConfigureDialog({
        open: true,
        component: null,
        newType: type as DynamicComponentType,
      });
    } else {
      // Built-in component - add directly
      handleAddBuiltInComponent(type);
    }
    setAddSheetOpen(false);
  };

  const handleAddBuiltInComponent = async (type: HomeLayoutComponentType) => {
    try {
      const newComponent = await addComponentMutation.mutateAsync({
        layoutId,
        payload: {
          component_id: type,
          component_type: type,
          visible: true,
        },
      });

      setComponents([
        ...components,
        {
          ...newComponent,
          sort_order: components.length,
        },
      ]);
      toast.success(isRTL ? 'تمت الإضافة' : 'Component added');
    } catch {
      toast.error(isRTL ? 'فشلت الإضافة' : 'Failed to add component');
    }
  };

  const handleConfigureSave = async (componentId: string, props: ComponentProps) => {
    const { component, newType } = configureDialog;

    try {
      if (component) {
        // Update existing component
        await updateComponentMutation.mutateAsync({
          layoutId,
          componentId: component.id,
          payload: {
            component_id: componentId,
            props,
          },
        });

        setComponents(
          components.map((c) =>
            c.id === component.id
              ? { ...c, component_id: componentId, props }
              : c
          )
        );
        toast.success(isRTL ? 'تم التحديث' : 'Component updated');
      } else if (newType) {
        // Add new dynamic component
        const newComponent = await addComponentMutation.mutateAsync({
          layoutId,
          payload: {
            component_id: componentId,
            component_type: newType,
            visible: true,
            props,
          },
        });

        setComponents([
          ...components,
          {
            ...newComponent,
            sort_order: components.length,
          },
        ]);
        toast.success(isRTL ? 'تمت الإضافة' : 'Component added');
      }

      setConfigureDialog({ open: false, component: null, newType: null });
    } catch {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !layout) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">
          {isRTL ? 'فشل تحميل التخطيط' : 'Failed to load layout'}
        </p>
      </div>
    );
  }

  const isSaving =
    updateLayoutMutation.isPending ||
    reorderMutation.isPending;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <LayoutEditorHeader
        name={name}
        onNameChange={setName}
        isActive={layout.is_active}
        onSave={handleSave}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
        isSaving={isSaving}
        isActivating={activateMutation.isPending}
        isDeactivating={deactivateMutation.isPending}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        hasChanges={hasChanges}
      />

      {/* Main Content */}
      {isMobile ? (
        // Mobile: Tabs
        <Tabs
          value={mobileTab}
          onValueChange={(v) => setMobileTab(v as 'components' | 'preview')}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
            <TabsTrigger value="components">
              {isRTL ? 'المكونات' : 'Components'}
            </TabsTrigger>
            <TabsTrigger value="preview">
              {isRTL ? 'المعاينة' : 'Preview'}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="components" className="flex-1 m-0">
            <ComponentList
              components={components}
              onReorder={handleReorder}
              onToggleVisibility={handleToggleVisibility}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onAddClick={() => setAddSheetOpen(true)}
            />
          </TabsContent>
          <TabsContent value="preview" className="flex-1 m-0">
            <PhoneFramePreview components={components} layoutName={name} />
          </TabsContent>
        </Tabs>
      ) : (
        // Desktop: Split View
        <div className="flex-1 flex overflow-hidden">
          <div className="w-[400px] border-e flex flex-col">
            <ComponentList
              components={components}
              onReorder={handleReorder}
              onToggleVisibility={handleToggleVisibility}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onAddClick={() => setAddSheetOpen(true)}
            />
          </div>
          <div className="flex-1 flex flex-col">
            <PhoneFramePreview components={components} layoutName={name} />
          </div>
        </div>
      )}

      {/* Add Component Sheet */}
      <AddComponentSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        onSelect={handleAddComponent}
        existingTypes={existingTypes}
      />

      {/* Configure Component Dialog */}
      <ConfigureComponentDialog
        open={configureDialog.open}
        onOpenChange={(open) =>
          setConfigureDialog({ ...configureDialog, open })
        }
        component={configureDialog.component}
        componentType={configureDialog.newType}
        onSave={handleConfigureSave}
        isLoading={addComponentMutation.isPending || updateComponentMutation.isPending}
        existingComponentIds={existingComponentIds.filter(
          (id) => id !== configureDialog.component?.component_id
        )}
      />

      {/* Delete Confirmation */}
      <DeleteLayoutDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        layoutName={isRTL ? 'هذا المكون' : 'this component'}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteComponentMutation.isPending}
      />
    </div>
  );
}
