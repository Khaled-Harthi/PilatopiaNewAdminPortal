/**
 * React Query hooks for media upload
 */

import { useMutation } from '@tanstack/react-query';
import { uploadMedia } from './api';
import type { MediaUploadOptions } from './types';

/**
 * Hook for uploading media files
 *
 * @example
 * const uploadMutation = useUploadMedia();
 *
 * const handleUpload = async (file: File) => {
 *   const result = await uploadMutation.mutateAsync({
 *     file,
 *     folder: 'banners'
 *   });
 *   console.log(result.url);
 * };
 */
export function useUploadMedia() {
  return useMutation({
    mutationFn: (options: MediaUploadOptions) => uploadMedia(options),
  });
}
