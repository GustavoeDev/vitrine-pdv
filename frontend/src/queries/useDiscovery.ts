import { useQuery } from '@tanstack/react-query';

import {
  fetchProduct,
  fetchPublicStore,
  fetchPublicStores,
  fetchStoreProducts,
  type PublicStoreFilters,
} from '@/src/services/consumerStores';
import { normalizeRouteParam } from '@/src/utils/routeParams';
import { searchCatalog } from '@/src/services/search';

export const discoveryKeys = {
  stores: (filters: PublicStoreFilters) => ['discovery', 'stores', filters] as const,
  store: (id: string) => ['discovery', 'store', id] as const,
  storeProducts: (storeId: string) => ['discovery', 'store-products', storeId] as const,
  product: (id: string) => ['discovery', 'product', id] as const,
  search: (query: string) => ['discovery', 'search', query] as const,
  allStoreProducts: ['discovery', 'store-products'] as const,
};

export function usePublicStores(filters: PublicStoreFilters = {}) {
  return useQuery({
    queryKey: discoveryKeys.stores(filters),
    queryFn: () => fetchPublicStores(filters),
    staleTime: 60_000,
  });
}

export function usePublicStore(storeId?: string | string[]) {
  const normalizedId = normalizeRouteParam(storeId);

  return useQuery({
    queryKey: discoveryKeys.store(normalizedId ?? 'unknown'),
    queryFn: () => fetchPublicStore(normalizedId!),
    enabled: Boolean(normalizedId),
    staleTime: 60_000,
  });
}

export function useStoreProducts(storeId?: string | string[]) {
  const normalizedId = normalizeRouteParam(storeId);

  return useQuery({
    queryKey: discoveryKeys.storeProducts(normalizedId ?? 'unknown'),
    queryFn: () => fetchStoreProducts(normalizedId!),
    enabled: Boolean(normalizedId),
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useProduct(productId?: string | string[]) {
  const normalizedId = normalizeRouteParam(productId);

  return useQuery({
    queryKey: discoveryKeys.product(normalizedId ?? 'unknown'),
    queryFn: () => fetchProduct(normalizedId!),
    enabled: Boolean(normalizedId),
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
