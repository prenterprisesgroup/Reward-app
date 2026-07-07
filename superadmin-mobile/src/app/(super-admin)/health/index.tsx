import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../constants/theme';
import { useSystemHealthQuery, useQueueMetricsQuery } from '../../../features/system-health/hooks/useSystemHealth';
import { OverallHealthWidget } from '../../../features/system-health/components/OverallHealthWidget';
import { ServiceStatusGrid } from '../../../features/system-health/components/ServiceStatusGrid';
import { SystemResources } from '../../../features/system-health/components/SystemResources';
import { QueueMetrics } from '../../../features/system-health/components/QueueMetrics';
import { AutoRefreshIndicator } from '../../../features/system-health/components/AutoRefreshIndicator';

export default function SystemHealthScreen() {
  const { refetch: refetchHealth, isRefetching: isHealthRefetching } = useSystemHealthQuery();
  const { refetch: refetchQueue, isRefetching: isQueueRefetching } = useQueueMetricsQuery();

  const isRefreshing = isHealthRefetching || isQueueRefetching;

  const onRefresh = useCallback(async () => {
    // Manual pull to refresh
    await Promise.all([refetchHealth(), refetchQueue()]);
  }, [refetchHealth, refetchQueue]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>System Health</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primaryDark]}
            tintColor={theme.colors.primaryDark}
          />
        }
      >
        <AutoRefreshIndicator />
        
        <View style={styles.content}>
          <OverallHealthWidget />
          <ServiceStatusGrid />
          <SystemResources />
          <QueueMetrics />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  screenTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for Bottom Navigation if needed
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.lg,
  }
});
