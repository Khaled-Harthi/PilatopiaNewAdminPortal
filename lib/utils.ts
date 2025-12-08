import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resizes an image file to a maximum width while maintaining aspect ratio
 * @param file - The image file to resize
 * @param maxWidth - Maximum width in pixels (default: 500)
 * @param quality - JPEG quality 0-1 (default: 0.85)
 * @returns Promise<File> - The resized image file
 */
export async function resizeImage(
  file: File,
  maxWidth: number = 500,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    // If not an image, return original
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // If image is already smaller than maxWidth, return original
      if (img.width <= maxWidth) {
        resolve(file);
        return;
      }

      // Calculate new dimensions maintaining aspect ratio
      const ratio = maxWidth / img.width;
      const newWidth = maxWidth;
      const newHeight = Math.round(img.height * ratio);

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw resized image
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to resize image'));
            return;
          }

          // Create new file with same name
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve(resizedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image from file
    img.src = URL.createObjectURL(file);
  });
}
