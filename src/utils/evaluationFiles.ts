// Upload / signed-URL helpers for evaluation attachments.
// Object path layout: <userId>/<evaluationId>/<category>/<timestamp>-<sanitized-name>

import { supabase } from './supabase';

export type EvaluationFileCategory = 'lesson-plan' | 'notes';

export interface UploadedFile {
  path: string;
  name: string;
}

/** Removes path separators and characters that Supabase Storage disallows from a filename. */
function sanitizeFileName(name: string): string {
  return name.replace(/[^\w.\-]+/g, '_').slice(0, 120);
}

/** Uploads a file to the evaluation-files bucket and returns its storage path + original name. */
export async function uploadEvaluationFile(
  userId: string,
  evaluationId: string,
  category: EvaluationFileCategory,
  file: File
): Promise<UploadedFile | null> {
  const stamp = Date.now();
  const safeName = sanitizeFileName(file.name);
  const path = `${userId}/${evaluationId}/${category}/${stamp}-${safeName}`;

  const { error } = await supabase.storage
    .from('evaluation-files')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    });

  if (error) {
    console.error(`Upload failed for ${category}:`, error.message);
    return null;
  }

  return { path, name: file.name };
}

/** Creates a short-lived signed URL so the user can download their attachment. */
export async function getEvaluationFileSignedUrl(
  path: string,
  expiresInSeconds = 60 * 10
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('evaluation-files')
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    console.error('Signed URL failed:', error?.message);
    return null;
  }

  return data.signedUrl;
}

/** Best-effort removal — used when a user replaces an attachment with a different file. */
export async function deleteEvaluationFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from('evaluation-files').remove([path]);
  if (error) {
    console.error('Delete failed:', error.message);
  }
}
