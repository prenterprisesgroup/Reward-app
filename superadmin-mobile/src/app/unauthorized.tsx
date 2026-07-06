import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../components/common/Typography';
import { theme } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { router } from 'expo-router';

export default function UnauthorizedScreen() {
  const logout = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name="shield-off" size={64} color={theme.colors.error} />
      </View>
      <Typography style={styles.title} variant="title">Access Denied</Typography>
      <Typography style={styles.subtitle}>
        You do not have the required permissions to access the Super Admin application.
      </Typography>
      
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Typography style={styles.buttonText}>Sign Out</Typography>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.errorBackground,
    borderRadius: theme.radius.full,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    lineHeight: 24,
  },
  button: {
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.radius.lg,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  }
});
