import { z } from 'zod';

import { api } from './api';
import type { MerchantStatsRange } from '@/src/types/merchant';

const merchantStatsTopProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  view_count: z.number(),
});

const merchantStatsSchema = z.object({
  range: z.enum(['7d', '30d', '3m']),
  views: z.number(),
  views_delta: z.string(),
  favorites: z.number(),
  favorites_delta: z.string(),
  active_products: z.number(),
  total_products: z.number(),
  average_rating: z.union([z.number(), z.string()]).nullable(),
  reviews_count: z.number(),
  top_products: z.array(merchantStatsTopProductSchema),
});

export type ApiMerchantStats = z.infer<typeof merchantStatsSchema>;

function parseAverageRating(value: string | number | null): number {
  if (value == null) {
    return 0;
  }

  const numeric = typeof value === 'string' ? Number.parseFloat(value) : value;
  return Number.isNaN(numeric) ? 0 : numeric;
}

export async function fetchMerchantStats(
  range: MerchantStatsRange,
  storeId?: string,
): Promise<ApiMerchantStats> {
  const { data } = await api.get('/merchant/stats/', {
    params: {
      range,
      ...(storeId ? { store_id: storeId } : {}),
    },
  });

  return merchantStatsSchema.parse(data);
}

export function mapApiMerchantStatsToSnapshot(stats: ApiMerchantStats) {
  return {
    views: stats.views,
    viewsDelta: stats.views_delta,
    favorites: stats.favorites,
    favoritesDelta: stats.favorites_delta,
    activeProducts: stats.active_products,
    totalProducts: stats.total_products,
    averageRating: parseAverageRating(stats.average_rating),
    ratingsCount: stats.reviews_count,
    topProducts: stats.top_products.map((product) => ({
      id: product.id,
      name: product.name,
      viewCount: product.view_count,
    })),
  };
}
