import React, { memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAnalyticsTrendsQuery } from '../hooks/useAnalytics';
import { theme } from '../../../constants/theme';
import { LineChart } from 'react-native-gifted-charts/dist/LineChart';

export const GrowthChart = memo(() => {
  const { data, isLoading, isError } = useAnalyticsTrendsQuery('monthly');

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
        <Text style={styles.errorText}>Failed to load growth data.</Text>
      </View>
    );
  }

  if (data.companies.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No company growth data available.</Text>
      </View>
    );
  }

  const chartData = data.companies.map(item => ({
    value: item.value,
    label: item.date.substring(0, 7), // YYYY-MM
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Company Growth (Yearly)</Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={300}
          height={200}
          thickness={3}
          color={theme.colors.secondary}
          hideRules
          hideYAxisText
          xAxisColor={theme.colors.border}
          yAxisColor={theme.colors.border}
          rulesColor={theme.colors.border}
          dataPointsColor={theme.colors.secondaryDark}
          isAnimated
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
