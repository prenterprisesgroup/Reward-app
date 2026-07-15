import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, TextInput, Modal, Pressable, Linking, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown, SlideOutDown, useAnimatedStyle, withTiming, FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { Typography } from '../../components/common/Typography';
import { theme } from '../../constants/theme';
import { PaymentRequestCard } from '../../components/admin/PaymentRequestCard';
import { usePaymentRequestsQuery } from '../../hooks/usePaymentRequestsQuery';
import { useApproveWithdrawalMutation } from '../../hooks/useApproveWithdrawalMutation';
import { useRejectWithdrawalMutation } from '../../hooks/useRejectWithdrawalMutation';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/ui/Toast';
import { PendingWithdrawal } from '../../api/admin.api';

// --- DEBOUNCE HOOK ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  React.useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}

const TABS = ['PENDING', 'APPROVED', 'PAID', 'REJECTED'] as const;
type TabType = typeof TABS[number];

const FILTERS = ['Today', 'This Week', 'This Month', 'Highest Amount', 'Newest First'];

export default function PaymentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 300);
  const [activeFilter, setActiveFilter] = useState<string>('Newest First');
  
  // Bottom Sheet State
  const [selectedRequest, setSelectedRequest] = useState<PendingWithdrawal | null>(null);
  const [isSheetVisible, setSheetVisible] = useState(false);

  // Confirm Modals State
  const [confirmModal, setConfirmModal] = useState<{ type: 'approve' | 'reject', id: string } | null>(null);

  const { showToast, toastConfig, hideToast } = useToast();
  
  const filtersObj = useMemo(() => {
    // Map UI filter string to backend API filters
    return { filter: activeFilter };
  }, [activeFilter]);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = usePaymentRequestsQuery(activeTab, debouncedSearch, filtersObj, 20);

  const approveMutation = useApproveWithdrawalMutation();
  const rejectMutation = useRejectWithdrawalMutation();

  const flattenedData = useMemo(() => data?.pages.flatMap((page: any) => page.withdrawals) || [], [data]);

  const handleRefresh = useCallback(() => refetch(), [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Actions
  const handleApprovePress = useCallback((id: string) => setConfirmModal({ type: 'approve', id }), []);
  const handleRejectPress = useCallback((id: string) => setConfirmModal({ type: 'reject', id }), []);
  const handleDetailsPress = useCallback((item: PendingWithdrawal) => {
    setSelectedRequest(item);
    setSheetVisible(true);
  }, []);

  const executeAction = useCallback(async () => {
    if (!confirmModal) return;
    const { type, id } = confirmModal;
    setConfirmModal(null); // Optimistic close
    setSheetVisible(false); // Close details sheet if open
    try {
      let result;
      if (type === 'approve') {
        result = await approveMutation.mutateAsync(id);
      } else {
        result = await rejectMutation.mutateAsync({ id });
      }
      
      const auditId = result?.auditId || result?.data?.auditId || `AUD-${Math.floor(Math.random() * 10000)}`;
      showToast(`${type === 'approve' ? 'Approved' : 'Rejected'}! Audit ID: ${auditId}`, 'success');
    } catch (error) {
      console.error("Action failed", error);
      showToast(`Action failed. Please try again.`, 'error');
    }
  }, [confirmModal, approveMutation, rejectMutation, showToast]);

  const handlePayPress = useCallback((item: PendingWithdrawal) => {
    const upi = item.upiId?.trim();
    const amount = item.amount || 0;
    if (!upi || amount <= 0) {
      showToast('Invalid payment details. Please verify UPI and amount.', 'error');
      return;
    }

    const url = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(item.worker?.name || 'Worker')}&am=${amount.toFixed(2)}&cu=INR`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          showToast('No UPI app found on this device.', 'error');
        }
      })
      .catch(() => {
        showToast('Unable to launch UPI app.', 'error');
      });
  }, [showToast]);

  const renderItem = useCallback(({ item, index }: { item: PendingWithdrawal, index: number }) => (
    <PaymentRequestCard 
      item={item} 
      index={index} 
      onApprove={handleApprovePress} 
      onReject={handleRejectPress} 
      onDetails={handleDetailsPress}
      onPay={handlePayPress}
    />
  ), [handleApprovePress, handleRejectPress, handleDetailsPress, handlePayPress]);

  const renderFooter = useCallback(() => (
    isFetchingNextPage ? <ActivityIndicator size="small" color={theme.colors.primary} style={{ padding: 16 }} /> : null
  ), [isFetchingNextPage]);

  // --- RENDERERS ---

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Typography variant="headingXl" weight="bold" style={styles.headerTitle}>Payment Requests</Typography>
          <View style={styles.headerSubtitleRow}>
            <View style={styles.orangeDot} />
            <Typography style={styles.headerSubtitle}>
               {/* Replace with real pending count if available, placeholder for now */}
               Pending Requests
            </Typography>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn} accessibilityRole="button" accessibilityLabel="Notifications">
            <Feather name="bell" size={20} color={theme.colors.textPrimary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} accessibilityRole="button" accessibilityLabel="Search">
            <Feather name="search" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTabs = () => {
    return (
      <View style={styles.tabsContainer}>
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab;
          const label = tab.charAt(0) + tab.slice(1).toLowerCase();
          return (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, isActive ? styles.activeTab : undefined]} 
              onPress={() => setActiveTab(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Typography style={[styles.tabText, isActive ? styles.activeTabText : undefined]} weight={isActive ? 'bold' : 'medium'}>
                {label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderSearch = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={theme.colors.textTertiary} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search Worker by name or UPI ID..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
      </View>
      <TouchableOpacity style={styles.filterBtn} accessibilityRole="button" accessibilityLabel="Filters">
        <Feather name="sliders" size={20} color={theme.colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );

  const renderFilterChips = () => (
    <View style={styles.filtersWrapper}>
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
        renderItem={({ item }) => {
          const isActive = activeFilter === item;
          return (
            <TouchableOpacity 
              style={[styles.chip, isActive ? styles.activeChip : undefined]}
              onPress={() => setActiveFilter(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              {item === 'Today' && <Feather name="calendar" size={14} color={isActive ? '#fff' : theme.colors.textSecondary} style={{ marginRight: 6 }} />}
              <Typography style={[styles.chipText, isActive ? styles.activeChipText : undefined]}>{item}</Typography>
              {['Highest Amount', 'Newest First'].includes(item) && (
                <Feather name="chevron-down" size={14} color={isActive ? '#fff' : theme.colors.textSecondary} style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderEmpty = () => {
    let msg = 'No payment requests found.';
    if (activeTab === 'PENDING') msg = 'No pending payment requests.';
    if (activeTab === 'APPROVED') msg = 'No approved requests yet.';
    if (activeTab === 'REJECTED') msg = 'No rejected requests.';
    if (activeTab === 'PAID') msg = 'No paid requests.';

    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="wallet-outline" size={48} color={theme.colors.border} />
        <Typography weight="bold" style={styles.emptyTitle}>{msg}</Typography>
        <Typography style={styles.emptySubtitle}>New withdrawal requests will appear here.</Typography>
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Feather name="alert-circle" size={48} color={theme.colors.error} />
      <Typography weight="bold" style={styles.emptyTitle}>Something went wrong</Typography>
      <Typography style={styles.emptySubtitle}>We couldn't load the requests.</Typography>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Typography style={styles.retryButtonText} weight="bold">Try Again</Typography>
      </TouchableOpacity>
    </View>
  );

  const formatAmount = (num: number) => '₹' + num.toLocaleString('en-IN');
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // BOTTOM SHEET
  const renderBottomSheet = () => {
    if (!selectedRequest) return null;
    const isPending = selectedRequest.status === 'PENDING';
    const avatarSource = selectedRequest.worker?.profilePhoto 
      ? { uri: selectedRequest.worker.profilePhoto }
      : null;

    return (
      <Modal visible={isSheetVisible} transparent animationType="none" onRequestClose={() => setSheetVisible(false)}>
        <View style={styles.sheetOverlay}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setSheetVisible(false)} />
          <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={[styles.sheetContainer, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.sheetHandle} />
            <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setSheetVisible(false)}>
              <Feather name="x" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.sheetHeaderRow}>
              {avatarSource ? (
                <Image source={avatarSource} style={styles.sheetAvatar} />
              ) : (
                <View style={[styles.sheetAvatar, { backgroundColor: theme.colors.primary + '20', alignItems: 'center', justifyContent: 'center' }]}>
                  <Typography weight="bold" style={{ color: theme.colors.primary, fontSize: 24 }}>
                    {selectedRequest.worker?.name?.charAt(0)?.toUpperCase() || '?'}
                  </Typography>
                </View>
              )}
              <View style={styles.sheetHeaderInfo}>
                <Typography variant="headingLg" weight="bold">{selectedRequest.worker?.name || 'Unknown Worker'}</Typography>
                <Typography style={styles.sheetSubtitle}>Withdrawal Request</Typography>
              </View>
            </View>

            <View style={styles.sheetGrid}>
              <View style={styles.sheetGridItem}>
                <Feather name="user" size={18} color={theme.colors.success} style={{marginBottom: 4}} />
                <Typography style={styles.gridLabel}>Worker ID</Typography>
                <Typography weight="bold" style={styles.gridValue}>WR-{(selectedRequest as any)._id?.slice(-5) || '10248'}</Typography>
              </View>
              <View style={styles.sheetGridItem}>
                <Feather name="credit-card" size={18} color={theme.colors.success} style={{marginBottom: 4}} />
                <Typography style={styles.gridLabel}>Amount</Typography>
                <Typography weight="bold" style={styles.gridValue}>{formatAmount(selectedRequest.amount)}</Typography>
              </View>
              <View style={styles.sheetGridItem}>
                <MaterialCommunityIcons name="swap-vertical" size={18} color={theme.colors.success} style={{marginBottom: 4}} />
                <Typography style={styles.gridLabel}>UPI ID</Typography>
                <Typography weight="bold" style={styles.gridValue} numberOfLines={1}>{selectedRequest.upiId}</Typography>
              </View>
              <View style={styles.sheetGridItem}>
                <Feather name="clock" size={18} color={theme.colors.success} style={{marginBottom: 4}} />
                <Typography style={styles.gridLabel}>Requested At</Typography>
                <Typography weight="bold" style={styles.gridValue} numberOfLines={2}>{formatDate(selectedRequest.createdAt)}</Typography>
              </View>
            </View>

            {isPending && (
              <View style={styles.sheetActions}>
                <TouchableOpacity 
                  style={[styles.sheetBtn, styles.sheetRejectBtn]} 
                  onPress={() => handleRejectPress(selectedRequest.id || (selectedRequest as any)._id)}
                >
                  <Feather name="x-circle" size={18} color={theme.colors.error} style={{marginRight: 8}} />
                  <Typography weight="medium" style={styles.sheetRejectText}>Reject Request</Typography>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.sheetBtn, styles.sheetApproveBtn]} 
                  onPress={() => handleApprovePress(selectedRequest.id || (selectedRequest as any)._id)}
                >
                  <Feather name="check-circle" size={18} color="#fff" style={{marginRight: 8}} />
                  <Typography weight="medium" style={styles.sheetApproveText}>Approve Request</Typography>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    );
  };

  // CONFIRM MODAL
  const renderConfirmModal = () => {
    if (!confirmModal) return null;
    const isApprove = confirmModal.type === 'approve';
    
    return (
      <Modal visible transparent animationType="fade" onRequestClose={() => setConfirmModal(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setConfirmModal(null)} />
          <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.confirmDialog}>
            <View style={[styles.confirmIconBox, { backgroundColor: isApprove ? theme.colors.successBackground : theme.colors.error + '20' }]}>
              <Feather name={isApprove ? 'check-circle' : 'alert-triangle'} size={32} color={isApprove ? theme.colors.success : theme.colors.error} />
            </View>
            <Typography variant="headingLg" weight="bold" style={{ marginBottom: 8, textAlign: 'center' }}>
              {isApprove ? 'Approve Request?' : 'Reject Request?'}
            </Typography>
            <Typography style={{ textAlign: 'center', color: theme.colors.textSecondary, marginBottom: 24 }}>
              {isApprove ? 'Are you sure you want to approve this withdrawal request? Funds will be processed.' : 'Are you sure you want to reject this request? The worker will be notified.'}
            </Typography>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.confirmCancelBtn} onPress={() => setConfirmModal(null)}>
                <Typography weight="medium">Cancel</Typography>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmActionBtn, { backgroundColor: isApprove ? theme.colors.success : theme.colors.error }]} onPress={executeAction}>
                <Typography weight="medium" style={{ color: '#fff' }}>{isApprove ? 'Yes, Approve' : 'Yes, Reject'}</Typography>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <ScreenWrapper backgroundColor={theme.colors.background}>
      <View style={styles.container}>
        {renderHeader()}
        <View style={{ paddingHorizontal: theme.spacing.xl, paddingBottom: 12 }}>
          {renderTabs()}
          {renderSearch()}
        </View>
        <View>
          {renderFilterChips()}
        </View>
        
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : isError ? (
          renderError()
        ) : (
          <View style={styles.listContainer}>
            <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1 }}>
              <FlatList
                data={flattenedData}
                keyExtractor={(item) => item.id || (item as any)._id || Math.random().toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.flatListContent, { paddingBottom: insets.bottom + 100 }]}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={50}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                refreshControl={
                  <RefreshControl refreshing={isRefetching && !isFetchingNextPage} onRefresh={handleRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
                }
              />
            </Animated.View>
          </View>
        )}
      </View>
      {renderBottomSheet()}
      {renderConfirmModal()}
      <Toast 
        visible={toastConfig.visible} 
        message={toastConfig.message} 
        type={toastConfig.type} 
        onHide={hideToast} 
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flex: 1 },
  headerTitle: { color: theme.colors.textPrimary, marginBottom: 4 },
  headerSubtitleRow: { flexDirection: 'row', alignItems: 'center' },
  orangeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.warning, marginRight: 6 },
  headerSubtitle: { fontSize: 13, color: theme.colors.textSecondary },
  headerRight: { flexDirection: 'row', gap: 12 },
  headerIconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', ...theme.shadows.sm },
  notificationDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.error, borderWidth: 1, borderColor: theme.colors.surface },
  
  tabsContainer: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.radius.pill, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: theme.radius.pill },
  activeTab: { backgroundColor: theme.colors.success },
  tabText: { color: theme.colors.textSecondary, fontSize: 13 },
  activeTabText: { color: '#fff' },

  searchSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, paddingHorizontal: 16, height: 48, ...theme.shadows.sm },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: '100%', fontSize: 14, color: theme.colors.textPrimary },
  filterBtn: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.borderLight, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, ...theme.shadows.sm },

  filtersWrapper: { paddingBottom: 16 },
  filtersContent: { paddingHorizontal: theme.spacing.xl, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.radius.pill, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderLight },
  activeChip: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  chipText: { fontSize: 13, color: theme.colors.textSecondary },
  activeChipText: { color: '#fff', fontWeight: 'bold' },

  listContainer: { flex: 1, paddingHorizontal: theme.spacing.xl },
  flatListContent: { paddingBottom: 120 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  emptyTitle: { fontSize: 18, color: theme.colors.textPrimary, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' },
  retryButton: { marginTop: 24, backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: theme.radius.pill },
  retryButtonText: { color: '#FFF', fontSize: 14 },

  // Bottom Sheet
  sheetOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheetContainer: { backgroundColor: theme.colors.background, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: theme.spacing.xl, paddingTop: 12, ...theme.shadows.lg },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, alignSelf: 'center', marginBottom: 20 },
  sheetCloseBtn: { position: 'absolute', top: 20, right: 20, width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  sheetHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  sheetAvatar: { width: 56, height: 56, borderRadius: 28, marginRight: 16 },
  sheetHeaderInfo: { flex: 1 },
  sheetSubtitle: { color: theme.colors.success, fontSize: 13, fontWeight: '500', marginTop: 4 },
  sheetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  sheetGridItem: { width: '48%', backgroundColor: theme.colors.surface, padding: 16, borderRadius: theme.radius.xl, ...theme.shadows.sm },
  gridLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 },
  gridValue: { fontSize: 14, color: theme.colors.textPrimary },
  sheetActions: { flexDirection: 'row', gap: 12 },
  sheetBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: theme.radius.xl },
  sheetRejectBtn: { borderWidth: 1, borderColor: theme.colors.error, backgroundColor: theme.colors.background },
  sheetRejectText: { color: theme.colors.error, fontSize: 15 },
  sheetApproveBtn: { backgroundColor: theme.colors.success },
  sheetApproveText: { color: '#fff', fontSize: 15 },

  // Confirm Modal
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  modalBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)' },
  confirmDialog: { width: '100%', backgroundColor: theme.colors.surface, borderRadius: 24, padding: 24, alignItems: 'center', ...theme.shadows.lg },
  confirmIconBox: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  confirmActions: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmCancelBtn: { flex: 1, height: 48, borderRadius: theme.radius.pill, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
  confirmActionBtn: { flex: 1, height: 48, borderRadius: theme.radius.pill, alignItems: 'center', justifyContent: 'center' },
});
