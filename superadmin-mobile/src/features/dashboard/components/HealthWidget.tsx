import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SystemHealthCard } from '../../../components/super-admin/SystemHealthCard';
import { theme } from '../../../constants/theme';

export function HealthWidget() {
  // Phase 3 implementation. For now, it mounts the static component.
  return (
    <View style={styles.container}>
      <SystemHealthCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  }
});
