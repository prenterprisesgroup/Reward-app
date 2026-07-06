import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore, UserRole } from '../../store/useAuthStore';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '../../constants/theme';

interface RequireRoleProps {
  roles: UserRole[];
  children: React.ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, isAuthenticated, isLoadingSession } = useAuthStore();

  if (isLoadingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primaryDark} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!roles.includes(user.role)) {
    // If authenticated but wrong role, redirect to unauthorized or logout
    return <Redirect href="/unauthorized" />;
  }

  return <>{children}</>;
}
