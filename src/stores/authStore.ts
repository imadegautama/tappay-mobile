import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

import { getProfile } from '@/api/user';
import { queryClient } from '@/api/queryClient';
import type { AuthResponse, UserProfile } from '@/api/types';

const TOKEN_KEY = 'tappay_auth_token';

async function getStoredToken() {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem(TOKEN_KEY);
  }

  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function setStoredToken(token: string) {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function removeStoredToken() {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  token: string | null;
  user: UserProfile | null;
  initialize: () => Promise<void>;
  setSession: (auth: AuthResponse) => Promise<void>;
  setUser: (user: UserProfile) => void;
  logoutLocal: () => Promise<void>;
  handleUnauthorized: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  token: null,
  user: null,

  initialize: async () => {
    if (get().status === 'loading') return;

    set({ status: 'loading' });

    const token = await getStoredToken();

    if (!token) {
      set({ token: null, user: null, status: 'unauthenticated' });
      return;
    }

    set({ token });

    try {
      const user = await getProfile();
      set({ user, status: 'authenticated' });
      queryClient.setQueryData(['profile'], user);
    } catch {
      await get().handleUnauthorized();
    }
  },

  setSession: async (auth) => {
    await setStoredToken(auth.token);
    set({
      token: auth.token,
      status: 'authenticated',
      user: {
        ...auth.user,
        phone: null,
        fingerprint_id: null,
        created_at: null,
      },
    });
  },

  setUser: (user) => {
    set({ user });
  },

  logoutLocal: async () => {
    await removeStoredToken();
    queryClient.clear();
    set({ token: null, user: null, status: 'unauthenticated' });
  },

  handleUnauthorized: async () => {
    await removeStoredToken();
    queryClient.clear();
    set({ token: null, user: null, status: 'unauthenticated' });
  },
}));
