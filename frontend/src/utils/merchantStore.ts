import type { ApiStoreSummary } from '@/src/types/store';

export function resolveMerchantStoreId(stores: ApiStoreSummary[]): string | undefined {
  const activeStores = stores.filter((store) => store.status === 'ACTIVE');

  if (activeStores.length === 0) {
    return stores[0]?.id;
  }

  return activeStores[0]?.id;
}

export function resolveMerchantStore(
  stores: ApiStoreSummary[],
  storeId?: string,
): ApiStoreSummary | undefined {
  if (storeId) {
    return stores.find((store) => store.id === storeId);
  }

  const resolvedId = resolveMerchantStoreId(stores);
  return stores.find((store) => store.id === resolvedId);
}
