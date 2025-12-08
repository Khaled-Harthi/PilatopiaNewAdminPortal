/**
 * Media upload types
 */

export type MediaFolder = 'banners' | 'home-layouts' | 'general';

export interface MediaUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface MediaUploadOptions {
  file: File;
  folder: MediaFolder;
}
