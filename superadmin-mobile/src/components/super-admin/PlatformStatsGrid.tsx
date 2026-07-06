import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlatformStatCard } from './PlatformStatCard';
import { theme } from '../../constants/theme';

export function PlatformStatsGrid() {
  const stats = [
    {
      iconName: 'briefcase' as const,
      title: 'Total Companies',
      value: '128',
      subtitle: 'All time',
      trendText: '+12 this month',
      trendType: 'positive' as const
    },
    {
      iconName: 'users' as const,
      title: 'Active Companies',
      value: '114',
      subtitle: 'This month',
      trendText: '89.1% of total',
      trendType: 'positive' as const
    },
    {
      iconName: 'user' as const,
      title: 'Total Workers',
      value: '18,452',
      subtitle: 'All time',
      trendText: '+1,250 this month',
      trendType: 'positive' as const
    },
    {
      iconName: 'grid' as const,
      title: 'Active QR Batches',
      value: '624',
      subtitle: 'Across platform',
      trendText: '+56 this week',
      trendType: 'positive' as const
    },
    {
      iconName: 'credit-card' as const,
      title: 'Pending Withdrawals',
      value: '482',
      subtitle: 'Requires approval',
      trendText: '72 urgent',
      trendType: 'warning' as const
    },
    {
      iconName: 'gift' as const,
      title: 'Rewards Distributed',
      value: '₹2.84 Cr',
      subtitle: 'All Time',
      trendText: '₹18.6L this month',
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
  }
});
