import React, { memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../../constants/theme';
import { useSystemHealthQuery } from '../hooks/useSystemHealth';
import { SystemResourceModel } from '../types/system-health.types';

const ResourceBar = memo(({ resource }: { resource: SystemResourceModel }) => {
  let color = theme.colors.success;
  if (resource.usagePercent > 75) color = theme.colors.warning;
  if (resource.usagePercent > 90) color = theme.colors.error;

  return (
    <View style={styles.resourceContainer}>
      <View style={styles.resourceHeader}>
        <Text style={styles.resourceLabel}>{resource.label}</Text>
        <Text style={styles.resourceText}>{resource.usedLabel} / {resource.totalLabel}</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, resource.usagePercent))}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
});

export const SystemResources = memo(() => {
  const { data, isLoading, isError } = useSystemHealthQuery();

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
        <Text style={styles.errorText}>Failed to load system resources.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Server Resources</Text>
      <View style={styles.card}>
        <ResourceBar resource={data.resources.cpu} />
        <ResourceBar resource={data.resources.memory} />
        <ResourceBar resource={data.resources.storage} />
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
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  resourceContainer: {
    width: '100%',
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resourceLabel: {
    ...theme.typography.body,
    fontWeight: '500',
  },
  resourceText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  }
});
