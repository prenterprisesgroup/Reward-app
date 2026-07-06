import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { setupInterceptors } from '../api/interceptors';
import { queryClient } from '../api/queryClient';
import { useAppInitialization } from '../api/useAppInitialization';
import { Toast } from '../components/ui/Toast';
import { useGlobalToastStore } from '../store/useGlobalToastStore';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '../constants/theme';

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
    </QueryClientProvider>
  );
}
