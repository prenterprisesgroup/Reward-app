import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/common/Typography';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Typography style={styles.title}>Notifications</Typography>
        <View style={{ width: 44 }} />
      </View>
      <View style={styles.content}>
        <Typography style={styles.comingSoon}>Coming Soon</Typography>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, marginBottom: 20 },
  iconBtn: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', ...theme.shadows.sm },
  title: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textPrimary },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  comingSoon: { fontSize: 16, color: theme.colors.textSecondary }
});
