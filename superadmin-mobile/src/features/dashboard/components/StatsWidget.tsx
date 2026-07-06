import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useDashboardStatsQuery } from '../hooks/useDashboardStatsQuery';
import { PlatformStatCard } from '../../../components/super-admin/PlatformStatCard';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';

export function StatsWidget() {
  const { data, isLoading, isError, error } = useDashboardStatsQuery();

  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color={theme.colors.primaryDark} />
        <Typography variant="body" color="textSecondary" style={{ marginTop: 8 }}>
          Loading statistics...
        </Typography>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={32} color={theme.colors.error} />
        <Typography variant="body" color="error" style={{ marginTop: 8 }}>
          Failed to load stats
        </Typography>
      </View>
    );
  }

  if (!data) return null;

  const stats = [
    {
      iconName: 'briefcase' as const,
      title: 'Total Companies',
      value: data.totalCompanies.toString(),
      subtitle: 'All time',
      trendText: 'Live',
      trendType: 'positive' as const
    },
    {
      iconName: 'users' as const,
      title: 'Active Workers',
      value: data.activeWorkers.toString(),
      subtitle: 'All time',
      trendText: 'Live',
      trendType: 'positive' as const
    },
    {
      iconName: 'grid' as const,
      title: 'QR Generated',
      value: data.qrGenerated.toString(),
      subtitle: 'Across platform',
      trendText: 'Live',
      trendType: 'positive' as const
    },
    {
      iconName: 'check-circle' as const,
      title: 'QR Redeemed',
      value: data.qrRedeemed.toString(),
      subtitle: 'Across platform',
      trendText: 'Live',
      trendType: 'positive' as const
    },
    {
      iconName: 'credit-card' as const,
      title: 'Pending Withdrawals',
      value: data.pendingWithdrawalsCount.toString(),
      subtitle: 'Requires action',
      trendText: 'Urgent',
      trendType: 'warning' as const
    },
    {
      iconName: 'gift' as const,
      title: 'Rewards Distributed',
      value: `₹${data.totalRewardsPaid}`,
      subtitle: 'All Time',
      trendText: 'Live',
      trendType: 'positive' as const
    }
  ];

  return (
    <View style={styles.gridContainer}>
      {stats.map((stat, index) => (
        <PlatformStatCard
          key={index}
          index={index}
          iconName={stat.iconName}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          trendText={stat.trendText}
          trendType={stat.trendType}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  stateContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: theme.spacing.lg,
    borderRadius: 20,
    marginBottom: theme.spacing.md,
  }
});
