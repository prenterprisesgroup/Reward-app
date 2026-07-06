import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { Feather } from '@expo/vector-icons';
import { WorkerStats } from '../../types/worker';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface WorkerAnalyticsCardProps {
  stats: WorkerStats;
}

export function WorkerAnalyticsCard({ stats }: WorkerAnalyticsCardProps) {
  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <Animated.View entering={FadeInUp.delay(100).springify().damping(14)} style={styles.card}>
      <View style={styles.col}>
        <View style={styles.iconContainer}>
          <Feather name="users" size={18} color={theme.colors.success} />
        </View>
        <Typography variant="caption" style={styles.label}>Total Workers</Typography>
        <Typography variant="headingMd" weight="bold" style={styles.value}>
          {stats.totalWorkers}
        </Typography>
        <Typography variant="caption" style={styles.subtext}>All time</Typography>
      </View>

      <View style={styles.divider} />

      <View style={styles.col}>
        <View style={styles.iconContainer}>
          <Feather name="user-check" size={18} color={theme.colors.success} />
        </View>
        <Typography variant="caption" style={styles.label}>Active Today</Typography>
        <Typography variant="headingMd" weight="bold" style={styles.value}>
          {stats.activeToday}
        </Typography>
        <Typography variant="caption" style={styles.subtext}>Workers active</Typography>
      </View>

      <View style={styles.divider} />

      <View style={styles.col}>
        <View style={styles.iconContainer}>
          <Feather name="credit-card" size={18} color={theme.colors.success} />
        </View>
        <Typography variant="caption" style={styles.label}>Total Rewards Distributed</Typography>
        <Typography variant="title" weight="bold" style={styles.value}>
          {formatCurrency(stats.rewardsDistributed)}
        </Typography>
        <Typography variant="caption" style={styles.subtext}>All time</Typography>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...theme.shadows.sm,
  },
  col: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 4,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.borderLight,
    marginHorizontal: theme.spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.successBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  value: {
    color: theme.colors.textPrimary,
  },
  subtext: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    marginTop: 2,
  },
});
