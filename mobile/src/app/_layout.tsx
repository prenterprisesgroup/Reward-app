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

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
