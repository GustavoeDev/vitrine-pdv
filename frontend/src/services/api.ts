import { create } from 'axios';
import { z } from 'zod';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const api = create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

export const healthResponseSchema = z.object({
  status: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await api.get('/health/');
  return healthResponseSchema.parse(data);
}
