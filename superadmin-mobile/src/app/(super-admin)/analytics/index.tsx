import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { theme } from '../../../constants/theme';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../api/queryKeys';
import { ScreenHeader } from '../../../components/common/ScreenHeader';

// Analytics Widgets
import { BusinessOverview } from '../../../features/analytics/components/BusinessOverview';
import { TrendChart } from '../../../features/analytics/components/TrendChart';
import { GrowthChart } from '../../../features/analytics/components/GrowthChart';
import { TopCompanies } from '../../../features/analytics/components/TopCompanies';

export default function AnalyticsScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const [rewardsY, setRewardsY] = useState(0);

  useEffect(() => {
    if (params.section === 'rewards' && rewardsY > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: rewardsY - 20, animated: true });
      }, 300);
    }
  }, [params.section, rewardsY]);

  // Independent refresh logic - ONLY invalidates analytics queries
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.trends('30d') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.trends('1y') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.growth('30d') }),
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.topCompanies('30d') }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScreenHeader title="Analytics" subtitle="Business performance overview" />
      <ScrollView 
        ref={scrollViewRef}
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
        <View style={styles.content}>
          <BusinessOverview />
          <View onLayout={(e) => setRewardsY(e.nativeEvent.layout.y)}>
            <TrendChart period={(params.period as any) || '30d'} />
          </View>
          <TopCompanies />
          <GrowthChart />
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
    paddingTop: theme.spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
});
