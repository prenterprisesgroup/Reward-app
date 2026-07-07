import { Tabs } from 'expo-router';
import { BottomNavigation } from '../../components/navigation/BottomNavigation';

export default function AdminLayout() {
  return (
    <Tabs 
      tabBar={() => <BottomNavigation isAdmin={true} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="qr-batches" />
      <Tabs.Screen name="payments" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen 
        name="create-qr-batch" 
        options={{ href: null, unmountOnBlur: false }}
      />
    </Tabs>
  );
}
