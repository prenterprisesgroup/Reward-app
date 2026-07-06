import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Typography } from '../../components/common/Typography';
import { theme } from '../../constants/theme';

export default function UnauthorizedScreen() {
  const router = useRouter();
  
  return (
    <ScreenWrapper preset="fixed" backgroundColor={theme.colors.background}>
      <View style={styles.container}>
        <Feather name="shield-off" size={64} color={theme.colors.error} style={styles.icon} />
        <Typography variant="headingXl" weight="bold" style={styles.title}>Access Denied</Typography>
        <Typography style={styles.subtitle}>
          You don't have permission to perform this action or view this page.
        </Typography>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/(admin)')}>
          <Typography style={styles.buttonText} weight="bold">Return to Dashboard</Typography>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
});
