import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { SplashScreen } from '../components/splash/SplashScreen';
import { walletApi } from '../api/wallet.api';

export default function Index() {
  const { restoreSession, isLoadingSession, isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    const routeUser = async () => {
      if (isLoadingSession) return;
      
      if (isAuthenticated) {
        let currentUser = user;
        
        // If token restored but user is null, fetch it
        if (!currentUser) {
          try {
            const data = await walletApi.getMe();
            currentUser = data?.user || data;
            if (currentUser) {
              useAuthStore.setState({ user: currentUser });
            } else {
              throw new Error("No user returned");
            }
          } catch (e) {
            console.error("Failed to fetch user during session restore", e);
            await logout();
            router.replace('/(auth)/login');
            return;
          }
        }

        // Route based on role
        if (currentUser?.role === 'WORKER') {
          router.replace('/(worker)');
        } else if (currentUser?.role === 'COMPANY_ADMIN') {
          router.replace('/(admin)');
        } else if (currentUser?.role === 'SUPER_ADMIN') {
          router.replace('/(super-admin)');
        } else {
          router.replace('/(auth)/login');
        }
      } else {
        router.replace('/(auth)/login');
      }
    };
    
    routeUser();
  }, [isLoadingSession, isAuthenticated, user]);

  return <SplashScreen />;
}
