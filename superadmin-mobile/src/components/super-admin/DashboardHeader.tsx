import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastAndroid, Platform, Alert, AppState, AppStateStatus } from 'react-native';

import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'expo-router';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning ☀️';
  if (hour < 18) return 'Good Afternoon 🌤️';
  return 'Good Evening 🌙';
};

export const DashboardHeader = React.memo(function DashboardHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const unreadCount = 0; // Coming soon
  const user = useAuthStore(state => state.user);

  const [greeting, setGreeting] = React.useState(() => getGreeting());
  
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        setGreeting(getGreeting());
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Admin';

  // Stabilized: prevents new function reference on every render
  const handleNotificationsPress = useCallback(() => {
    router.push('/(super-admin)/inbox');
  }, [router]);

  const handleProfilePress = useCallback(() => {
    router.push('/(super-admin)/profile');
  }, [router]);

  return (
    <Animated.View
      entering={FadeInUp.delay(100).duration(400)}
      style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}
    >
      <View style={styles.textContainer}>
        <Typography style={styles.greeting} weight="semiBold">{greeting}</Typography>
        <Typography style={styles.title} variant="title">{firstName}</Typography>
        <Typography style={styles.subtitle} variant="body">Welcome back! Today's overview is ready.</Typography>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={handleNotificationsPress}
        >
          <Feather name="bell" size={20} color={theme.colors.textPrimary} />
          {/* Notification Dot */}
          {unreadCount > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarContainer}
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={handleProfilePress}
        >
          <Image
            source={{ uri: user?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Super Admin')}&background=0D8ABC&color=fff&size=150` }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: theme.colors.primary,
    marginBottom: 4,
    fontWeight: '600',
  },
  title: {
    fontSize: theme.typography.size.headingLg,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    borderWidth: 1.5,
    borderColor: theme.colors.surface,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  avatar: {
    width: '100%',
    height: '100%',
  }
});
