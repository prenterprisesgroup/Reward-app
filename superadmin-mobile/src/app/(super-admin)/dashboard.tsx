import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { DashboardHeader } from '../../components/super-admin/DashboardHeader';
import { QuickActionsSection } from '../../components/super-admin/QuickActionsSection';
import { StatsWidget } from '../../features/dashboard/components/StatsWidget';
import { ActivityWidget } from '../../features/dashboard/components/ActivityWidget';
import { WithdrawalsWidget } from '../../features/dashboard/components/WithdrawalsWidget';
import { HealthWidget } from '../../features/dashboard/components/HealthWidget';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../api/queryKeys';

// Feature Flag / Graceful Degradation Rule
type FeatureState = 'enabled' | 'disabled' | 'coming_soon';

const dashboardFeatures: Record<string, FeatureState> = {
  stats: 'enabled',
  quickActions: 'enabled',
  activity: 'enabled',
  withdrawals: 'enabled',
  systemHealth: 'enabled',
};

export default function SuperAdminDashboard() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Invalidate all dashboard related queries to trigger a refetch
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.dashboard }),
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.activity }),
      queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.pendingWithdrawals }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primaryDark]}
            tintColor={theme.colors.primaryDark}
          />
        }
      >
        <DashboardHeader />
        
        <View style={styles.content}>
          {dashboardFeatures.stats === 'enabled' && <StatsWidget />}
          
          {dashboardFeatures.quickActions === 'enabled' && <QuickActionsSection />}
          
          <View style={styles.activityAndHealthContainer}>
            {dashboardFeatures.activity === 'enabled' && <ActivityWidget />}
            {dashboardFeatures.systemHealth !== 'disabled' && <HealthWidget />}
          </View>

          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            {dashboardFeatures.withdrawals === 'enabled' && <WithdrawalsWidget />}
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for Bottom Navigation
  },
  content: {
    flex: 1,
  },
  activityAndHealthContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
  }
});
