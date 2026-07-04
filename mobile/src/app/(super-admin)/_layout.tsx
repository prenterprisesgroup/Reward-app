import { Stack } from 'expo-router';

export default function SuperAdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
