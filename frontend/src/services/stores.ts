import { z } from 'zod';

import type { CreateStoreInput, EstablishmentRegistrationData } from '@/src/types/establishment';
import type { ApiStore } from '@/src/types/store';
import { toCreateStoreInput } from '@/src/utils/establishmentRegistration';

import { api } from './api';
import { uploadMedia } from './media';

const addressSchema = z.object({
  id: z.string().uuid(),
  street: z.string(),
  number: z.string(),
  complement: z.string(),
  district: z.string(),
  city: z.string(),
  state: z.string(),
  zipcode: z.string(),
  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
});

const businessHourSchema = z.object({
  id: z.string().uuid(),
  weekday: z.string(),
  opens_at: z.string(),
  closes_at: z.string(),
});

const storeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  subcategory: z.string(),
  phone_number: z.string(),
  cover_photo_url: z.string().nullable(),
  logo_url: z.string().nullable(),
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED']),
  category_id: z.string().uuid(),
  category_name: z.string(),
  address: addressSchema,
  business_hours: z.array(businessHourSchema),
  created_at: z.string(),
});

async function resolveImageUrl(
  uri: string | null | undefined,
  folder: 'stores',
): Promise<string | null> {
  if (!uri) {
    return null;
  }

  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }

  return uploadMedia(uri, folder);
}

export async function createStore(input: CreateStoreInput): Promise<ApiStore> {
  const { data } = await api.post('/stores/', input);
  return storeSchema.parse(data);
}

export async function registerEstablishment(
  data: EstablishmentRegistrationData,
): Promise<ApiStore> {
  const payload = toCreateStoreInput(data);

  const [coverPhotoUrl, logoUrl] = await Promise.all([
    resolveImageUrl(payload.cover_photo_url, 'stores'),
    resolveImageUrl(payload.logo_url, 'stores'),
  ]);

  return createStore({
    ...payload,
    cover_photo_url: coverPhotoUrl,
    logo_url: logoUrl,
  });
}
