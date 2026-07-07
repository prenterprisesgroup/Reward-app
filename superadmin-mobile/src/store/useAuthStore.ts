import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const TOKEN_KEY = 'AUTH_JWT_TOKEN';

// Platform-agnostic storage helpers
export const setTokenAsync = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export const getTokenAsync = async (key: string) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') return window.localStorage.getItem(key);
    return null;
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

export const deleteTokenAsync = async (key: string) => {
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
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  isLoggingOut: boolean;
  setCredentials: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoadingSession: true,
  isLoggingOut: false,

  setCredentials: async (token: string, user: User) => {
    try {
      await setTokenAsync(TOKEN_KEY, token);
      set({ token, user, isAuthenticated: true });
    } catch (error) {
      // Ignore secure storage errors
    }
  },

  setUser: (user: User) => {
    set({ user });
  },

  logout: async () => {
    const { isLoggingOut } = get();
    if (isLoggingOut) return; // Prevent race conditions

    set({ isLoggingOut: true });
    try {
      await deleteTokenAsync(TOKEN_KEY);
      set({ token: null, user: null, isAuthenticated: false });
    } catch (error) {
      // Ignore secure deletion errors
    } finally {
      set({ isLoggingOut: false });
    }
  },

  restoreSession: async () => {
    try {
      const token = await getTokenAsync(TOKEN_KEY);
      if (token) {
        set({ token, isAuthenticated: true });
      }
    } catch (error) {
      // Ignore restoration errors
    } finally {
      set({ isLoadingSession: false });
    }
  },
}));
