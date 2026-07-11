import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addFavorite,
  fetchFavorites,
  removeFavorite,
  updateFavoriteNotifications,
} from '@/src/services/favorites';
import {
  fetchFavoritePromotions,
  fetchFeaturedPromotion,
  fetchPromotionDetail,
  fetchStoreActivePromotions,
} from '@/src/services/promotions';
import { useAuthStore } from '@/src/stores/authStore';

export const promotionKeys = {
  featured: ['promotions', 'featured'] as const,
  favorites: ['promotions', 'favorites'] as const,
  detail: (id: string) => ['promotions', 'detail', id] as const,
  storeActive: (storeId: string) => ['promotions', 'store-active', storeId] as const,
};

export const favoriteKeys = {
  all: ['favorites'] as const,
};

export function useFeaturedPromotion() {
  return useQuery({
    queryKey: promotionKeys.featured,
    queryFn: fetchFeaturedPromotion,
    staleTime: 30_000,
  });
}

export function useFavoritePromotions() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: promotionKeys.favorites,
    queryFn: fetchFavoritePromotions,
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function usePromotionDetail(promotionId?: string) {
  return useQuery({
    queryKey: promotionKeys.detail(promotionId ?? 'unknown'),
    queryFn: () => fetchPromotionDetail(promotionId!),
    enabled: Boolean(promotionId),
    staleTime: 60_000,
  });
}

export function useStoreActivePromotions(storeId?: string) {
  return useQuery({
    queryKey: promotionKeys.storeActive(storeId ?? 'unknown'),
    queryFn: () => fetchStoreActivePromotions(storeId!),
    enabled: Boolean(storeId),
    staleTime: 30_000,
  });
}

export function useFavorites() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: favoriteKeys.all,
    queryFn: fetchFavorites,
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function useIsStoreFavorited(storeId?: string) {
  const { data: favorites = [] } = useFavorites();

  return favorites.some((favorite) => favorite.id === storeId);
}

export function useFavoriteStore(storeId?: string) {
  const { data: favorites = [] } = useFavorites();

  if (!storeId) {
    return null;
  }

  return favorites.find((favorite) => favorite.id === storeId) ?? null;
}

export function useToggleFavoriteNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storeId,
      notificationsEnabled,
    }: {
      storeId: string;
      notificationsEnabled: boolean;
    }) => updateFavoriteNotifications(storeId, notificationsEnabled),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storeId,
      isFavorited,
    }: {
      storeId: string;
      isFavorited: boolean;
    }) => {
      if (isFavorited) {
        await removeFavorite(storeId);
        return false;
      }

      await addFavorite(storeId);
      return true;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: favoriteKeys.all }),
        queryClient.invalidateQueries({ queryKey: promotionKeys.favorites }),
      ]);
    },
  });
}
