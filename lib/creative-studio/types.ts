/**
 * Creative Studio Types
 */

export type GenerationMode = 'style_image' | 'generate_new';
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type Resolution = '1K' | '2K' | '4K';

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
}

export interface GenerationStatus {
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
