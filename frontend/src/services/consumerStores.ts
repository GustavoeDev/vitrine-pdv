import { z } from 'zod';

import { api } from './api';

const publicStoreSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.string(),
  category_id: z.string().uuid(),
  category_name: z.string(),
  subcategory: z.string(),
  logo_url: z.string().nullable(),
  cover_photo_url: z.string().nullable(),
  address_summary: z.string(),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  distance_km: z.number().nullable().optional(),
});

const storeDetailSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  subcategory: z.string(),
  phone_number: z.string(),
  cover_photo_url: z.string().nullable(),
  logo_url: z.string().nullable(),
  status: z.string(),
  category_id: z.string().uuid(),
  category_name: z.string(),
  address: z.object({
    id: z.string().uuid(),
    street: z.string(),
    number: z.string(),
    complement: z.string().nullable(),
    district: z.string(),
    city: z.string(),
    state: z.string(),
    zipcode: z.string(),
    latitude: z.string().nullable(),
    longitude: z.string().nullable(),
  }),
  business_hours: z.array(
    z.object({
      id: z.string().uuid(),
      weekday: z.string(),
      opens_at: z.string(),
      closes_at: z.string(),
    }),
  ),
  created_at: z.string(),
});

const productSummarySchema = z.object({
  id: z.string().uuid(),
  store_id: z.string().uuid(),
  store_name: z.string(),
  name: z.string(),
  price: z.string(),
  photo_url: z.string().nullable(),
});

const productDetailSchema = z.object({
  id: z.string().uuid(),
  store_id: z.string().uuid(),
  store_name: z.string(),
  category_name: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.string(),
  photo_url: z.string().nullable(),
  created_at: z.string(),
});

export type ApiPublicStore = z.infer<typeof publicStoreSchema>;
export type ApiStoreDetail = z.infer<typeof storeDetailSchema>;
export type ApiProductSummary = z.infer<typeof productSummarySchema>;
export type ApiProductDetail = z.infer<typeof productDetailSchema>;

export interface PublicStoreFilters {
  categoryId?: string;
  subcategory?: string;
  limit?: number;
  withLocation?: boolean;
  lat?: number;
  lng?: number;
}

export async function fetchPublicStores(
  filters: PublicStoreFilters = {},
): Promise<ApiPublicStore[]> {
  const { data } = await api.get('/stores/list/', {
    params: {
      ...(filters.categoryId ? { category_id: filters.categoryId } : {}),
      ...(filters.subcategory ? { subcategory: filters.subcategory } : {}),
      ...(filters.limit ? { limit: filters.limit } : {}),
      ...(filters.withLocation ? { with_location: 'true' } : {}),
      ...(filters.lat != null ? { lat: filters.lat } : {}),
      ...(filters.lng != null ? { lng: filters.lng } : {}),
    },
  });

  return z.array(publicStoreSchema).parse(data);
}

export async function fetchPublicStore(storeId: string): Promise<ApiStoreDetail> {
  const { data } = await api.get(`/stores/${storeId}/`);
  return storeDetailSchema.parse(data);
}

export async function fetchStoreProducts(storeId: string): Promise<ApiProductSummary[]> {
  const { data } = await api.get(`/stores/${storeId}/products/`);
  return z.array(productSummarySchema).parse(data);
}

export async function fetchProduct(productId: string): Promise<ApiProductDetail> {
  const { data } = await api.get(`/products/${productId}/`);
  return productDetailSchema.parse(data);
}
