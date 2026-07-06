import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Typography } from '../../components/common/Typography';
import { theme } from '../../constants/theme';
import { ActivityTimelineItem } from '../../components/admin/ActivityTimelineItem';
import { useRecentActivityQuery } from '../../hooks/useRecentActivityQuery';

export default function RecentActivityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useRecentActivityQuery(20);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const flattenedData = data?.pages.flatMap(page => page.items) || [];

  const renderHeader = useCallback(() => (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerTextContainer}>
        <Typography variant="headingLg" weight="bold" style={styles.headerTitle}>Recent Activity</Typography>
        <Typography style={styles.headerSubtitle}>Latest company activities</Typography>
      </View>
    </View>
  ), [insets.top, router]);

  const renderEmpty = useCallback(() => (
    <View style={styles.centerContainer}>
      <MaterialCommunityIcons name="history" size={48} color={theme.colors.borderDark} />
      <Typography weight="bold" style={styles.emptyTitle}>No Recent Activity</Typography>
      <Typography style={styles.emptySubtitle}>Activities will appear here once workers start scanning QR codes.</Typography>
    </View>
  ), []);

  const renderError = useCallback(() => (
    <View style={styles.centerContainer}>
      <Feather name="alert-circle" size={48} color={theme.colors.error} />
      <Typography weight="bold" style={styles.emptyTitle}>Something went wrong</Typography>
      <Typography style={styles.emptySubtitle}>We couldn't load the recent activities.</Typography>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Typography style={styles.retryButtonText} weight="bold">Try Again</Typography>
      </TouchableOpacity>
    </View>
  ), [refetch]);

  const renderItem = useCallback(({ item: act, index }: { item: any, index: number }) => {
    let icon = 'qrcode-scan';
    let iconColor = theme.colors.success;
    let iconBg = theme.colors.successBackground;
    let amountColor = theme.colors.success;
    
    if (act.type === 'WITHDRAW_REQUEST') {
      icon = 'wallet-outline';
      iconColor = theme.colors.warning;
      iconBg = theme.colors.warningBackground;
      amountColor = theme.colors.warning;
    } else if (act.type === 'REWARD_DISTRIBUTED' || act.type === 'MANUAL_REWARD') {
      icon = 'gift-outline';
    }

    const mappedItem = {
      ...act,
      desc: `${act.worker || 'Unknown worker'} ${act.type.replace('_', ' ').toLowerCase()}`,
      time: new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon,
      iconColor,
      iconBg,
      amountColor,
    };

    return <ActivityTimelineItem item={mappedItem} index={index} isLast={index === flattenedData.length - 1} />;
  }, [flattenedData.length]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [isFetchingNextPage]);

  return (
    <ScreenWrapper preset="fixed" backgroundColor={theme.colors.background}>
      <View style={styles.container}>
        {renderHeader()}
        
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : isError ? (
          renderError()
        ) : (
          <View style={styles.listContainer}>
            <Animated.View entering={FadeIn.duration(400)} style={styles.cardWrapper}>
              <FlatList
                data={flattenedData}
                keyExtractor={(item) => item.id || Math.random().toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.flatListContent, { paddingBottom: insets.bottom + 80 }]}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={50}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefetching && !isFetchingNextPage}
                    onRefresh={onRefresh}
                    colors={[theme.colors.primary]}
                    tintColor={theme.colors.primary}
                  />
                }
              />
            </Animated.View>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    ...theme.shadows.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  listContainer: {
    flex: 1,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  cardWrapper: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    ...theme.shadows.sm,
    overflow: 'hidden',
  },
  flatListContent: {
    padding: theme.spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    color: theme.colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
});
