import { z } from 'zod';

import { api } from './api';

const uploadResponseSchema = z.object({
  url: z.string().url(),
});

export type MediaFolder = 'avatars' | 'stores' | 'products' | 'promotions';

function guessMimeType(uri: string): string {
  const extension = uri.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}

export async function uploadMedia(fileUri: string, folder: MediaFolder): Promise<string> {
  const filename = fileUri.split('/').pop() ?? 'photo.jpg';
  const formData = new FormData();

  formData.append('file', {
    uri: fileUri,
    name: filename,
    type: guessMimeType(fileUri),
  } as unknown as Blob);
  formData.append('folder', folder);

  const { data } = await api.post('/media/uploads/', formData);
  return uploadResponseSchema.parse(data).url;
}
