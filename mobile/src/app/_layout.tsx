import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupInterceptors } from '../api/interceptors';

// Setup Axios Interceptors globally
setupInterceptors();

// Create a client for React Query
const queryClient = new QueryClient();

import { NotificationProvider } from '../../../shared/notifications/providers/NotificationProvider';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const notificationEndpoints = {
  LIST: ENDPOINTS.SYSTEM.NOTIFICATIONS,
  READ: ENDPOINTS.SYSTEM.NOTIFICATIONS_READ,
  READ_ALL: ENDPOINTS.SYSTEM.NOTIFICATIONS_READ_ALL,
  DELETE: ENDPOINTS.SYSTEM.NOTIFICATIONS_DELETE,
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider apiClient={apiClient} endpoints={notificationEndpoints}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="splash" options={{ headerShown: false }} />
              <Stack.Screen name="playground/index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
              <Stack.Screen name="(worker)" options={{ headerShown: false }} />
              <Stack.Screen name="(admin)" options={{ headerShown: false }} />
              <Stack.Screen name="(super-admin)" options={{ headerShown: false }} />
            </Stack>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </NotificationProvider>
    </QueryClientProvider>
  );
}
