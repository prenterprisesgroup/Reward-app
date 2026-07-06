import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { apiClient } from './client';
import { useGlobalToastStore } from '../store/useGlobalToastStore';
import { router } from 'expo-router';
import { queryClient } from './queryClient';

export function useAppInitialization() {
  const [isReady, setIsReady] = useState(false);
  const { restoreSession, logout, setUser, token } = useAuthStore();
  const showToast = useGlobalToastStore(state => state.showToast);

  useEffect(() => {
    async function initialize() {
      try {
        // 1. Restore Token from Secure Store
        await restoreSession();

        const currentToken = useAuthStore.getState().token;
        if (!currentToken) {
          setIsReady(true);
          return;
        }

        // 2. Fetch /auth/me to validate token and fetch current user
        try {
          const response = await apiClient.get('/api/v1/auth/me');
          const user = response.data.user;

          // 3. Verify user exists and role is SUPER_ADMIN
          if (!user || user.role !== 'SUPER_ADMIN') {
            throw new Error('Unauthorized role');
          }

          // Update user in store
          setUser(user);

        } catch (error: any) {
          // If token is invalid, expired, or wrong role, logout and clear cache
          console.log('App init auth failure', error?.message || error);
          await queryClient.cancelQueries();
          queryClient.removeQueries();
          queryClient.clear();
          await logout();
          
          if (error?.message === 'Unauthorized role') {
             showToast('You do not have permission to access the Super Admin application.', 'error');
          }
        }
      } catch (e) {
        console.warn('Initialization error:', e);
      } finally {
        // 4. App Ready
        setIsReady(true);
      }
    }

    initialize();
  }, []); // Run once on mount

  // Watch for auth changes to handle redirects
  useEffect(() => {
    if (!isReady) return;
    
    const { isAuthenticated, user } = useAuthStore.getState();
    
    if (isAuthenticated && user?.role === 'SUPER_ADMIN') {
      router.replace('/(super-admin)/dashboard');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isReady]);

  return isReady;
}
