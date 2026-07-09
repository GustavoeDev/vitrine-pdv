import { z } from 'zod';

import type {
  ApiUser,
  AuthSession,
  AuthTokens,
  LoginInput,
  RegisterInput,
} from '@/src/types/auth';

import { api } from './api';

const authTokensSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});

const storeSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED']),
  category_id: z.string().uuid(),
  category_name: z.string(),
  subcategory: z.string().nullable(),
  logo_url: z.string().nullable(),
  cover_photo_url: z.string().nullable(),
});

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  avatar_url: z.string().nullable(),
  notifications_enabled: z.boolean(),
  created_at: z.string(),
  is_staff: z.boolean(),
  stores: z.array(storeSummarySchema),
});

const authSessionSchema = authTokensSchema.extend({
  user: userSchema,
});

export async function register(input: RegisterInput): Promise<AuthSession> {
  const { avatarUri: _avatarUri, ...payload } = input;
  const { data } = await api.post('/auth/register/', payload);
  return authSessionSchema.parse(data);
}

export async function login(input: LoginInput): Promise<AuthTokens> {
  const { data } = await api.post('/auth/login/', input);
  return authTokensSchema.parse(data);
}

export async function fetchCurrentUser(): Promise<ApiUser> {
  const { data } = await api.get('/users/me/');
  return userSchema.parse(data);
}

export async function updateCurrentUser(
  payload: Partial<Pick<ApiUser, 'name' | 'notifications_enabled' | 'avatar_url'>>,
): Promise<ApiUser> {
  const { data } = await api.patch('/users/me/', payload);
  return userSchema.parse(data);
}
