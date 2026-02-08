import { createClient } from '@supabase/supabase-js';
import { compressImageToBlob } from '@/lib/imageUtils';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env missing: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env.local for image uploads.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/** Bucket for product images (create it in Supabase Dashboard and set to public). */
export const PRODUCT_IMAGES_BUCKET = 'product-images';

/**
 * Compress the image and upload to Supabase Storage; returns the public URL.
 * Returns null if Supabase is not configured or upload fails.
 */
export async function uploadProductImage(file: File): Promise<string | null> {
  if (!supabase) return null;
  let blob: Blob;
  try {
    blob = await compressImageToBlob(file);
  } catch (e) {
    console.error('Image compress failed:', e);
    return null;
  }
  const path = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) {
    console.error('Supabase upload error:', error);
    return null;
  }
  const { data: urlData } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(path);
  return urlData?.publicUrl ?? null;
}
