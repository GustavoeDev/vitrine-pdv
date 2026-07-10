import { z } from 'zod';

import { api } from './api';

const storeReviewSchema = z.object({
  id: z.string().uuid(),
  author_name: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  created_at: z.string(),
});

export type ApiStoreReview = z.infer<typeof storeReviewSchema>;

export interface CreateStoreReviewInput {
  rating: number;
  comment?: string;
}

export interface UpdateStoreReviewInput {
  rating?: number;
  comment?: string;
}

export async function fetchStoreReviews(storeId: string): Promise<ApiStoreReview[]> {
  const { data } = await api.get(`/stores/${storeId}/reviews/`);
  return z.array(storeReviewSchema).parse(data);
}

export async function fetchMyStoreReview(storeId: string): Promise<ApiStoreReview | null> {
  const response = await api.get(`/stores/${storeId}/reviews/me/`);

  if (response.status === 204 || response.data == null) {
    return null;
  }

  return storeReviewSchema.parse(response.data);
}

export async function createStoreReview(
  storeId: string,
  input: CreateStoreReviewInput,
): Promise<ApiStoreReview> {
  const { data } = await api.post(`/stores/${storeId}/reviews/`, input);
  return storeReviewSchema.parse(data);
}

export async function updateMyStoreReview(
  storeId: string,
  input: UpdateStoreReviewInput,
): Promise<ApiStoreReview> {
  const { data } = await api.patch(`/stores/${storeId}/reviews/me/`, input);
  return storeReviewSchema.parse(data);
}

export function mapApiStoreReviewToReview(review: ApiStoreReview) {
  return {
    id: review.id,
    authorName: review.author_name,
    rating: review.rating,
    comment: review.comment,
  };
}
