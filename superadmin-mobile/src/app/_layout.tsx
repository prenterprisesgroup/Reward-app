import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { setupInterceptors } from '../api/interceptors';
import { queryClient } from '../api/queryClient';
import { useAppInitialization } from '../api/useAppInitialization';
import { Toast } from '../components/common/ui/Toast';
import { useGlobalToastStore } from '../store/useGlobalToastStore';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '../constants/theme';
import { Typography } from '../components/common/Typography';
import { NotificationProvider } from '../shared/notifications/providers/NotificationProvider';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const notificationEndpoints = {
  LIST: ENDPOINTS.SYSTEM.NOTIFICATIONS,
  READ: ENDPOINTS.SYSTEM.NOTIFICATIONS_READ,
  READ_ALL: ENDPOINTS.SYSTEM.NOTIFICATIONS_READ_ALL,
  DELETE: ENDPOINTS.SYSTEM.NOTIFICATIONS_DELETE,
};

// Setup Axios Interceptors globally
setupInterceptors();

export default function RootLayout() {
  const isReady = useAppInitialization();
  const { visible, message, type, hideToast } = useGlobalToastStore();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primaryDark} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider apiClient={apiClient} endpoints={notificationEndpoints}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(super-admin)" />
            </Stack>
            
            <Toast 
              visible={visible} 
              message={message} 
              type={type} 
              onHide={hideToast} 
            />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background, padding: 24 }}>
      <View style={{ marginBottom: 20 }}>
        {/* Simple fallback icon for crash */}
        <Typography variant="headingXl">⚠️</Typography>
      </View>
      <Typography variant="headingMd" weight="bold" style={{ marginBottom: 12 }}>
        Application Error
      </Typography>
      <Typography variant="body" color="textSecondary" style={{ textAlign: 'center', marginBottom: 24 }}>
        {error.message || 'An unexpected error occurred in the Super Admin panel.'}
      </Typography>
      <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
        <Typography color="background" weight="bold" onPress={retry}>
          Try Again
        </Typography>
      </View>
    </View>
  );
}
