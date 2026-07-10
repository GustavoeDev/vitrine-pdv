import { create, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';

import { resolveApiBaseUrl } from '@/src/lib/apiConfig';
import { getAccessToken, getRefreshToken, setTokens } from '@/src/lib/tokenStorage';
import { refreshAccessToken } from '@/src/lib/refreshToken';

export const api = create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15_000,
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function resolveAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refresh = await getRefreshToken();
      if (!refresh) {
        return null;
      }

      try {
        const tokens = await refreshAccessToken(refresh);
        await setTokens(tokens.access, tokens.refresh);
        return tokens.access;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh/');

    if (!originalRequest || !isUnauthorized || originalRequest._retry || isRefreshRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const newAccessToken = await resolveAccessToken();

    if (!newAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return api(originalRequest);
  },
);

export const healthResponseSchema = z.object({
  status: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await api.get('/health/');
  return healthResponseSchema.parse(data);
}
