/**
 * Home Layout Types
 * TypeScript interfaces for the dynamic home screen layout feature
 */

// ============================================
// Component Types
// ============================================

export type BuiltInComponentType =
  | 'home_header'
  | 'upcoming_classes_carousel'
  | 'membership_card'
  | 'banner_carousel'
  | 'redeem_points_card'
  | 'awards_card'
  | 'info_card_classes'
  | 'info_card_packages';

export type DynamicComponentType =
  | 'dynamic_card'
  | 'dynamic_banner'
  | 'dynamic_image_list';

export type HomeLayoutComponentType = BuiltInComponentType | DynamicComponentType;

export interface ComponentTypeInfo {
  value: HomeLayoutComponentType;
  label: string;
  requires_props: boolean;
  translatable_fields?: string[];
}

export interface ComponentTypesResponse {
  built_in: ComponentTypeInfo[];
  dynamic: ComponentTypeInfo[];
}

// ============================================
// Action Types (for dynamic components)
// ============================================

export type ActionType = 'deep_link' | 'external_url' | 'modal' | 'screen';

export interface ComponentAction {
  type: ActionType;
  target: string;
  title?: string; // For screen/modal actions
}

// ============================================
// Dynamic Component Props
// ============================================

export interface DynamicCardProps {
  title_en: string;
  title_ar: string;
  description_en?: string;
  description_ar?: string;
  subtitle_en?: string;
  subtitle_ar?: string;
  ctaText_en?: string;
  ctaText_ar?: string;
  imageUrl?: string;
  backgroundColor?: string;
  action?: ComponentAction;
}

export interface DynamicBannerProps {
  title_en: string;
  title_ar: string;
  description_en?: string;
  description_ar?: string;
  subtitle_en?: string;
  subtitle_ar?: string;
  ctaText_en?: string;
  ctaText_ar?: string;
  imageUrl?: string;
  backgroundColor?: string;
  action?: ComponentAction;
}

export interface DynamicImageListItem {
  id: string;
  imageUrl: string;
  label_en: string;
  label_ar: string;
  action?: ComponentAction;
}

export interface DynamicImageListProps {
  title_en: string;
  title_ar: string;
  items: DynamicImageListItem[];
  layout?: {
    itemWidth?: number;
    itemHeight?: number;
    borderRadius?: number;
    spacing?: number;
  };
  showLabels?: boolean;
  seeAllAction?: ComponentAction;
}

export type ComponentProps =
  | DynamicCardProps
  | DynamicBannerProps
  | DynamicImageListProps
  | null;

// ============================================
// Layout Component
// ============================================

export interface HomeLayoutComponent {
  id: number;
  component_id: string;
  component_type: HomeLayoutComponentType;
  sort_order: number;
  visible: boolean;
  props: ComponentProps;
  created_at: string;
  updated_at: string;
}

export interface HomeLayoutComponentCreate {
  component_id: string;
  component_type: HomeLayoutComponentType;
  visible?: boolean;
  props?: ComponentProps;
}

export interface HomeLayoutComponentUpdate {
  component_id?: string;
  visible?: boolean;
  props?: ComponentProps;
}

// ============================================
// Layout
// ============================================

export interface HomeLayout {
  id: number;
  name: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  components: HomeLayoutComponent[];
}

export interface HomeLayoutSummary {
  id: number;
  name: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  component_count: number;
}

export interface HomeLayoutCreate {
  name: string;
  is_active?: boolean;
}

export interface HomeLayoutUpdate {
  name?: string;
  is_active?: boolean;
}

// ============================================
// Reorder Payload
// ============================================

export interface ReorderComponentsPayload {
  order: number[]; // Array of component IDs in desired order
}
