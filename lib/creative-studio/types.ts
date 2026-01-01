/**
 * Creative Studio Types
 */

// Canvas types
export type ApprovalStatus = 'liked' | 'disliked' | null;
export type StylePreset = 'natural' | 'studio' | 'golden_hour' | 'dramatic';

export interface Canvas {
  id: number;
  name: string;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CanvasNode {
  id: number;
  canvasId: number;
  positionX: number;
  positionY: number;
  width: number; // Default: 240
  approvalStatus: ApprovalStatus;
  versionLabel: string; // e.g., "v1", "v2.1", "v2.1.1"
  generation: Generation;
}

export interface CanvasCreatePayload {
  name?: string;
}

export interface CanvasUpdatePayload {
  name?: string;
  positionUpdates?: Array<{
    generationId: number;
    positionX: number;
    positionY: number;
  }>;
}

// Style preset mappings
export const STYLE_PRESET_CONFIG: Record<StylePreset, Partial<StyleOptions>> = {
  natural: {
    lighting: 'natural',
    colorMood: 'earthy',
    desaturation: 'subtle',
  },
  studio: {
    lighting: 'diffused',
    colorMood: 'muted',
    desaturation: 'moderate',
  },
  golden_hour: {
    lighting: 'golden_hour',
    colorMood: 'warm',
    desaturation: 'subtle',
  },
  dramatic: {
    lighting: 'soft_dawn',
    colorMood: 'muted',
    desaturation: 'strong',
  },
};

export type GenerationMode = 'style_image' | 'generate_new' | 'quick_comment';
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type Resolution = '1K' | '2K' | '4K';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type WallColor = 'warm_cream' | 'beige' | 'taupe' | 'keep_original';
export type ColorMood = 'earthy' | 'warm' | 'muted';
export type Lighting = 'soft_dawn' | 'golden_hour' | 'natural' | 'diffused';
export type Desaturation = 'subtle' | 'moderate' | 'strong';
export type Gender = 'female' | 'male';
export type Pose = 'reformer' | 'chair' | 'barrel' | 'standing' | 'stretching';
export type TopStyle = 'tank' | 'long_sleeve' | 'sports_bra';
export type ClothingColor = 'brand_primary' | 'cream' | 'sage' | 'oatmeal' | 'charcoal';
export type Equipment = 'reformer' | 'chair' | 'barrel';
export type WindowStyle = 'large' | 'small' | 'none';

export interface StyleOptions {
  wallColor: WallColor;
  colorMood: ColorMood;
  lighting: Lighting;
  desaturation: Desaturation;
}

export interface ModelOptions {
  gender: Gender;
  pose: Pose;
  poseDetail?: string;
}

export interface ClothingOptions {
  topStyle: TopStyle;
  topColor: ClothingColor;
  leggings: ClothingColor;
}

export interface SceneOptions {
  equipment: Equipment[];
  windowStyle: WindowStyle;
}

export interface PromptConfig {
  mode: GenerationMode;
  imageHasModel: boolean;
  addModel: boolean;
  style: StyleOptions;
  model?: ModelOptions;
  clothing?: ClothingOptions;
  scene?: SceneOptions;
  customInstructions?: string;
}

export interface Generation {
  id: number;
  mode: GenerationMode;
  sourceImageUrl: string | null;
  promptConfig: PromptConfig;
  builtPrompt: string;
  resolution: Resolution;
  status: GenerationStatus;
  queueJobId: string | null;
  resultImageUrl: string | null;
  resultThumbnailUrl: string | null;
  errorMessage: string | null;
  retryCount: number;
  generationTimeMs: number | null;
  geminiModel: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  // Kanban fields
  title: string | null;
  taskStatus: TaskStatus;
  parentGenerationId: number | null;
  versionNumber: number;
  isCurrentVersion: boolean;
  branchedFromGenerationId: number | null;
  reviewComment: string | null;
  columnOrder: number;
}

export interface GenerationStatusResponse {
  id: number;
  status: GenerationStatus;
  errorMessage: string | null;
  resultImageUrl: string | null;
  completedAt: string | null;
}

export interface GenerationListResponse {
  data: Generation[];
  total: number;
  page: number;
  limit: number;
}

export interface GenerationCreatePayload {
  mode: GenerationMode;
  promptConfig: PromptConfig;
  resolution?: Resolution;
  title?: string;
  startImmediately?: boolean;
}

// Kanban grouped response
export interface GroupedGenerations {
  todo: Generation[];
  in_progress: Generation[];
  review: Generation[];
  done: Generation[];
}

export interface GroupedGenerationsResponse {
  data: GroupedGenerations;
  counts: {
    todo: number;
    in_progress: number;
    review: number;
    done: number;
    total: number;
  };
}

// Comments
export type CommentType = 'review' | 'enhancement' | 'note';

export interface GenerationComment {
  id: number;
  generationId: number;
  commentText: string;
  commentType: CommentType;
  triggersRegeneration: boolean;
  resultingGenerationId: number | null;
  createdBy: number;
  createdAt: string;
}

// Version history
export interface VersionHistoryItem {
  id: number;
  versionNumber: number;
  status: GenerationStatus;
  taskStatus: TaskStatus;
  resultImageUrl: string | null;
  resultThumbnailUrl: string | null;
  createdAt: string;
  completedAt: string | null;
  reviewComment: string | null;
}

export interface VersionHistoryResponse {
  current: Generation;
  versions: VersionHistoryItem[];
  branchHistory: BranchHistoryItem[] | null;
}

export interface BranchHistoryItem {
  id: number;
  title: string | null;
  versionNumber: number;
  resultThumbnailUrl: string | null;
}

// Branch info
export interface BranchInfo {
  id: number;
  title: string | null;
  taskStatus: TaskStatus;
  versionNumber: number;
  resultThumbnailUrl: string | null;
  createdAt: string;
}

// Enhancement payload
export interface EnhancePayload {
  comment: string;
  promptConfigOverrides?: Partial<PromptConfig>;
  resolution?: Resolution;
}

// Discard and regenerate payload
export interface DiscardRegeneratePayload {
  promptConfig: PromptConfig;
  resolution?: Resolution;
}

// Branch payload
export interface BranchPayload {
  title?: string;
  startImmediately?: boolean;
}

// Reorder payload
export interface ReorderPayload {
  updates: Array<{
    id: number;
    taskStatus: TaskStatus;
    columnOrder: number;
  }>;
}

// Task status update payload
export interface UpdateTaskStatusPayload {
  taskStatus: TaskStatus;
}

export interface GenerationCreateResponse {
  id: number;
  status: 'pending';
  message: string;
}

// Options for dropdown selects
export const WALL_COLOR_OPTIONS: { value: WallColor; label: string }[] = [
  { value: 'warm_cream', label: 'Warm Cream' },
  { value: 'beige', label: 'Beige' },
  { value: 'taupe', label: 'Taupe' },
  { value: 'keep_original', label: 'Keep Original' },
];

export const COLOR_MOOD_OPTIONS: { value: ColorMood; label: string }[] = [
  { value: 'earthy', label: 'Earthy' },
  { value: 'warm', label: 'Warm' },
  { value: 'muted', label: 'Muted' },
];

export const LIGHTING_OPTIONS: { value: Lighting; label: string }[] = [
  { value: 'natural', label: 'Natural' },
  { value: 'soft_dawn', label: 'Soft Dawn' },
  { value: 'golden_hour', label: 'Golden Hour' },
  { value: 'diffused', label: 'Diffused' },
];

export const DESATURATION_OPTIONS: { value: Desaturation; label: string }[] = [
  { value: 'subtle', label: 'Subtle' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'strong', label: 'Strong' },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

export const POSE_OPTIONS: { value: Pose; label: string }[] = [
  { value: 'reformer', label: 'Reformer Exercise' },
  { value: 'chair', label: 'Wunda Chair' },
  { value: 'barrel', label: 'Ladder Barrel' },
  { value: 'standing', label: 'Standing' },
  { value: 'stretching', label: 'Stretching' },
];

export const TOP_STYLE_OPTIONS: { value: TopStyle; label: string }[] = [
  { value: 'tank', label: 'Tank Top' },
  { value: 'long_sleeve', label: 'Long Sleeve' },
  { value: 'sports_bra', label: 'Sports Bra' },
];

export const CLOTHING_COLOR_OPTIONS: { value: ClothingColor; label: string }[] = [
  { value: 'brand_primary', label: 'Brand Primary (Camel)' },
  { value: 'cream', label: 'Cream' },
  { value: 'sage', label: 'Sage Green' },
  { value: 'oatmeal', label: 'Oatmeal' },
  { value: 'charcoal', label: 'Charcoal' },
];

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'reformer', label: 'Reformer' },
  { value: 'chair', label: 'Wunda Chair' },
  { value: 'barrel', label: 'Ladder Barrel' },
];

export const WINDOW_STYLE_OPTIONS: { value: WindowStyle; label: string }[] = [
  { value: 'large', label: 'Large Windows' },
  { value: 'small', label: 'Small Windows' },
  { value: 'none', label: 'No Windows' },
];

// Default configuration
export const DEFAULT_PROMPT_CONFIG: PromptConfig = {
  mode: 'style_image',
  imageHasModel: false,
  addModel: false,
  style: {
    wallColor: 'warm_cream',
    colorMood: 'earthy',
    lighting: 'natural',
    desaturation: 'moderate',
  },
  model: {
    gender: 'female',
    pose: 'reformer',
    poseDetail: '',
  },
  clothing: {
    topStyle: 'tank',
    topColor: 'brand_primary',
    leggings: 'cream',
  },
  scene: {
    equipment: ['reformer'],
    windowStyle: 'large',
  },
  customInstructions: '',
};
