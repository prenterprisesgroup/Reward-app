import React from 'react';
import { View, StyleSheet, TouchableOpacity, ToastAndroid, Platform, Alert } from 'react-native';
import { Typography } from './Typography';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  showBack?: boolean;
}

export function ScreenHeader({ title, subtitle, showSearch = false, showBack = false }: ScreenHeaderProps) {
  const router = useRouter();
  const unreadCount = 0; // Coming soon

  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      )}
      <View style={styles.titleSection}>
        <Typography variant="headingXl" style={styles.title}>{title}</Typography>
        {subtitle && (
          <View style={styles.subtitleRow}>
            <View style={styles.greenDot} />
            <Typography variant="body" color="textSecondary" style={styles.subtitle}>
              {subtitle}
            </Typography>
          </View>
        )}
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => router.push('/(super-admin)/inbox')}
        >
          {unreadCount > 0 && <View style={styles.notificationDot} />}
          <Feather name="bell" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        
        {showSearch && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => {
              if (Platform.OS === 'android') ToastAndroid.show('Use the search bar below', ToastAndroid.SHORT);
              else Alert.alert('Search', 'Use the search bar below');
            }}
          >
            <Feather name="search" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  titleSection: {
    flex: 1,
  },
  backButton: {
    marginRight: theme.spacing.md,
    marginTop: 4,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    zIndex: 1,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
});
