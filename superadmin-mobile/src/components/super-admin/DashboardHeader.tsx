import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastAndroid, Platform, Alert } from 'react-native';

export function DashboardHeader() {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View 
      entering={FadeInUp.delay(100).duration(400)}
      style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}
    >
      <View style={styles.textContainer}>
        <Typography style={styles.greeting} weight="semiBold">Good Morning 👋</Typography>
        <Typography style={styles.title} variant="title">Super Admin</Typography>
        <Typography style={styles.subtitle} variant="body">Platform Overview</Typography>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.iconButton} 
          accessibilityRole="button" 
          accessibilityLabel="Notifications"
          onPress={() => {
            if (Platform.OS === 'android') ToastAndroid.show('Notifications coming soon', ToastAndroid.SHORT);
            else Alert.alert('Coming Soon', 'Notifications coming soon');
          }}
        >
          <Feather name="bell" size={20} color={theme.colors.textPrimary} />
          {/* Notification Dot */}
          <View style={styles.notificationDot} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.avatarContainer} 
          accessibilityRole="button" 
          accessibilityLabel="Profile"
          onPress={() => {
            if (Platform.OS === 'android') ToastAndroid.show('Profile settings coming soon', ToastAndroid.SHORT);
            else Alert.alert('Coming Soon', 'Profile settings coming soon');
          }}
        >
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150?u=superadmin' }} 
            style={styles.avatar} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

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
