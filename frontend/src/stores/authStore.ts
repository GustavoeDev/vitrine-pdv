import { create } from 'zustand';

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/src/lib/tokenStorage';
import { refreshAccessToken } from '@/src/lib/refreshToken';
import {
  fetchCurrentUser,
  login as loginRequest,
  register as registerRequest,
  updateCurrentUser,
} from '@/src/services/auth';
import { uploadMedia } from '@/src/services/media';
import type { ApiUser, LoginInput, RegisterInput } from '@/src/types/auth';

interface AuthState {
  user: ApiUser | null;
  accessToken: string | null;
  isHydrated: boolean;
  isAuthenticating: boolean;
  hydrate: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isHydrated: false,
  isAuthenticating: false,

  hydrate: async () => {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      set({ accessToken: null, user: null, isHydrated: true });
      return;
    }

    set({ accessToken, isAuthenticating: true });

    try {
      const user = await fetchCurrentUser();
      set({ user, accessToken, isHydrated: true, isAuthenticating: false });
    } catch {
      const refreshed = await get().refreshSession();
      if (!refreshed) {
        await clearTokens();
        set({ user: null, accessToken: null, isHydrated: true, isAuthenticating: false });
        return;
      }
      set({ isHydrated: true, isAuthenticating: false });
    }
  },

  login: async (input) => {
    set({ isAuthenticating: true });
    try {
      const tokens = await loginRequest(input);
      await setTokens(tokens.access, tokens.refresh);
      const user = await fetchCurrentUser();
      set({ accessToken: tokens.access, user, isAuthenticating: false });
    } catch (error) {
      set({ isAuthenticating: false });
      throw error;
    }
  },

  register: async (input) => {
    set({ isAuthenticating: true });
    try {
      const session = await registerRequest(input);
      await setTokens(session.access, session.refresh);

      let user = session.user;

      if (input.avatarUri) {
        const avatarUrl = await uploadMedia(input.avatarUri, 'avatars');
        user = await updateCurrentUser({ avatar_url: avatarUrl });
      }

      set({
        accessToken: session.access,
        user,
        isAuthenticating: false,
      });
    } catch (error) {
      set({ isAuthenticating: false });
      throw error;
    }
  },

  refreshSession: async () => {
    const refresh = await getRefreshToken();
    if (!refresh) {
      return false;
    }

    try {
      const tokens = await refreshAccessToken(refresh);
      await setTokens(tokens.access, tokens.refresh);
      const user = await fetchCurrentUser();
      set({ accessToken: tokens.access, user });
      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    await clearTokens();
    set({ user: null, accessToken: null });
  },
}));
