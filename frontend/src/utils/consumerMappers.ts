import {
  DEFAULT_PRODUCT_IMAGE,
  DEFAULT_STORE_AVATAR,
  DEFAULT_STORE_COVER,
} from '@/src/constants/images';
import type {
  ApiProductDetail,
  ApiProductSummary,
  ApiPublicStore,
  ApiStoreDetail,
} from '@/src/services/consumerStores';
import { Product, ProductDiscountRecord, Store } from '@/src/types';
import type { MapStore } from '@/src/types/map';
import { formatDistanceKm } from '@/src/utils/geo';

function parseAverageRating(value: string | number | null | undefined): number {
  if (value == null) {
    return 0;
  }

  const numeric = typeof value === 'string' ? Number.parseFloat(value) : value;
  return Number.isNaN(numeric) ? 0 : numeric;
}

function resolveStoreRatingStats(apiStore: {
  average_rating?: string | number | null;
  reviews_count?: number;
}) {
  return {
    rating: parseAverageRating(apiStore.average_rating),
    reviews: apiStore.reviews_count ?? 0,
  };
}

export function formatProductPrice(price: string | number): string {
  const numeric = typeof price === 'string' ? Number.parseFloat(price) : price;

  if (Number.isNaN(numeric)) {
    return String(price);
  }

  return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function mapActiveDiscount(
  discount: NonNullable<ApiProductSummary['active_discount']>,
): ProductDiscountRecord {
  return {
    id: discount.id,
    product_id: discount.product_id,
    original_price: Number.parseFloat(discount.original_price),
    discounted_price: Number.parseFloat(discount.discounted_price),
    start_date: discount.start_date,
    end_date: discount.end_date,
    is_active: discount.is_active,
  };
}

function resolveProductDisplayPrice(
  price: string,
  activeDiscount: ProductDiscountRecord | null | undefined,
): string {
  if (activeDiscount?.is_active) {
    return formatProductPrice(activeDiscount.discounted_price);
  }

  return formatProductPrice(price);
}

export function mapApiPublicStoreToStore(apiStore: ApiPublicStore): Store {
  const distance =
    apiStore.distance_km != null ? formatDistanceKm(apiStore.distance_km) : apiStore.address_summary;

  return {
    id: apiStore.id,
    name: apiStore.name,
    category: apiStore.category_name,
    subcategory: apiStore.subcategory || apiStore.category_name,
    distance,
    ...resolveStoreRatingStats(apiStore),
    coverImageUrl: apiStore.cover_photo_url ?? DEFAULT_STORE_COVER,
    avatarUrl: apiStore.logo_url ?? apiStore.cover_photo_url ?? DEFAULT_STORE_AVATAR,
  };
}

export function mapApiStoreDetailToStore(apiStore: ApiStoreDetail): Store {
  return {
    id: apiStore.id,
    name: apiStore.name,
    category: apiStore.category_name,
    subcategory: apiStore.subcategory || apiStore.category_name,
    distance: `${apiStore.address.city}, ${apiStore.address.state}`,
    ...resolveStoreRatingStats(apiStore),
    coverImageUrl: apiStore.cover_photo_url ?? DEFAULT_STORE_COVER,
    avatarUrl: apiStore.logo_url ?? apiStore.cover_photo_url ?? DEFAULT_STORE_AVATAR,
  };
}

export function mapApiPublicStoreToMapStore(apiStore: ApiPublicStore): MapStore | null {
  if (!apiStore.latitude || !apiStore.longitude) {
    return null;
  }

  const store = mapApiPublicStoreToStore(apiStore);

  return {
    ...store,
    latitude: Number(apiStore.latitude),
    longitude: Number(apiStore.longitude),
    distanceKm: apiStore.distance_km ?? null,
  };
}

export function mapApiProductSummaryToProduct(apiProduct: ApiProductSummary): Product {
  const active_discount = apiProduct.active_discount
    ? mapActiveDiscount(apiProduct.active_discount)
    : null;

  return {
    id: apiProduct.id,
    storeId: apiProduct.store_id,
    name: apiProduct.name,
    category: '',
    description: '',
    price: resolveProductDisplayPrice(apiProduct.price, active_discount),
    imageUrl: apiProduct.photo_url ?? DEFAULT_PRODUCT_IMAGE,
    active_discount,
  };
}

export function mapApiProductToProduct(apiProduct: ApiProductDetail): Product {
  const active_discount = apiProduct.active_discount
    ? mapActiveDiscount(apiProduct.active_discount)
    : null;

  return {
    id: apiProduct.id,
    storeId: apiProduct.store_id,
    name: apiProduct.name,
    category: apiProduct.category_name,
    description: apiProduct.description ?? '',
    price: resolveProductDisplayPrice(apiProduct.price, active_discount),
    imageUrl: apiProduct.photo_url ?? DEFAULT_PRODUCT_IMAGE,
    active_discount,
  };
}
