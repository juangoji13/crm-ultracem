import { supabase } from './supabase';

export const COMPROBANTES_BUCKET = 'comprobantes';

/**
 * Converts a File or Blob into a base64 Data URL (useful for local preview and offline fallback)
 */
export function readFileAsDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to data URL'));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes into human readable format (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Validates receipt file format and max size (up to 10MB)
 */
export function validateReceiptFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'application/pdf',
  ];
  const isAllowedType = allowedTypes.includes(file.type) || file.type.startsWith('image/');

  if (!isAllowedType) {
    return {
      valid: false,
      error: 'Formato no soportado. Debe ser imagen (JPG, PNG, WebP) o documento PDF.',
    };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'El archivo excede el tamaño máximo permitido de 10 MB.',
    };
  }

  return { valid: true };
}

/**
 * Uploads receipt file to Supabase Storage bucket 'comprobantes'.
 * Returns the public URL if successful.
 * If offline, network fails, or bucket returns error, falls back to local Data URL
 * to avoid blocking field sales workflows.
 */
export async function uploadReceiptFile(
  file: File
): Promise<{ url: string | null; error: any }> {
  try {
    // 1. Generate unique file name
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `receipt_${timestamp}_${randomSuffix}_${cleanFileName}`;

    // 2. Attempt Supabase upload
    const { data: _data, error } = await supabase.storage
      .from(COMPROBANTES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn(
        '[Storage] Supabase upload failed, activating local Data URL fallback:',
        error.message
      );
      const dataUrl = await readFileAsDataURL(file);
      return { url: dataUrl, error: null };
    }

    // 3. Obtain public URL
    const { data: publicUrlData } = supabase.storage
      .from(COMPROBANTES_BUCKET)
      .getPublicUrl(filePath);

    if (publicUrlData && publicUrlData.publicUrl) {
      return { url: publicUrlData.publicUrl, error: null };
    }

    // Fallback if publicUrlData was empty
    const dataUrl = await readFileAsDataURL(file);
    return { url: dataUrl, error: null };
  } catch (err) {
    console.warn(
      '[Storage] Exception during receipt upload, activating offline Data URL fallback:',
      err
    );
    try {
      const dataUrl = await readFileAsDataURL(file);
      return { url: dataUrl, error: null };
    } catch (readErr) {
      console.error('[Storage] Even FileReader failed:', readErr);
      return { url: null, error: err };
    }
  }
}
