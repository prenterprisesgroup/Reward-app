import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Typography } from '../../components/common/Typography';
import { theme } from '../../constants/theme';
import { PendingWithdrawalCard } from '../../components/admin/PendingWithdrawalCard';
import { usePendingWithdrawalsQuery } from '../../hooks/usePendingWithdrawalsQuery';

export default function PendingRequestsScreen() {
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
  } = usePendingWithdrawalsQuery(20);

  const formatAmount = (num: number) => {
    return '₹' + num.toLocaleString('en-IN');
  };
  
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const flattenedData = data?.pages.flatMap(page => page.withdrawals) || [];

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
        <Typography variant="headingLg" weight="bold" style={styles.headerTitle}>Pending Requests</Typography>
        <Typography style={styles.headerSubtitle}>Review worker withdrawal requests</Typography>
      </View>
    </View>
  ), [insets.top, router]);

  const renderEmpty = useCallback(() => (
    <View style={styles.centerContainer}>
      <MaterialCommunityIcons name="wallet-outline" size={48} color={theme.colors.borderDark} />
      <Typography weight="bold" style={styles.emptyTitle}>No Pending Requests</Typography>
      <Typography style={styles.emptySubtitle}>You have approved all the worker withdrawal requests.</Typography>
    </View>
  ), []);

  const renderError = useCallback(() => (
    <View style={styles.centerContainer}>
      <Feather name="alert-circle" size={48} color={theme.colors.error} />
      <Typography weight="bold" style={styles.emptyTitle}>Something went wrong</Typography>
      <Typography style={styles.emptySubtitle}>We couldn't load the withdrawal requests.</Typography>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Typography style={styles.retryButtonText} weight="bold">Try Again</Typography>
      </TouchableOpacity>
    </View>
  ), [refetch]);

  const renderItem = useCallback(({ item: req, index }: { item: any, index: number }) => {
    const mappedItem = {
      id: req.id || req._id,
      name: req.worker?.name || 'Unknown',
      avatar: req.worker?.profilePhoto || `https://ui-avatars.com/api/?name=${req.worker?.name || 'U'}&background=random`,
      upi: req.upiId,
      amount: formatAmount(req.amount),
      time: new Date(req.createdAt).toLocaleDateString()
    };
    return <PendingWithdrawalCard item={mappedItem} index={index} isLast={index === flattenedData.length - 1} />;
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
                keyExtractor={(item) => item.id || item._id || Math.random().toString()}
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
