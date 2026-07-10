import { create } from 'zustand';

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/src/lib/tokenStorage';
import { disconnectNotificationSocket } from '@/src/lib/notificationSocket';
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
  refreshUser: () => Promise<void>;
  updateUser: (
    payload: Partial<Pick<ApiUser, 'name' | 'notifications_enabled' | 'avatar_url'>>,
  ) => Promise<ApiUser>;
  refreshSession: () => Promise<boolean>;
  logout: () => Promise<void>;
}

let hydrateInFlight: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isHydrated: false,
  isAuthenticating: false,

  hydrate: async () => {
    if (get().isHydrated) {
      return;
    }

    if (hydrateInFlight) {
      return hydrateInFlight;
    }

    const runHydrate = async () => {
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
    };

    hydrateInFlight = runHydrate();

    try {
      await hydrateInFlight;
    } finally {
      hydrateInFlight = null;
    }
  },

  login: async (input) => {
    set({ isAuthenticating: true });
    try {
      const tokens = await loginRequest(input);
      await setTokens(tokens.access, tokens.refresh);
      const user = await fetchCurrentUser();
      set({ accessToken: tokens.access, user, isHydrated: true, isAuthenticating: false });
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
        isHydrated: true,
        isAuthenticating: false,
      });
    } catch (error) {
      set({ isAuthenticating: false });
      throw error;
    }
  },

  refreshUser: async () => {
    const accessToken = get().accessToken ?? (await getAccessToken());
    if (!accessToken) {
      return;
    }

    const user = await fetchCurrentUser();
    set({ user, accessToken });
  },

  updateUser: async (payload) => {
    const user = await updateCurrentUser(payload);
    set({ user });
    return user;
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
    disconnectNotificationSocket();
    await clearTokens();
    set({ user: null, accessToken: null });
  },
}));
