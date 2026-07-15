import { Tabs } from 'expo-router';
import { BottomNavigation } from '../../../components/navigation/BottomNavigation';

export default function AdminTabsLayout() {
  return (
    <Tabs 
      tabBar={() => <BottomNavigation isAdmin={true} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#F8F9FA' } } as any}
    >
      {/* Tab screens will be auto-discovered from child routes */}
    </Tabs>
  );
}
