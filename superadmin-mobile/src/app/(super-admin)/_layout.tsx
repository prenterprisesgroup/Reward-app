import { Tabs } from 'expo-router';
import { RequireRole } from '../../components/navigation/RequireRole';
import { BottomNavigation } from '../../components/navigation/BottomNavigation';

export default function SuperAdminLayout() {
  return (
    <RequireRole roles={['SUPER_ADMIN']}>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
        <Tabs.Screen name="companies" options={{ title: 'Companies' }} />
        <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
        <Tabs.Screen name="audit" options={{ title: 'Audit Logs' }} />
        <Tabs.Screen name="health" options={{ title: 'System Health' }} />
        <Tabs.Screen name="notifications" options={{ title: 'Notifications' }} />
        <Tabs.Screen name="reports" options={{ title: 'Reports' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
      <BottomNavigation isSuperAdmin={true} />
    </RequireRole>
  );
}
