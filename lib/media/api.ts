/**
 * Media upload API
 */

import apiClient from '@/lib/axios';
import type { MediaUploadResponse, MediaUploadOptions } from './types';

/**
 * Upload a file to the media storage (S3)
 *
 * @param options - Upload options containing file and folder
 * @returns The uploaded file metadata including URL
 *
 * @example
 * const result = await uploadMedia({
 *   file: imageFile,
 *   folder: 'banners'
 * });
 * console.log(result.url); // https://cdn.pilatopia.studio/media/banners/abc123.jpg
 */
export async function uploadMedia(options: MediaUploadOptions): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append('file', options.file);
  formData.append('folder', options.folder);

  const response = await apiClient.post<{ success: boolean; data: MediaUploadResponse }>(
    '/admin/media/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return response.data.data;
}
