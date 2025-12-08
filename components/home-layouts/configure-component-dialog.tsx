'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocale } from 'next-intl';
import { Loader2, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/form/image-upload';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUploadMedia } from '@/lib/media';
import type {
  HomeLayoutComponent,
  DynamicComponentType,
  DynamicCardProps,
  DynamicBannerProps,
  DynamicImageListProps,
  DynamicImageListItem,
  ComponentProps,
} from '@/lib/home-layouts/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FormData {
  component_id: string;
  // Common fields for all dynamic types
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  // Image handling (for card/banner)
  image_file: File | null;
  existing_image_url: string;
  // Styling
  background_color: string;
  // Action
  action_type: 'none' | 'deep_link' | 'external_url' | 'screen';
  action_target: string;
  action_title: string;
  // Image list specific
  show_labels: boolean;
  layout_item_width: number;
  layout_item_height: number;
  layout_spacing: number;
  layout_border_radius: number;
  see_all_action_type: 'none' | 'deep_link' | 'external_url' | 'screen';
  see_all_action_target: string;
  see_all_action_title: string;
}

// Local state for image list items (separate from form)
interface ImageListItemLocal {
  id: string;
  imageFile: File | null;
  existingUrl: string;
  label_en: string;
  label_ar: string;
  action_type: 'none' | 'deep_link' | 'external_url' | 'screen';
  action_target: string;
  action_title: string;
}

interface ConfigureComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  component: HomeLayoutComponent | null;
  componentType: DynamicComponentType | null;
  onSave: (componentId: string, props: ComponentProps) => void;
  isLoading?: boolean;
  existingComponentIds: string[];
}

