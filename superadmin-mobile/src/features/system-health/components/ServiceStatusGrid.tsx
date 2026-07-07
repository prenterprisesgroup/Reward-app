import React, { memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../../constants/theme';
import { useSystemHealthQuery } from '../hooks/useSystemHealth';
import { HealthStatus, ServiceHealthModel } from '../types/system-health.types';

const getStatusColor = (status: HealthStatus) => {
  switch (status) {
    case 'HEALTHY': return theme.colors.success;
    case 'WARNING': return theme.colors.warning;
    case 'DEGRADED': return theme.colors.warningDark;
    case 'CRITICAL': return theme.colors.error;
    default: return theme.colors.textSecondary;
  }
};

const ServiceCard = memo(({ service }: { service: ServiceHealthModel }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.serviceName}>{service.name}</Text>
      <View style={[styles.statusDot, { backgroundColor: getStatusColor(service.status) }]} />
    </View>
    <Text style={[styles.statusText, { color: getStatusColor(service.status) }]}>
      {service.status}
    </Text>
    {service.latency !== null && (
      <Text style={styles.detailText}>{service.latency}ms latency</Text>
    )}
    {service.message && (
      <Text style={styles.messageText} numberOfLines={2}>{service.message}</Text>
    )}
  </View>
));

export const ServiceStatusGrid = memo(() => {
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
        <Text style={styles.errorText}>Failed to load individual services.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Infrastructure Services</Text>
      <View style={styles.grid}>
        {data.services.map((service, index) => (
          <View key={service.name + index} style={styles.gridItem}>
            <ServiceCard service={service} />
          </View>
        ))}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  gridItem: {
    width: '50%',
    padding: theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 110,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceName: {
    ...theme.typography.body,
    fontWeight: 'bold',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    ...theme.typography.caption,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  messageText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  }
});
