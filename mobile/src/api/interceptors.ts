import { apiClient } from './client';
import { useAuthStore } from '../store/useAuthStore';

export const setupInterceptors = () => {
  apiClient.interceptors.request.use(
    (config) => {
      // Get the token directly from Zustand state
      // Zustand state is synchronous and fast since it's already in memory
      const token = useAuthStore.getState().token;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      // Global error handling, e.g. 401 Unauthorized handling
      if (error.response?.status === 401) {
        // Automatically log out if the backend rejects the token
        const authStore = useAuthStore.getState();
        if (authStore.isAuthenticated) {
          await authStore.logout();
        }
      } else if (error.response?.status === 403) {
        // 403 is authorization failure, not authentication. Do not logout.
        // Redirect to a dedicated unauthorized screen or show alert
        const { router } = require('expo-router');
        // Prevent looping if already on unauthorized
        router.replace('/(admin)/unauthorized');
      }
      
      return Promise.reject(error);
    }
  );
};
