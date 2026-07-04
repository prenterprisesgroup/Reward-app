import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const TOKEN_KEY = 'AUTH_JWT_TOKEN';

// Platform-agnostic storage helpers
const setTokenAsync = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getTokenAsync = async (key: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') return window.localStorage.getItem(key);
    return null;
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const deleteTokenAsync = async (key: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export type UserRole = 'WORKER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN';

export interface User {
  _id: string;
  name: string;
  phone: string;
  role: UserRole;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  setCredentials: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoadingSession: true,

  setCredentials: async (token: string, user: User) => {
    try {
      await setTokenAsync(TOKEN_KEY, token);
      set({ token, user, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to securely store token', error);
    }
  },

  logout: async () => {
    try {
      await deleteTokenAsync(TOKEN_KEY);
      set({ token: null, user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Failed to securely delete token', error);
    }
  },

  restoreSession: async () => {
    try {
      const token = await getTokenAsync(TOKEN_KEY);
      if (token) {
        // In a real app, you would validate the token or fetch the user profile here.
        // For now, we just restore the token state.
        set({ token, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Failed to restore session from secure storage', error);
    } finally {
      set({ isLoadingSession: false });
    }
  },
}));
