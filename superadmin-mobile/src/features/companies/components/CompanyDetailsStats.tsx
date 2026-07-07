import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';

interface CompanyDetailsStatsProps {
  stats: {
    workforce: { activeWorkers: number; workersCount: number };
    qr: { activeBatches: number; batches: number };
    rewards: { distributed: number; pending: number };
    withdrawals: { pending: number; approved: number; rejected: number; cancelled: number };
  };
}

export function CompanyDetailsStats({ stats }: CompanyDetailsStatsProps) {
  const statItems = [
    {
      icon: <Feather name="users" size={16} color={theme.colors.success} />,
      title: 'Active Workers',
      value: stats.workforce.activeWorkers.toLocaleString(),
      subtitle: `Total: ${stats.workforce.workersCount.toLocaleString()}`,
    },
    {
      icon: <Feather name="grid" size={16} color={theme.colors.success} />,
      title: 'QR Reward Batches',
      value: stats.qr.activeBatches.toLocaleString(),
      subtitle: `Total: ${stats.qr.batches.toLocaleString()}`,
    },
    {
      icon: <Feather name="gift" size={16} color={theme.colors.success} />,
      title: 'Rewards Distributed',
      value: `₹${(stats.rewards.distributed / 100000).toFixed(2)} L`,
      subtitle: 'Total Distributed',
    },
    {
      icon: <Feather name="credit-card" size={16} color={theme.colors.success} />,
      title: 'Withdrawals Pending',
      value: `₹${(stats.withdrawals.pending / 100000).toFixed(2)} L`,
      subtitle: 'Pending Approval',
    }
  ];

  return (
    <View style={styles.grid}>
      {statItems.map((stat, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.iconContainer}>
            {stat.icon}
          </View>
          <Typography style={styles.title}>{stat.title}</Typography>
          <Typography style={styles.value}>{stat.value}</Typography>
          <Typography style={styles.subtitle}>{stat.subtitle}</Typography>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    width: '48%',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.successBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  }
});
