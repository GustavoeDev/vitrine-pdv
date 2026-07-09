import { z } from 'zod';

import { api } from './api';

const favoriteStoreSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.string(),
  category_id: z.string().uuid(),
  category_name: z.string(),
  subcategory: z.string(),
  logo_url: z.string().nullable(),
  cover_photo_url: z.string().nullable(),
  has_active_promotion: z.boolean(),
  favorited_at: z.string(),
});

export type ApiFavoriteStore = z.infer<typeof favoriteStoreSchema>;

export async function fetchFavorites(): Promise<ApiFavoriteStore[]> {
  const { data } = await api.get('/favorites/');
  return z.array(favoriteStoreSchema).parse(data);
}

export async function addFavorite(storeId: string): Promise<ApiFavoriteStore> {
  const { data } = await api.post('/favorites/', { store_id: storeId });
  return favoriteStoreSchema.parse(data);
}

export async function removeFavorite(storeId: string): Promise<void> {
  await api.delete(`/favorites/${storeId}/`);
}