const defaultColors = [
  '#FFFFFF',
  '#F3F4F6',
  '#FEE2E2',
  '#DBEAFE',
  '#D1FAE5',
  '#FEF3C7',
  '#E0E7FF',
  '#FCE7F3',
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function ConfigureComponentDialog({
  open,
  onOpenChange,
  component,
  componentType,
  onSave,
  isLoading,
  existingComponentIds,
}: ConfigureComponentDialogProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [activeTab, setActiveTab] = useState('english');
  const [imageListItems, setImageListItems] = useState<ImageListItemLocal[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useUploadMedia();
  const isSubmitting = isLoading || uploadMutation.isPending || isUploading;

  const isEditing = !!component;
  const type = componentType || (component?.component_type as DynamicComponentType);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      component_id: '',
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      image_file: null,
      existing_image_url: '',
      background_color: '#FFFFFF',
      action_type: 'none',
      action_target: '',
      action_title: '',
      // Image list defaults
      show_labels: true,
      layout_item_width: 120,
      layout_item_height: 120,
      layout_spacing: 12,
      layout_border_radius: 12,
      see_all_action_type: 'none',
      see_all_action_target: '',
      see_all_action_title: '',
    },
  });

  const watchedImageFile = watch('image_file');
  const watchedExistingImageUrl = watch('existing_image_url');
  const watchedActionType = watch('action_type');
  const watchedBackgroundColor = watch('background_color');
  const watchedShowLabels = watch('show_labels');
  const watchedSeeAllActionType = watch('see_all_action_type');

  useEffect(() => {
    if (component && open) {
      const props = component.props as DynamicCardProps | DynamicBannerProps | DynamicImageListProps | null;

      // Reset form fields
      const cardProps = props as DynamicCardProps | null;
      const listProps = props as DynamicImageListProps | null;
      const actionType = cardProps?.action?.type;
      const mappedActionType: 'none' | 'deep_link' | 'external_url' | 'screen' =
        actionType === 'deep_link' || actionType === 'external_url' || actionType === 'screen'
          ? actionType
          : 'none';

      const seeAllActionType = listProps?.seeAllAction?.type;
      const mappedSeeAllActionType: 'none' | 'deep_link' | 'external_url' | 'screen' =
        seeAllActionType === 'deep_link' || seeAllActionType === 'external_url' || seeAllActionType === 'screen'
          ? seeAllActionType
          : 'none';

      reset({
        component_id: component.component_id,
        title_en: props?.title_en || '',
        title_ar: props?.title_ar || '',
        description_en: cardProps?.description_en || '',
        description_ar: cardProps?.description_ar || '',
        image_file: null,
        existing_image_url: cardProps?.imageUrl || '',
        background_color: cardProps?.backgroundColor || '#FFFFFF',
        action_type: mappedActionType,
        action_target: cardProps?.action?.target || '',
        action_title: cardProps?.action?.title || '',
        // Image list specific
        show_labels: listProps?.showLabels ?? true,
        layout_item_width: listProps?.layout?.itemWidth ?? 120,
        layout_item_height: listProps?.layout?.itemHeight ?? 120,
        layout_spacing: listProps?.layout?.spacing ?? 12,
        layout_border_radius: listProps?.layout?.borderRadius ?? 12,
        see_all_action_type: mappedSeeAllActionType,
        see_all_action_target: listProps?.seeAllAction?.target || '',
        see_all_action_title: listProps?.seeAllAction?.title || '',
      });

      // Reset image list items for dynamic_image_list
      if (component.component_type === 'dynamic_image_list') {
        setImageListItems(
          (listProps?.items || []).map((item) => ({
            id: item.id,
            imageFile: null,
            existingUrl: item.imageUrl,
            label_en: item.label_en,
            label_ar: item.label_ar,
            action_type: item.action?.type === 'deep_link' || item.action?.type === 'external_url' || item.action?.type === 'screen'
              ? item.action.type
              : 'none',
            action_target: item.action?.target || '',
            action_title: item.action?.title || '',
          }))
        );
      } else {
        setImageListItems([]);
      }
    } else if (!component && open) {
      reset({
        component_id: '',
        title_en: '',
        title_ar: '',
        description_en: '',
        description_ar: '',
        image_file: null,
        existing_image_url: '',
        background_color: '#FFFFFF',
        action_type: 'none',
        action_target: '',
        action_title: '',
        show_labels: true,
        layout_item_width: 120,
        layout_item_height: 120,
        layout_spacing: 12,
        layout_border_radius: 12,
        see_all_action_type: 'none',
        see_all_action_target: '',
        see_all_action_title: '',
      });
      setImageListItems([]);
    }
  }, [component, open, reset]);

  // Image list item handlers
  const addImageItem = () => {
    setImageListItems([
      ...imageListItems,
      {
        id: generateId(),
        imageFile: null,
        existingUrl: '',
        label_en: '',
        label_ar: '',
        action_type: 'none',
        action_target: '',
        action_title: '',
      },
    ]);
  };

  const removeImageItem = (id: string) => {
    setImageListItems(imageListItems.filter((item) => item.id !== id));
  };

  const updateImageItem = (id: string, updates: Partial<ImageListItemLocal>) => {
    setImageListItems(
      imageListItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const handleFormSubmit = async (data: FormData) => {
    // Validate component_id
    if (!data.component_id.trim()) {
      toast.error(isRTL ? 'معرف المكون مطلوب' : 'Component ID is required');
      return;
    }

    if (data.component_id.length > 50) {
      toast.error(
        isRTL
          ? 'معرف المكون يجب أن يكون أقل من 50 حرف'
          : 'Component ID must be less than 50 characters'
      );
      return;
    }

    // Check uniqueness (only if creating new or changing ID)
    if (!isEditing || data.component_id !== component?.component_id) {
      if (existingComponentIds.includes(data.component_id)) {
        toast.error(
          isRTL
            ? 'معرف المكون موجود بالفعل'
            : 'Component ID already exists'
        );
        return;
      }
    }

    try {
      setIsUploading(true);

      // Build props based on component type
      let props: ComponentProps = null;

      if (type === 'dynamic_card' || type === 'dynamic_banner') {
        // Upload main image if needed
        let imageUrl = data.existing_image_url;
        if (data.image_file) {
          const uploadResult = await uploadMutation.mutateAsync({
            file: data.image_file,
            folder: 'home-layouts',
          });
          imageUrl = uploadResult.url;
        }

        const cardProps: DynamicCardProps = {
          title_en: data.title_en,
          title_ar: data.title_ar,
          description_en: data.description_en || undefined,
          description_ar: data.description_ar || undefined,
          imageUrl: imageUrl || undefined,
          backgroundColor: data.background_color || undefined,
          action:
            data.action_type !== 'none'
              ? {
                  type: data.action_type,
                  target: data.action_target,
                }
              : undefined,
        };
        props = cardProps;
      } else if (type === 'dynamic_image_list') {
        // Upload all images for the list
        const uploadedItems: DynamicImageListItem[] = [];

        for (const item of imageListItems) {
          let imageUrl = item.existingUrl;

          // Upload new image if provided
          if (item.imageFile) {
            const uploadResult = await uploadMutation.mutateAsync({
              file: item.imageFile,
              folder: 'home-layouts',
            });
            imageUrl = uploadResult.url;
          }

          // Only include items with images
          if (imageUrl) {
            uploadedItems.push({
              id: item.id,
              imageUrl,
              label_en: item.label_en,
              label_ar: item.label_ar,
              action:
                item.action_type !== 'none'
                  ? {
                      type: item.action_type,
                      target: item.action_target,
                      title: item.action_title || undefined,
                    }
                  : undefined,
            });
          }
        }

        const imageListProps: DynamicImageListProps = {
          title_en: data.title_en,
          title_ar: data.title_ar,
          items: uploadedItems,
          showLabels: data.show_labels,
          layout: {
            itemWidth: data.layout_item_width,
            itemHeight: data.layout_item_height,
            spacing: data.layout_spacing,
            borderRadius: data.layout_border_radius,
          },
          seeAllAction:
            data.see_all_action_type !== 'none'
              ? {
                  type: data.see_all_action_type,
                  target: data.see_all_action_target,
                  title: data.see_all_action_title || undefined,
                }
              : undefined,
        };
        props = imageListProps;
      }

      onSave(data.component_id, props);
    } catch {
      toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const getTitle = () => {
    if (isEditing) {
      return isRTL ? 'تعديل المكون' : 'Edit Component';
    }
    switch (type) {
      case 'dynamic_card':
        return isRTL ? 'إضافة بطاقة ترويجية' : 'Add Promo Card';
      case 'dynamic_banner':
        return isRTL ? 'إضافة بانر ترويجي' : 'Add Promo Banner';
      case 'dynamic_image_list':
        return isRTL ? 'إضافة قائمة صور' : 'Add Image List';
      default:
        return isRTL ? 'تكوين المكون' : 'Configure Component';
    }
  };

  const showImageUpload = type === 'dynamic_card' || type === 'dynamic_banner';
  const showDescription = type === 'dynamic_card' || type === 'dynamic_banner';
  const showAction = type === 'dynamic_card' || type === 'dynamic_banner';
  const showImageList = type === 'dynamic_image_list';
  const showBackgroundColor = type === 'dynamic_card' || type === 'dynamic_banner';

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className={cn("sm:max-w-lg", showImageList && "sm:max-w-2xl")}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>{getTitle()}</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {isRTL
                ? 'قم بتعبئة المعلومات أدناه لتكوين المكون'
                : 'Fill in the information below to configure the component'}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Component ID */}
            <div className="space-y-2">
              <Label htmlFor="component_id">
                {isRTL ? 'معرف المكون' : 'Component ID'} *
              </Label>
              <Input
                id="component_id"
                {...register('component_id', { required: true })}
                placeholder="promo-summer-2024"
                disabled={isEditing}
              />
              <p className="text-xs text-muted-foreground">
                {isRTL
                  ? 'معرف فريد للمكون (بالإنجليزية، بدون مسافات)'
                  : 'Unique identifier (English, no spaces)'}
              </p>
            </div>

            {/* Image Upload (for card/banner) */}
            {showImageUpload && (
              <div className="space-y-2">
                <Label>{isRTL ? 'الصورة' : 'Image'}</Label>
                <ImageUpload
                  value={watchedImageFile}
                  existingUrl={watchedExistingImageUrl || undefined}
                  onChange={(file) => setValue('image_file', file)}
                  onClearExisting={() => setValue('existing_image_url', '')}
                  aspectRatio={type === 'dynamic_banner' ? '16/9' : '1/1'}
                  maxSize={5}
                  placeholder={
                    isRTL
                      ? 'اسحب وأفلت صورة، أو انقر للاختيار'
                      : 'Drag and drop an image, or click to select'
                  }
                />
              </div>
            )}

            {/* Background Color */}
            {showBackgroundColor && (
              <div className="space-y-2">
                <Label>{isRTL ? 'لون الخلفية' : 'Background Color'}</Label>
                <div className="flex gap-2">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('background_color', color)}
                      className={`w-8 h-8 rounded border-2 transition-all ${
                        watchedBackgroundColor === color
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="english">
                  {isRTL ? 'الإنجليزية' : 'English'}
                </TabsTrigger>
                <TabsTrigger value="arabic">
                  {isRTL ? 'العربية' : 'Arabic'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="english" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title_en">
                    {isRTL ? 'العنوان (EN)' : 'Title (EN)'} *
                  </Label>
                  <Input
                    id="title_en"
                    {...register('title_en', { required: true })}
                    placeholder="Summer Special"
                  />
                </div>

                {showDescription && (
                  <div className="space-y-2">
                    <Label htmlFor="description_en">
                      {isRTL ? 'الوصف (EN)' : 'Description (EN)'}
                    </Label>
                    <Textarea
                      id="description_en"
                      {...register('description_en')}
                      placeholder="Get 20% off all classes this summer"
                      rows={3}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="arabic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title_ar">
                    {isRTL ? 'العنوان (AR)' : 'Title (AR)'} *
                  </Label>
                  <Input
                    id="title_ar"
                    {...register('title_ar', { required: true })}
                    placeholder="عرض الصيف"
                    dir="rtl"
                  />
                </div>

                {showDescription && (
                  <div className="space-y-2">
                    <Label htmlFor="description_ar">
                      {isRTL ? 'الوصف (AR)' : 'Description (AR)'}
                    </Label>
                    <Textarea
                      id="description_ar"
                      {...register('description_ar')}
                      placeholder="احصل على خصم 20% على جميع الحصص هذا الصيف"
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Action (for card/banner) */}
            {showAction && (
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium">
                  {isRTL ? 'الإجراء' : 'Action'}
                </h4>

                <div className="space-y-2">
                  <Label>{isRTL ? 'نوع الإجراء' : 'Action Type'}</Label>
                  <Select
                    value={watchedActionType}
                    onValueChange={(value) =>
                      setValue('action_type', value as FormData['action_type'])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {isRTL ? 'بدون إجراء' : 'No action'}
                      </SelectItem>
                      <SelectItem value="deep_link">
                        {isRTL ? 'رابط داخلي' : 'Deep link'}
                      </SelectItem>
                      <SelectItem value="external_url">
                        {isRTL ? 'رابط خارجي' : 'External URL'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {watchedActionType !== 'none' && (
                  <div className="space-y-2">
                    <Label htmlFor="action_target">
                      {watchedActionType === 'deep_link'
                        ? isRTL
                          ? 'المسار الداخلي'
                          : 'Deep Link Path'
                        : isRTL
                          ? 'الرابط الخارجي'
                          : 'External URL'}
                    </Label>
                    <Input
                      id="action_target"
                      {...register('action_target')}
                      placeholder={
                        watchedActionType === 'deep_link'
                          ? '/classes/pilates'
                          : 'https://example.com'
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {/* Image List Settings (for dynamic_image_list) */}
            {showImageList && (
              <>
                {/* Display Settings */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-medium">
                    {isRTL ? 'إعدادات العرض' : 'Display Settings'}
                  </h4>

                  {/* Show Labels Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{isRTL ? 'إظهار التسميات' : 'Show Labels'}</Label>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? 'عرض نص التسمية أسفل كل صورة' : 'Display label text below each image'}
                      </p>
                    </div>
                    <Switch
                      checked={watchedShowLabels}
                      onCheckedChange={(checked) => setValue('show_labels', checked)}
                    />
                  </div>

                  {/* Layout Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'عرض العنصر' : 'Item Width'}</Label>
                      <Input
                        type="number"
                        {...register('layout_item_width', { valueAsNumber: true })}
                        min={50}
                        max={300}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'ارتفاع العنصر' : 'Item Height'}</Label>
                      <Input
                        type="number"
                        {...register('layout_item_height', { valueAsNumber: true })}
                        min={50}
                        max={300}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'التباعد' : 'Spacing'}</Label>
                      <Input
                        type="number"
                        {...register('layout_spacing', { valueAsNumber: true })}
                        min={0}
                        max={50}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'انحناء الزوايا' : 'Border Radius'}</Label>
                      <Input
                        type="number"
                        {...register('layout_border_radius', { valueAsNumber: true })}
                        min={0}
                        max={50}
                      />
                    </div>
                  </div>
                </div>

                {/* See All Action */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-medium">
                    {isRTL ? 'رابط "عرض الكل"' : '"See All" Link'}
                  </h4>

                  <div className="space-y-2">
                    <Label>{isRTL ? 'نوع الإجراء' : 'Action Type'}</Label>
                    <Select
                      value={watchedSeeAllActionType}
                      onValueChange={(value) =>
                        setValue('see_all_action_type', value as FormData['see_all_action_type'])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          {isRTL ? 'بدون رابط' : 'No link'}
                        </SelectItem>
                        <SelectItem value="screen">
                          {isRTL ? 'شاشة' : 'Screen'}
                        </SelectItem>
                        <SelectItem value="deep_link">
                          {isRTL ? 'رابط داخلي' : 'Deep link'}
                        </SelectItem>
                        <SelectItem value="external_url">
                          {isRTL ? 'رابط خارجي' : 'External URL'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {watchedSeeAllActionType !== 'none' && (
                    <>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'المسار' : 'Target Path'}</Label>
                        <Input
                          {...register('see_all_action_target')}
                          placeholder={
                            watchedSeeAllActionType === 'external_url'
                              ? 'https://example.com'
                              : '/studios'
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'عنوان الشاشة' : 'Screen Title'}</Label>
                        <Input
                          {...register('see_all_action_title')}
                          placeholder={isRTL ? 'جميع الاستوديوهات' : 'All Studios'}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Images Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      {isRTL ? 'الصور' : 'Images'}
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addImageItem}
                    >
                      <Plus className="h-4 w-4 me-1" />
                      {isRTL ? 'إضافة صورة' : 'Add Image'}
                    </Button>
                  </div>

                  {imageListItems.length === 0 ? (
                    <div className="text-center py-6 border rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        {isRTL
                          ? 'لم تتم إضافة صور بعد. انقر على "إضافة صورة" للبدء.'
                          : 'No images added yet. Click "Add Image" to start.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {imageListItems.map((item, index) => (
                        <ImageListItemEditor
                          key={item.id}
                          item={item}
                          index={index}
                          isRTL={isRTL}
                          onUpdate={(updates) => updateImageItem(item.id, updates)}
                          onRemove={() => removeImageItem(item.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <ResponsiveDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              {isEditing
                ? isRTL
                  ? 'حفظ التغييرات'
                  : 'Save Changes'
                : isRTL
                  ? 'إضافة'
                  : 'Add'}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

// Separate component for image list item editing
interface ImageListItemEditorProps {
  item: ImageListItemLocal;
  index: number;
  isRTL: boolean;
  onUpdate: (updates: Partial<ImageListItemLocal>) => void;
  onRemove: () => void;
}

function ImageListItemEditor({
  item,
  index,
  isRTL,
  onUpdate,
  onRemove,
}: ImageListItemEditorProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {isRTL ? `صورة ${index + 1}` : `Image ${index + 1}`}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>{isRTL ? 'الصورة' : 'Image'} *</Label>
          <ImageUpload
            value={item.imageFile}
            existingUrl={item.existingUrl || undefined}
            onChange={(file) => onUpdate({ imageFile: file })}
            onClearExisting={() => onUpdate({ existingUrl: '' })}
            aspectRatio="1/1"
            maxSize={5}
            placeholder={
              isRTL
                ? 'اختر صورة'
                : 'Select image'
            }
          />
        </div>

        {/* Labels */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{isRTL ? 'التسمية (EN)' : 'Label (EN)'}</Label>
            <Input
              value={item.label_en}
              onChange={(e) => onUpdate({ label_en: e.target.value })}
              placeholder="Pilates"
            />
          </div>
          <div className="space-y-2">
            <Label>{isRTL ? 'التسمية (AR)' : 'Label (AR)'}</Label>
            <Input
              value={item.label_ar}
              onChange={(e) => onUpdate({ label_ar: e.target.value })}
              placeholder="بيلاتس"
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="space-y-2">
        <Label>{isRTL ? 'الإجراء عند النقر' : 'Action on Click'}</Label>
        <div className="space-y-2">
          <Select
            value={item.action_type}
            onValueChange={(value) =>
              onUpdate({ action_type: value as ImageListItemLocal['action_type'] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                {isRTL ? 'بدون إجراء' : 'No action'}
              </SelectItem>
              <SelectItem value="screen">
                {isRTL ? 'شاشة' : 'Screen'}
              </SelectItem>
              <SelectItem value="deep_link">
                {isRTL ? 'رابط داخلي' : 'Deep link'}
              </SelectItem>
              <SelectItem value="external_url">
                {isRTL ? 'رابط خارجي' : 'External URL'}
              </SelectItem>
            </SelectContent>
          </Select>
          {item.action_type !== 'none' && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                value={item.action_target}
                onChange={(e) => onUpdate({ action_target: e.target.value })}
                placeholder={
                  item.action_type === 'external_url'
                    ? 'https://example.com'
                    : '/studio/123'
                }
              />
              {(item.action_type === 'screen') && (
                <Input
                  value={item.action_title}
                  onChange={(e) => onUpdate({ action_title: e.target.value })}
                  placeholder={isRTL ? 'عنوان الشاشة' : 'Screen Title'}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
