import React, { memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-gifted-charts/dist/LineChart';
import { useAnalyticsTrendsQuery } from '../hooks/useAnalytics';
import { theme } from '../../../constants/theme';

export const TrendChart = memo(() => {
  const { data, isLoading, isError } = useAnalyticsTrendsQuery('daily');

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
        <Text style={styles.errorText}>Failed to load trends data.</Text>
      </View>
    );
  }

  // Mapper ensures this is safe
  if (data.rewards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No trend data available for this period.</Text>
      </View>
    );
  }

  const chartData = data.rewards.map(item => ({
    value: item.value,
    label: item.date.substring(5, 10), // Short date like 07-07
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Rewards Trend (Last 30 Days)</Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={300}
          height={200}
          thickness={3}
          color={theme.colors.primaryDark}
          hideRules
          hideYAxisText
          xAxisColor={theme.colors.border}
          yAxisColor={theme.colors.border}
          rulesColor={theme.colors.border}
          dataPointsColor={theme.colors.primary}
        />
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
    minHeight: 250,
    justifyContent: 'center',
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: 'center',
  }
});
