import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteRecentActivityQuery } from '../../../features/dashboard/hooks/useInfiniteRecentActivityQuery';
import { PlatformTimelineItem } from '../../../components/super-admin/PlatformTimelineItem';
import { EmptyState } from '../../../components/common/ui/EmptyState';
import { Skeleton } from '../../../components/common/ui/Skeleton';
import { Typography } from '../../../components/common/Typography';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching
  } = useInfiniteRecentActivityQuery();

  const events = useMemo(() => {
    if (!data?.pages) return [];
    
    const allItems = data.pages.flatMap(page => page.items);
    
    return allItems.map((item, index) => {
      let iconName: any = 'activity';
      let title = 'Platform Activity';
      let subtitle = 'Unknown activity occurred';

      if (item.type === 'REWARD') {
        iconName = 'gift';
        title = 'Reward Distributed';
        subtitle = `₹${item.amount} distributed by ${item.companyName}`;
      } else if (item.type === 'WITHDRAWAL') {
        iconName = 'credit-card';
        title = `Withdrawal ${item.status}`;
        subtitle = `₹${item.amount} requested by ${item.workerName}`;
      }

      return {
        id: item.id || `activity-${index}`,
        iconName,
        title,
        subtitle,
        timeText: formatDistanceToNow(item.timestamp, { addSuffix: true }),
        isLast: index === allItems.length - 1,
        index
      };
    });
  }, [data]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <View style={styles.itemWrapper}>
      <PlatformTimelineItem
        iconName={item.iconName}
        title={item.title}
        subtitle={item.subtitle}
        timeText={item.timeText}
        isLast={item.isLast}
        index={item.index}
      />
    </View>
  ), []);

  const renderFooter = () => {
    if (!isFetchingNextPage) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primaryDark} />
      </View>
    );
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderHeader = (title: string) => (
    <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 16) }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>
      <Typography variant="title" style={styles.headerTitle}>{title}</Typography>
    </View>
  );

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.container}>
        {renderHeader('Recent Activity')}
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <View key={i} style={styles.skeletonRow}>
              <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 16 }} />
              <View style={{ flex: 1 }}>
                <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
                <Skeleton width="40%" height={12} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        {renderHeader('Recent Activity')}
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={theme.colors.error} />
          <Typography variant="body" color="error" style={{ marginTop: 16 }}>
            Failed to load recent activity.
          </Typography>
          <Typography 
            variant="body" 
            color="primaryDark" 
            weight="bold" 
            style={{ marginTop: 16 }}
            onPress={() => refetch()}
          >
            Tap to Retry
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader('Recent Activity')}
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={events.length === 0 ? styles.emptyContainer : styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState
            icon="activity"
            title="No Activity Yet"
            message="There is no recent activity on the platform."
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={refetch}
            colors={[theme.colors.primaryDark]}
            tintColor={theme.colors.primaryDark}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  backButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
  },
  itemWrapper: {
    marginBottom: 0,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonContainer: {
    padding: theme.spacing.lg,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  }
});
