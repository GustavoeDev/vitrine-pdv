import { z } from 'zod';

import type { ApiStore } from '@/src/types/store';

import { api } from './api';
import { uploadMedia } from './media';

const addressSchema = z.object({
  id: z.string().uuid(),
  street: z.string(),
  number: z.string(),
  complement: z.string().nullable(),
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

const merchantStoreSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
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

export type ApiMerchantStore = z.infer<typeof merchantStoreSchema>;

export interface UpdateMerchantStoreInput {
  category_id?: string;
  name?: string;
  description?: string;
  subcategory?: string;
  phone_number?: string;
  cover_photo_url?: string | null;
  logo_url?: string | null;
  address?: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zipcode: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  business_hours?: Array<{
    weekday: string;
    opens_at: string;
    closes_at: string;
  }>;
}

async function resolveStoreImageUrl(
  uri: string | null | undefined,
): Promise<string | null | undefined> {
  if (uri === undefined) {
    return undefined;
  }

  if (!uri) {
    return null;
  }

  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }

  return uploadMedia(uri, 'stores');
}

export async function fetchMerchantStore(storeId: string): Promise<ApiMerchantStore> {
  const { data } = await api.get(`/merchant/stores/${storeId}/`);
  return merchantStoreSchema.parse(data);
}

export async function updateMerchantStore(
  storeId: string,
  input: UpdateMerchantStoreInput,
): Promise<ApiMerchantStore> {
  const [cover_photo_url, logo_url] = await Promise.all([
    resolveStoreImageUrl(input.cover_photo_url),
    resolveStoreImageUrl(input.logo_url),
  ]);

  const { data } = await api.patch(`/merchant/stores/${storeId}/`, {
    ...input,
    ...(cover_photo_url !== undefined ? { cover_photo_url } : {}),
    ...(logo_url !== undefined ? { logo_url } : {}),
  });

  return merchantStoreSchema.parse(data);
}
