import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../../constants/theme';
import { Typography } from '../../components/common/Typography';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Card } from '../../components/cards/Card';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';

export default function ResetSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScreenWrapper scroll paddingHorizontal={0} paddingVertical={0} safeAreaEdges={['bottom', 'left', 'right']}>
      <View style={[styles.container, { paddingTop: insets.top + theme.spacing.lg }]}> 
        <Typography variant="headingXl" color="textPrimary" weight="bold" style={styles.title}>
          Password Reset Successful
        </Typography>
        <Typography variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
          Your password has been updated. You can now sign in with your new password.
        </Typography>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.iconWrapper}>
            <Typography variant="headingLg" color="accent" weight="bold">
              ✓
            </Typography>
          </View>
          <Typography variant="bodyLarge" color="textPrimary" style={styles.message}>
            Password reset completed successfully.
          </Typography>
          <PrimaryButton
            title="Back to Login"
            fullWidth
            onPress={() => router.replace('/(auth)/login')}
            style={styles.button}
          />
        </Card>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    marginBottom: theme.spacing['2xl'],
    lineHeight: 24,
  },
  card: {
    padding: theme.spacing['2xl'],
    borderRadius: 32,
    ...theme.shadows.lg,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.colors.successBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  message: {
    textAlign: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  button: {
    minHeight: 56,
    borderRadius: 28,
  },
});
