import React, { memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGrowthQuery } from '../hooks/useAnalytics';
import { theme } from '../../../constants/theme';
import { GrowthMetricDTO } from '../types/analytics.types';

const MetricCard = memo(({ title, data }: { title: string; data?: GrowthMetricDTO }) => {
  if (!data) return null;

  const isPositive = data.percentage >= 0;
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{data.current}</Text>
      <View style={[styles.badge, isPositive ? styles.badgeSuccess : styles.badgeError]}>
        <Text style={[styles.badgeText, isPositive ? styles.textSuccess : styles.textError]}>
          {isPositive ? '+' : ''}{data.percentage}%
        </Text>
      </View>
    </View>
  );
});

export const BusinessOverview = memo(() => {
  const { data, isLoading, isError } = useGrowthQuery();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primaryDark} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load business overview.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Business Overview (Last 30 Days)</Text>
      <View style={styles.grid}>
        <MetricCard title="Total Companies" data={data.companies} />
        <MetricCard title="Active Workers" data={data.workers} />
        <MetricCard title="Rewards Disbursed" data={data.rewards} />
        <MetricCard title="Barcode Batches" data={data.batches} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    elevation: 2,
    minHeight: 150,
    justifyContent: 'center'
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  metricCard: {
    width: '50%',
    padding: theme.spacing.xs,
  },
  metricTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  metricValue: {
    ...theme.typography.h2,
    marginVertical: theme.spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  badgeSuccess: {
    backgroundColor: theme.colors.success + '20',
  },
  badgeError: {
    backgroundColor: theme.colors.error + '20',
  },
  badgeText: {
    ...theme.typography.caption,
    fontWeight: 'bold',
  },
  textSuccess: {
    color: theme.colors.success,
  },
  textError: {
    color: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  }
});
