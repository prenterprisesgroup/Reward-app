import React, { memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../../constants/theme';
import { useSystemHealthQuery } from '../hooks/useSystemHealth';
import { HealthStatus } from '../types/system-health.types';
import { ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle } from 'lucide-react-native';

const getStatusColor = (status: HealthStatus) => {
  switch (status) {
    case 'HEALTHY': return theme.colors.success;
    case 'WARNING': return theme.colors.warning;
    case 'DEGRADED': return theme.colors.warningDark;
    case 'CRITICAL': return theme.colors.error;
    default: return theme.colors.textSecondary;
  }
};

const getStatusIcon = (status: HealthStatus, size = 48) => {
  const color = getStatusColor(status);
  switch (status) {
    case 'HEALTHY': return <ShieldCheck size={size} color={color} />;
    case 'WARNING': return <AlertTriangle size={size} color={color} />;
    case 'DEGRADED': return <AlertTriangle size={size} color={color} />;
    case 'CRITICAL': return <ShieldAlert size={size} color={color} />;
    default: return <HelpCircle size={size} color={color} />;
  }
};

export const OverallHealthWidget = memo(() => {
  const { data, isLoading, isError } = useSystemHealthQuery();

  if (isLoading && !data) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color={theme.colors.primaryDark} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>Failed to load system health.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          {getStatusIcon(data.overallStatus)}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>System Status</Text>
          <Text style={[styles.statusText, { color: getStatusColor(data.overallStatus) }]}>
            {data.overallStatus}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>Health Score</Text>
          <Text style={[styles.scoreValue, { color: getStatusColor(data.overallStatus) }]}>
            {data.healthScore}%
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Uptime: {data.uptimeLabel}</Text>
        <Text style={styles.footerText}>Last Sync: {data.lastUpdated.toLocaleTimeString()}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 140,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    marginRight: theme.spacing.md,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statusText: {
    ...theme.typography.h3,
    fontWeight: 'bold',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  scoreValue: {
    ...theme.typography.h2,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
    paddingTop: theme.spacing.sm,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: 'center',
  }
});
