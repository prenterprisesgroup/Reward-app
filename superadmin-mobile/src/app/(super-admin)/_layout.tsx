import { Tabs } from 'expo-router';
import { RequireRole } from '../../components/navigation/RequireRole';

export default function SuperAdminLayout() {
  return (
    <RequireRole roles={['SUPER_ADMIN']}>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="dashboard" />
        {/* Placeholder tabs for future modules */}
      </Tabs>
    </RequireRole>
  );
}
