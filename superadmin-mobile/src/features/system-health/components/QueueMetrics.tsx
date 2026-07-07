import React, { memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../../constants/theme';
import { useQueueMetricsQuery } from '../hooks/useSystemHealth';
import { Clock, CheckCircle, AlertTriangle, ListFilter } from 'lucide-react-native';

const MetricBox = memo(({ label, value, color, icon: Icon }: { label: string, value: number, color: string, icon: any }) => (
  <View style={styles.metricBox}>
    <Icon size={24} color={color} style={styles.icon} />
    <Text style={[styles.metricValue, { color }]}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
));

export const QueueMetrics = memo(() => {
  const { data, isLoading, isError } = useQueueMetricsQuery();

  if (isLoading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primaryDark} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load queue metrics.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Queue Status (BullMQ)</Text>
      <View style={styles.card}>
        <View style={styles.grid}>
          <MetricBox label="Active" value={data.active} color={theme.colors.primary} icon={CheckCircle} />
          <MetricBox label="Waiting" value={data.waiting} color={theme.colors.warning} icon={ListFilter} />
          <MetricBox label="Delayed" value={data.delayed} color={theme.colors.textSecondary} icon={Clock} />
          <MetricBox label="Failed" value={data.failed} color={theme.colors.error} icon={AlertTriangle} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.totalText}>Total Jobs Processed: {data.total}</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.error + '10',
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    ...theme.typography.body,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricBox: {
    width: '50%',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    ...theme.typography.h2,
    fontWeight: 'bold',
  },
  metricLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  totalText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  }
});
