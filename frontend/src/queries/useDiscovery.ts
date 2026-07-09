import { useQuery } from '@tanstack/react-query';

import {
  fetchProduct,
  fetchPublicStore,
  fetchPublicStores,
  fetchStoreProducts,
  type PublicStoreFilters,
} from '@/src/services/consumerStores';
import { searchCatalog } from '@/src/services/search';

export const discoveryKeys = {
  stores: (filters: PublicStoreFilters) => ['discovery', 'stores', filters] as const,
  store: (id: string) => ['discovery', 'store', id] as const,
  storeProducts: (storeId: string) => ['discovery', 'store-products', storeId] as const,
  product: (id: string) => ['discovery', 'product', id] as const,
  search: (query: string) => ['discovery', 'search', query] as const,
};

export function usePublicStores(filters: PublicStoreFilters = {}) {
  return useQuery({
    queryKey: discoveryKeys.stores(filters),
    queryFn: () => fetchPublicStores(filters),
    staleTime: 60_000,
  });
}

export function usePublicStore(storeId?: string) {
  return useQuery({
    queryKey: discoveryKeys.store(storeId ?? 'unknown'),
    queryFn: () => fetchPublicStore(storeId!),
    enabled: Boolean(storeId),
    staleTime: 60_000,
  });
}

export function useStoreProducts(storeId?: string) {
  return useQuery({
    queryKey: discoveryKeys.storeProducts(storeId ?? 'unknown'),
    queryFn: () => fetchStoreProducts(storeId!),
    enabled: Boolean(storeId),
    staleTime: 60_000,
  });
}

export function useProduct(productId?: string) {
  return useQuery({
    queryKey: discoveryKeys.product(productId ?? 'unknown'),
    queryFn: () => fetchProduct(productId!),
    enabled: Boolean(productId),
    staleTime: 60_000,
  });
}

export function useSearch(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: discoveryKeys.search(trimmed),
    queryFn: () => searchCatalog(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 30_000,
  });
}

export function useMapStores(location?: { latitude: number; longitude: number } | null) {
  const filters: PublicStoreFilters = {
    withLocation: true,
    ...(location
      ? {
          lat: location.latitude,
          lng: location.longitude,
        }
      : {}),
  };

  return useQuery({
    queryKey: discoveryKeys.stores(filters),
    queryFn: () => fetchPublicStores(filters),
    enabled: Boolean(location),
    staleTime: 60_000,
  });
}
