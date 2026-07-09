import type { ApiStoreSummary } from '@/src/types/store';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  notifications_enabled: boolean;
  created_at: string;
  is_staff: boolean;
  stores: ApiStoreSummary[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthSession extends AuthTokens {
  user: ApiUser;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
  avatarUri?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}
