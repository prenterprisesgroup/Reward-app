import { Tabs } from 'expo-router';
import { BottomNavigation } from '../../../components/navigation/BottomNavigation';

export default function AdminTabsLayout() {
  return (
    <Tabs 
      tabBar={() => <BottomNavigation isAdmin={true} />}
      screenOptions={{ headerShown: false }}
      sceneContainerStyle={{ backgroundColor: '#F8F9FA' }}
    >
      {/* Tab screens will be auto-discovered from child routes */}
    </Tabs>
  );
}
