import { z } from 'zod';

import { api } from './api';

const searchResultSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['store', 'product']),
  title: z.string(),
  subtitle: z.string(),
  store_id: z.string().uuid().nullable().optional(),
});

export type ApiSearchResult = z.infer<typeof searchResultSchema>;

export async function searchCatalog(query: string): Promise<ApiSearchResult[]> {
  const { data } = await api.get('/search/', {
    params: { q: query },
  });

  return z.array(searchResultSchema).parse(data);
}
