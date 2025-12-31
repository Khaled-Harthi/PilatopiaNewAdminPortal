import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if a file is a HEIC image
 */
export function isHeicFile(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  );
}

/**
 * Converts a HEIC file to JPEG format using Canvas API
 * This works on browsers that natively support HEIC (Safari, newer Chrome)
 */
async function convertHeicWithCanvas(file: File, quality: number): Promise<File | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const newFileName = file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
            resolve(new File([blob], newFileName, { type: 'image/jpeg', lastModified: Date.now() }));
          } else {
            resolve(null);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

// heic2any converter - loaded lazily via CDN
let heic2anyLoaded = false;
let heic2anyLoadPromise: Promise<void> | null = null;

declare global {
  interface Window {
    heic2any?: (options: { blob: Blob; toType?: string; quality?: number }) => Promise<Blob | Blob[]>;
  }
}

function loadHeic2Any(): Promise<void> {
  if (heic2anyLoaded && window.heic2any) {
    return Promise.resolve();
  }

  if (heic2anyLoadPromise) {
    return heic2anyLoadPromise;
  }

  heic2anyLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
    script.onload = () => {
      heic2anyLoaded = true;
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Failed to load heic2any from CDN'));
    };
    document.head.appendChild(script);
  });

  return heic2anyLoadPromise;
}

/**
 * Converts a HEIC file to JPEG format
 * Uses multiple methods: native browser support first, then heic2any fallback
 * @param file - The HEIC file to convert
 * @param quality - JPEG quality 0-1 (default: 0.92)
 * @returns Promise<File> - The converted JPEG file
 */
export async function convertHeicToJpeg(
  file: File,
  quality: number = 0.92
): Promise<File> {
  if (!isHeicFile(file)) {
    return file;
  }

  // First try native browser conversion (works on Safari and some Chrome versions)
  console.log('Attempting native HEIC conversion...');
  const nativeResult = await convertHeicWithCanvas(file, quality);
  if (nativeResult) {
    console.log('Native HEIC conversion successful');
    return nativeResult;
  }
  console.log('Native conversion failed, trying heic2any...');

  // Fall back to heic2any library
  try {
    await loadHeic2Any();

    if (!window.heic2any) {
      throw new Error('heic2any not available');
    }

    console.log('Converting HEIC file with heic2any:', file.name);
    const blob = await window.heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality,
    });

    const resultBlob = Array.isArray(blob) ? blob[0] : blob;
    const newFileName = file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');

    return new File([resultBlob], newFileName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('HEIC conversion error:', error);

    // Provide a more helpful error message
    const errorMessage = error && typeof error === 'object' && 'message' in error
      ? String((error as { message: unknown }).message)
      : String(error);

    throw new Error(
      `Unable to convert HEIC file. This may be due to an unsupported HEIC variant. ` +
      `Try converting the file to JPEG using your phone's share menu or an online converter. ` +
      `(${errorMessage})`
    );
  }
}

/**
 * Processes an image file - converts HEIC to JPEG if needed
 * @param file - The image file to process
 * @returns Promise<File> - The processed file (converted if HEIC, original otherwise)
 */
export async function processImageFile(file: File): Promise<File> {
  if (isHeicFile(file)) {
    return convertHeicToJpeg(file);
  }
  return file;
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
