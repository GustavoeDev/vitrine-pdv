import { Store } from '@/src/types';

export const HOME_STORES_PREVIEW_LIMIT = 3;

export function sortStoresByRating(stores: Store[]): Store[] {
  return [...stores].sort((left, right) => {
    if (right.rating !== left.rating) {
      return right.rating - left.rating;
    }

    return right.reviews - left.reviews;
  });
}

export function filterStoresByCategory(stores: Store[], categoryName: string | null): Store[] {
  if (!categoryName) {
    return stores;
  }

  return stores.filter((store) => store.category === categoryName);
}
