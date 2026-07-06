import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { theme } from '../../constants/theme';
import { Typography } from '../../components/common/Typography';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Worker, WorkerStatus, WorkerStats } from '../../types/worker';
import { WorkerCard } from '../../components/admin/WorkerCard';
import { WorkerAnalyticsCard } from '../../components/admin/WorkerAnalyticsCard';
import { WorkerSkeletonCard } from '../../components/admin/WorkerSkeletonCard';
import { useWorkersQuery } from '../../hooks/useWorkersQuery';
import { useToast } from '../../hooks/useToast';
import { RefreshControl } from 'react-native';
import { useDebounce } from '../../hooks/useDebounce';

const FILTERS = [
  { id: 'All', label: 'All', type: 'none' },
  { id: 'Active', label: 'Active', type: 'dot', color: theme.colors.success },
  { id: 'Inactive', label: 'Inactive', type: 'dot', color: theme.colors.textSecondary },
  { id: 'Top Earners', label: 'Top Earners', type: 'icon', icon: 'star' },
  { id: 'Recent', label: 'Recent', type: 'icon', icon: 'clock' }
];

// ----------------------------------------------------------------------
// SCREEN COMPONENT
// ----------------------------------------------------------------------
export default function WorkersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
  });

  const {
    data: statsData,
  } = useAdminDashboardStatsQuery();

  const dashboardStats = statsData?.stats;
  const workerStats: WorkerStats = {
    totalWorkers: dashboardStats?.totalWorkers || 0,
    activeToday: dashboardStats?.activeWorkers || 0,
    rewardsDistributed: dashboardStats?.rewardsDistributed || 0,
  };

  const debouncedSearch = useDebounce(filters.search, 500);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useWorkersQuery({
    search: debouncedSearch || undefined,
    status: filters.status,
  });

  // Handle errors
  React.useEffect(() => {
    if (isError && error) {
      showToast((error as any).response?.data?.message || 'Failed to load workers', 'error');
    }
  }, [isError, error, showToast]);

  const handleSearch = useCallback((text: string) => {
    setFilters((prev) => ({ ...prev, search: text }));
  }, []);

  const handleFilterChange = useCallback((filter: string) => {
    setFilters((prev) => ({ ...prev, status: filter }));
  }, []);

  const workers = useMemo(() => {
    return data?.pages?.flatMap(page => page.data) || [];
  }, [data]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Render Item
  const renderWorker = useCallback(({ item, index }: { item: Worker, index: number }) => (
    <WorkerCard 
      worker={item} 
      index={index}
      onView={(w) => router.push(`/(admin)/worker-details?id=${w._id}` as any)}
      onCall={(w) => console.log('Call', w._id)}
    />
  ), []);

  // Render Header
  const renderHeader = useCallback(() => (
    <View style={styles.listHeader}>
      <Animated.View entering={FadeInUp.springify()}>
        <View style={styles.headerTop}>
          <View>
            <Typography variant="headingLg" weight="bold">Workers</Typography>
            <View style={styles.subtitleRow}>
              <View style={styles.activeDot} />
              <Typography variant="caption" style={styles.subtitleText}>
                {workerStats.totalWorkers} Total Workers
              </Typography>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="bell" size={20} color={theme.colors.textPrimary} />
              <View style={styles.badge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="search" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color={theme.colors.textTertiary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search worker name..."
              placeholderTextColor={theme.colors.placeholder}
              value={filters.search}
              onChangeText={handleSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Feather name="sliders" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.chipsContainer}
          style={styles.chipsScroll}
        >
          {FILTERS.map((f, i) => {
            const isActive = filters.status === f.id;
            return (
              <TouchableOpacity 
                key={i}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => handleFilterChange(f.id)}
              >
                {f.type === 'dot' && (
                  <View style={[styles.chipDot, { backgroundColor: isActive ? theme.colors.surface : f.color }]} />
                )}
                {f.type === 'icon' && (
                  <Feather 
                    name={f.icon as any} 
                    size={14} 
                    color={isActive ? theme.colors.surface : theme.colors.textSecondary} 
                    style={{ marginRight: 6 }} 
                  />
                )}
                <Typography variant="caption" style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {f.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
      <WorkerAnalyticsCard stats={workerStats} />
    </View>
  ), [filters, handleSearch, handleFilterChange, workerStats]);

  // Render Empty State
  const renderEmptyState = useCallback(() => {
    if (isLoading) return null;
    
    const isSearchOrFilter = filters.search || filters.status !== 'All';
    
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <Feather name="users" size={32} color={theme.colors.textTertiary} />
        </View>
        <Typography variant="title" weight="bold" style={styles.emptyTitle}>
          {isSearchOrFilter ? 'No Workers Found' : 'No Workers'}
        </Typography>
        <Typography style={styles.emptySubtitle}>
          {isSearchOrFilter 
            ? 'Try adjusting your filters or search query.'
            : 'Register your first worker to begin rewarding your workforce.'}
        </Typography>
      </View>
    );
  }, [isLoading, filters]);

  return (
    <ScreenWrapper>
      <FlatList
        data={isLoading ? [] : workers}
        keyExtractor={(item) => item._id}
        renderItem={renderWorker}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl 
            refreshing={isFetching && !isFetchingNextPage} 
            onRefresh={refetch} 
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ paddingTop: theme.spacing.sm }}>
              {Array.from({ length: 8 }).map((_, i) => <WorkerSkeletonCard key={i} />)}
            </View>
          ) : isError ? (
            <View style={styles.emptyContainer}>
              <Typography style={{ color: theme.colors.error, marginBottom: 12 }}>Failed to load workers</Typography>
              <TouchableOpacity onPress={() => refetch()} style={[styles.chip, styles.chipActive]}>
                <Typography style={styles.chipTextActive}>Retry</Typography>
              </TouchableOpacity>
            </View>
          ) : renderEmptyState()
        }
        contentContainerStyle={[styles.listContent, { paddingBottom: 56 + 80 + insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        windowSize={5}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
      />

      <Animated.View entering={FadeInUp.delay(300).springify().damping(14)} style={[styles.fabContainer, { bottom: Math.max(insets.bottom + 20, 20) }]}>
        <TouchableOpacity 
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => router.push('/(admin)/register-worker' as any)}
          accessibilityRole="button"
          accessibilityLabel="Register Worker"
        >
          <Feather name="plus" size={20} color={theme.colors.surface} />
          <Typography weight="medium" style={styles.fabText}>Register Worker</Typography>
        </TouchableOpacity>
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingTop: theme.spacing.lg,
  },
  listHeader: {
    paddingBottom: theme.spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
  subtitleText: {
    color: theme.colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: 12,
    marginBottom: theme.spacing.lg,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  chipsScroll: {
    marginBottom: theme.spacing.xl,
  },
  chipsContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.colors.surface,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    marginTop: 40,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: '80%',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 100,
    ...theme.shadows.md,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    gap: 8,
  },
  fabText: {
    color: theme.colors.surface,
    fontSize: 15,
  },
});
