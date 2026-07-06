import { apiClient } from './client';
import { useAuthStore } from '../store/useAuthStore';
import { useGlobalToastStore } from '../store/useGlobalToastStore';
import { queryClient } from './queryClient';
import { router } from 'expo-router';

export const setupInterceptors = () => {
  apiClient.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().token;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Note: We are not injecting X-Platform, X-Request-ID, etc. 
      // because the backend does not currently support them.
      
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
      const authStore = useAuthStore.getState();
      const showToast = useGlobalToastStore.getState().showToast;
      
      if (!error.response) {
        // Network Error or Timeout
        showToast('Network offline or server unreachable. Please check your connection.', 'error');
        return Promise.reject(error);
      }

      const status = error.response.status;

      if (status === 401) {
        // Token expired or invalid. Backend does not support refresh tokens.
        // Logout immediately and redirect to login.
        if (authStore.isAuthenticated && !authStore.isLoggingOut) {
          showToast('Session expired. Please log in again.', 'warning');
          
          // Execute robust logout flow
          await queryClient.cancelQueries();
          queryClient.removeQueries();
          queryClient.clear();
          
          await authStore.logout();
          router.replace('/(auth)/login');
        }
      } else if (status === 403) {
        // Authorization failure. Wrong role.
        showToast('You do not have permission to access this resource.', 'error');
      } else if (status === 404) {
        showToast('Resource not found.', 'error');
      } else if (status === 429) {
        showToast('Too many requests. Please try again later.', 'warning');
      } else if (status >= 500) {
        showToast('Server error. Our team has been notified.', 'error');
      }
      
      return Promise.reject(error);
    }
  );
};

