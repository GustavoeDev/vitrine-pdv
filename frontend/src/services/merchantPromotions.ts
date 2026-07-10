import type {
  MerchantCreatePromotionInput,
  MerchantPromotion,
  MerchantUpdatePromotionInput,
} from '@/src/types/merchant';

import {
  createMerchantPromotion,
  fetchMerchantPromotions,
  updateMerchantPromotion,
  updateMerchantPromotionStatus,
  type ApiMerchantPromotion,
} from './promotions';
import { uploadMedia } from './media';

async function resolveBannerUrl(uri: string | null | undefined): Promise<string | null> {
  if (!uri) {
    return null;
  }

  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }

  return uploadMedia(uri, 'promotions');
}

function mapApiMerchantPromotion(promotion: ApiMerchantPromotion): MerchantPromotion {
  return {
    id: promotion.id,
    store_id: promotion.store_id,
    title: promotion.title,
    description: promotion.description,
    banner_url: promotion.banner_url,
    start_date: promotion.start_date,
    end_date: promotion.end_date,
    notify_favorites: promotion.notify_favorites,
    status: promotion.status,
    promotion_type: promotion.promotion_type,
    product_id: promotion.product_id ?? null,
    original_price: promotion.original_price ? Number.parseFloat(promotion.original_price) : null,
    discounted_price: promotion.discounted_price
      ? Number.parseFloat(promotion.discounted_price)
      : null,
    badge_text: promotion.badge_text ?? null,
  };
}

export async function fetchMerchantPromotionsList(storeId?: string): Promise<MerchantPromotion[]> {
  const promotions = await fetchMerchantPromotions(storeId);
  return promotions.map(mapApiMerchantPromotion);
}

export async function createMerchantPromotionItem(
  input: MerchantCreatePromotionInput,
  storeId?: string,
): Promise<MerchantPromotion> {
  const banner_url =
    input.promotion_type === 'daily' ? await resolveBannerUrl(input.banner_url) : null;

  const promotion = await createMerchantPromotion({
    promotion_type: input.promotion_type,
    title: input.title,
    description: input.description,
    start_date: input.start_date,
    end_date: input.end_date,
    notify_favorites: input.notify_favorites,
    product_id: input.product_id,
    discounted_price: input.discounted_price,
    discount_total: input.discount_total,
    banner_url,
    store_id: storeId,
  });

  return mapApiMerchantPromotion(promotion);
}

export async function updateMerchantPromotionItem(
  promotionId: string,
  input: MerchantUpdatePromotionInput,
): Promise<MerchantPromotion> {
  const banner_url =
    input.banner_url !== undefined ? await resolveBannerUrl(input.banner_url) : undefined;

  const updated = await updateMerchantPromotion(promotionId, {
    ...input,
    ...(banner_url !== undefined ? { banner_url } : {}),
  });
  return mapApiMerchantPromotion(updated);
}

export async function updateMerchantPromotionItemStatus(
  promotion: MerchantPromotion,
  status: MerchantPromotion['status'],
): Promise<MerchantPromotion> {
  const updated = await updateMerchantPromotionStatus(
    promotion.id,
    promotion.promotion_type,
    status,
  );

  return mapApiMerchantPromotion(updated);
}
