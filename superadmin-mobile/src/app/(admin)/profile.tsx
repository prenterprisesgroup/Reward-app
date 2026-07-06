import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Typography } from '../../components/common/Typography';
import { theme } from '../../constants/theme';

export default function AdminProfileScreen() {
  return (
    <ScreenWrapper preset="fixed" backgroundColor={theme.colors.background}>
      <View style={styles.container}>
        <Typography variant="headingLg" weight="bold" style={styles.title}>Admin Profile</Typography>
        <Typography style={styles.subtitle}>Coming Soon</Typography>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
});
