import { categoryStores, featuredStores, nearbyStores } from '@/src/mocks/consumer';
import { Store } from '@/src/types';

function dedupeStores(stores: Store[]): Store[] {
  const seen = new Set<string>();

  return stores.filter((store) => {
    if (seen.has(store.id)) {
      return false;
    }

    seen.add(store.id);
    return true;
  });
}

const ALL_MOCK_STORES = dedupeStores([
  ...nearbyStores,
  ...categoryStores,
  ...featuredStores,
]);

export const HOME_STORES_PREVIEW_LIMIT = 3;

export function getTopRatedStores(
  categoryName: string | null,
  subcategoryName?: string | null,
): Store[] {
  let filtered = categoryName
    ? ALL_MOCK_STORES.filter((store) => store.category === categoryName)
    : ALL_MOCK_STORES;

  if (subcategoryName) {
    filtered = filtered.filter((store) =>
      matchesSubcategory(store.subcategory, subcategoryName),
    );
  }

  return [...filtered].sort((left, right) => {
    if (right.rating !== left.rating) {
      return right.rating - left.rating;
    }

    return right.reviews - left.reviews;
  });
}

function matchesSubcategory(storeSubcategory: string, filterName: string): boolean {
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase();

  const store = normalize(storeSubcategory);
  const filter = normalize(filterName);
  const filterStem = filter.replace(/(s|es)$/, '');

  return (
    store === filter ||
    store === filterStem ||
    store.startsWith(filterStem) ||
    filter.startsWith(store)
  );
}
