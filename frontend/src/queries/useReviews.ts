import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { discoveryKeys } from '@/src/queries/useDiscovery';
import {
  createStoreReview,
  fetchMyStoreReview,
  fetchStoreReviews,
  updateMyStoreReview,
  type CreateStoreReviewInput,
  type UpdateStoreReviewInput,
} from '@/src/services/reviews';
import { useAuthStore } from '@/src/stores/authStore';

export const reviewKeys = {
  list: (storeId: string) => ['reviews', 'list', storeId] as const,
  mine: (storeId: string) => ['reviews', 'mine', storeId] as const,
};

export function useStoreReviews(storeId?: string) {
  return useQuery({
    queryKey: reviewKeys.list(storeId ?? 'unknown'),
    queryFn: () => fetchStoreReviews(storeId!),
    enabled: Boolean(storeId),
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useMyStoreReview(storeId?: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: reviewKeys.mine(storeId ?? 'unknown'),
    queryFn: () => fetchMyStoreReview(storeId!),
    enabled: Boolean(storeId && accessToken),
    staleTime: 0,
  });
}

export function useIsStoreOwner(storeId?: string) {
  const user = useAuthStore((state) => state.user);

  if (!storeId || !user) {
    return false;
  }

  return user.stores.some((store) => store.id === storeId);
}

export function useSubmitStoreReview(storeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateStoreReviewInput & { isUpdate?: boolean }) => {
      if (input.isUpdate) {
        return updateMyStoreReview(storeId, {
          rating: input.rating,
          comment: input.comment,
        });
      }

      return createStoreReview(storeId, input);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: reviewKeys.list(storeId) }),
        queryClient.invalidateQueries({ queryKey: reviewKeys.mine(storeId) }),
        queryClient.invalidateQueries({ queryKey: discoveryKeys.store(storeId) }),
      ]);
    },
  });
}

export type { UpdateStoreReviewInput };
