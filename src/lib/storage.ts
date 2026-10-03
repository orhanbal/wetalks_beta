import { AUTH_API_DOMAIN } from './auth';

export async function uploadAvatar(blob: Blob): Promise<{ publicUrl: string }> {
  const response = await fetch(`${AUTH_API_DOMAIN}/storage/avatars`, {
    method: 'POST',
    headers: {
      'Content-Type': blob.type || 'image/webp',
    },
    body: blob,
  });
  if (!response.ok) {
    throw new Error('AVATAR_UPLOAD_FAILED');
  }
  const payload = await response.json();
  return { publicUrl: String(payload.publicUrl || '') };
}

export async function deleteAvatar(): Promise<void> {
  const response = await fetch(`${AUTH_API_DOMAIN}/storage/avatars`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 404) {
    throw new Error('AVATAR_DELETE_FAILED');
  }
}
