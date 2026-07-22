import React, { useMemo, useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfinitePendingWithdrawalsQuery } from '../../../features/dashboard/hooks/useInfinitePendingWithdrawalsQuery';
import { useApproveWithdrawalMutation, useRejectWithdrawalMutation } from '../../../features/dashboard/hooks/useDashboardMutations';
import { WithdrawalListItem } from '../../../components/super-admin/WithdrawalListItem';
import { EmptyState } from '../../../components/common/ui/EmptyState';
import { Skeleton } from '../../../components/common/ui/Skeleton';
import { Typography } from '../../../components/common/Typography';
import { PrimaryButton } from '../../../components/buttons/PrimaryButton';
import { theme } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function WithdrawalsScreen() {
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
  } = useInfinitePendingWithdrawalsQuery();

  const { mutate: approve, isPending: isApproving } = useApproveWithdrawalMutation();
  const { mutate: reject, isPending: isRejecting } = useRejectWithdrawalMutation();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const withdrawals = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.items);
  }, [data]);

  const handleApprove = useCallback((id: string) => {
    Alert.alert(
      'Approve Withdrawal',
      'Are you sure you want to approve this withdrawal request? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          style: 'default',
          onPress: () => {
            setProcessingId(id);
            approve(id, {
              onSettled: () => setProcessingId(null)
            });
          }
        }
      ]
    );
  }, [approve]);

  const handleRejectInit = useCallback((id: string) => {
    setRejectingId(id);
    setRejectReason('');
    setRejectModalVisible(true);
  }, []);

  const handleRejectConfirm = useCallback(() => {
    if (!rejectingId) return;
    setProcessingId(rejectingId);
    setRejectModalVisible(false);
    
    reject({ id: rejectingId, reason: rejectReason }, {
      onSettled: () => {
        setProcessingId(null);
        setRejectingId(null);
      }
    });
  }, [rejectingId, rejectReason, reject]);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <View style={styles.itemWrapper}>
      <WithdrawalListItem
        withdrawal={item}
        isLast={index === withdrawals.length - 1}
        onApprove={() => handleApprove(item.id)}
        onReject={() => handleRejectInit(item.id)}
        isProcessing={processingId === item.id || isApproving || isRejecting}
      />
    </View>
  ), [withdrawals.length, handleApprove, handleRejectInit, processingId, isApproving, isRejecting]);

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
        {renderHeader('Pending Withdrawals')}
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <View key={i} style={styles.skeletonRow}>
              <View style={{ flex: 1 }}>
                <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
                <Skeleton width="40%" height={12} />
              </View>
              <Skeleton width={60} height={30} borderRadius={15} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        {renderHeader('Pending Withdrawals')}
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={theme.colors.error} />
          <Typography variant="body" color="error" style={{ marginTop: 16 }}>
            Failed to load withdrawals.
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
      {renderHeader('Pending Withdrawals')}
      
      <FlatList
        data={withdrawals}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={withdrawals.length === 0 ? styles.emptyContainer : styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState
            icon="check-circle"
            title="All Caught Up"
            message="There are no pending withdrawals requiring action."
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

      {/* Reject Reason Modal */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Typography variant="headingSm" style={{ marginBottom: 8 }}>
              Reject Withdrawal
            </Typography>
            <Typography variant="body" color="textSecondary" style={{ marginBottom: 16 }}>
              Please provide a reason for rejecting this withdrawal request. This will be visible to the worker.
            </Typography>

            <TextInput
              style={styles.textInput}
              placeholder="e.g. Invalid bank details"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setRejectModalVisible(false)}
              >
                <Typography variant="button" color="textSecondary">Cancel</Typography>
              </TouchableOpacity>
              
              <View style={{ flex: 1 }}>
                <PrimaryButton 
                  title="Reject"
                  onPress={handleRejectConfirm}
                  disabled={rejectReason.trim().length === 0}
                  style={{ backgroundColor: rejectReason.trim().length === 0 ? theme.colors.borderLight : theme.colors.error }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 8,
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
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
    minHeight: 100,
    marginBottom: theme.spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
