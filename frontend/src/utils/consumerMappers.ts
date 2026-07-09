import {
  DEFAULT_PRODUCT_IMAGE,
  DEFAULT_STORE_AVATAR,
  DEFAULT_STORE_COVER,
} from '@/src/constants/images';
import type { ApiProductDetail, ApiPublicStore } from '@/src/services/consumerStores';
import { Product, Store } from '@/src/types';
import type { MapStore } from '@/src/types/map';
import { formatDistanceKm } from '@/src/utils/geo';

export function formatProductPrice(price: string | number): string {
  const numeric = typeof price === 'string' ? Number.parseFloat(price) : price;

  if (Number.isNaN(numeric)) {
    return String(price);
  }

  return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
    rating: 4.5,
    reviews: 0,
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

export function mapApiProductToProduct(apiProduct: ApiProductDetail): Product {
  return {
    id: apiProduct.id,
    storeId: apiProduct.store_id,
    name: apiProduct.name,
    category: apiProduct.category_name,
    description: apiProduct.description ?? '',
    price: formatProductPrice(apiProduct.price),
    imageUrl: apiProduct.photo_url ?? DEFAULT_PRODUCT_IMAGE,
  };
}
