import { z } from 'zod';

import { api } from './api';

const consumerPromotionSchema = z.object({
  id: z.string().uuid(),
  promotion_type: z.enum(['daily', 'product-discount']),
  title: z.string(),
  description: z.string(),
  image_url: z.string().nullable(),
  store_id: z.string().uuid(),
  store_name: z.string(),
  store_subtitle: z.string(),
  store_avatar_url: z.string().nullable(),
  valid_until: z.string(),
  product_id: z.string().uuid().nullable().optional(),
  original_price: z.string().nullable().optional(),
  discounted_price: z.string().nullable().optional(),
});

const promotionDetailSchema = consumerPromotionSchema.extend({
  phone_number: z.string().optional(),
});

const merchantPromotionSchema = z.object({
  id: z.string().uuid(),
  promotion_type: z.enum(['daily', 'product-discount']),
  store_id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  banner_url: z.string().nullable(),
  start_date: z.string(),
  end_date: z.string(),
  notify_favorites: z.boolean(),
  status: z.enum(['scheduled', 'active', 'ended']),
  product_id: z.string().uuid().nullable().optional(),
  original_price: z.string().nullable().optional(),
  discounted_price: z.string().nullable().optional(),
  badge_text: z.string().nullable().optional(),
});

export type ApiConsumerPromotion = z.infer<typeof consumerPromotionSchema>;
export type ApiPromotionDetail = z.infer<typeof promotionDetailSchema>;
export type ApiMerchantPromotion = z.infer<typeof merchantPromotionSchema>;

export interface MerchantCreatePromotionPayload {
  promotion_type: 'daily' | 'product-discount';
  title?: string;
  description?: string;
  banner_url?: string | null;
  start_date: string;
  end_date: string;
  notify_favorites?: boolean;
  product_id?: string;
  discounted_price?: number;
  discount_total?: number;
  store_id?: string;
}

export interface MerchantUpdatePromotionPayload {
  promotion_type: 'daily' | 'product-discount';
  title?: string;
  description?: string;
  banner_url?: string | null;
  start_date?: string;
  end_date?: string;
  notify_favorites?: boolean;
  discounted_price?: number;
  discount_total?: number;
}

export async function fetchStoreActivePromotions(
  storeId: string,
): Promise<ApiConsumerPromotion[]> {
  const { data } = await api.get(`/stores/${storeId}/promotions/active/`);
  return z.array(consumerPromotionSchema).parse(data);
}

export async function fetchFeaturedPromotion(): Promise<ApiConsumerPromotion | null> {
  const response = await api.get('/promotions/featured/');

  if (response.status === 204 || response.data == null) {
    return null;
  }

  return consumerPromotionSchema.parse(response.data);
}

export async function fetchFavoritePromotions(): Promise<ApiConsumerPromotion[]> {
  const { data } = await api.get('/promotions/favorites/');
  return z.array(consumerPromotionSchema).parse(data);
}

export async function fetchPromotionDetail(promotionId: string): Promise<ApiPromotionDetail> {
  const { data } = await api.get(`/promotions/${promotionId}/`);
  return promotionDetailSchema.parse(data);
}

export async function fetchMerchantPromotions(storeId?: string): Promise<ApiMerchantPromotion[]> {
  const { data } = await api.get('/merchant/promotions/', {
    params: storeId ? { store_id: storeId } : undefined,
  });
  return z.array(merchantPromotionSchema).parse(data);
}

export async function createMerchantPromotion(
  payload: MerchantCreatePromotionPayload,
): Promise<ApiMerchantPromotion> {
  const { data } = await api.post('/merchant/promotions/', payload);
  return merchantPromotionSchema.parse(data);
}

export async function updateMerchantPromotion(
  promotionId: string,
  payload: MerchantUpdatePromotionPayload,
): Promise<ApiMerchantPromotion> {
  const { data } = await api.patch(`/merchant/promotions/${promotionId}/`, payload);
  return merchantPromotionSchema.parse(data);
}

export async function updateMerchantPromotionStatus(
  promotionId: string,
  promotionType: 'daily' | 'product-discount',
  status: 'scheduled' | 'active' | 'ended',
): Promise<ApiMerchantPromotion> {
  const { data } = await api.patch(`/merchant/promotions/${promotionId}/status/`, {
    promotion_type: promotionType,
    status,
  });
  return merchantPromotionSchema.parse(data);
}
