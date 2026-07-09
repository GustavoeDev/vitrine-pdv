import { create } from 'axios';
import { z } from 'zod';

import { resolveApiBaseUrl } from '@/src/lib/apiConfig';

const authTokensSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});

export async function refreshAccessToken(refresh: string) {
  const { data } = await create({
    baseURL: resolveApiBaseUrl(),
    timeout: 15_000,
  }).post('/auth/refresh/', { refresh });

  return authTokensSchema.parse(data);
}
