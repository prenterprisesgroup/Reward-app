import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, TextInput, Linking, Platform, Alert, ToastAndroid } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/common/Typography';
import { Card } from '../../components/cards/Card';
import { theme } from '../../constants/theme';
import { WorkerPaymentRequestCard } from '../../components/worker/WorkerPaymentRequestCard';
import { useWorkerPaymentRequestsQuery } from '../../hooks/useWorkerPaymentRequestsQuery';
import { WorkerWithdrawal } from '../../hooks/useWorkerPaymentRequestsQuery';
import { BottomNavigation } from '../../components/navigation/BottomNavigation';

const TABS = ['PENDING', 'APPROVED', 'PAID', 'REJECTED'] as const;
type TabType = typeof TABS[number];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  React.useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}

export default function WorkerPaymentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 300);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useWorkerPaymentRequestsQuery(activeTab, debouncedSearch, 20);

  const flattenedData = useMemo(() => data?.pages.flatMap(page => page.withdrawals) || [], [data]);

  const handleRefresh = useCallback(() => refetch(), [refetch]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handlePayPress = useCallback((item: WorkerWithdrawal) => {
    const upi = item.upiId?.trim();
    const amount = item.amount || 0;
    
    if (!upi || amount <= 0) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Invalid payment details. Please verify UPI and amount.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Invalid payment details. Please verify UPI and amount.');
      }
      return;
    }

    const url = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent('Reward Payout')}&am=${amount.toFixed(2)}&cu=INR`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          if (Platform.OS === 'android') {
            ToastAndroid.show('No UPI app found on this device.', ToastAndroid.SHORT);
          } else {
            Alert.alert('Error', 'No UPI app found on this device.');
          }
        }
      })
      .catch(() => {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Unable to launch UPI app.', ToastAndroid.SHORT);
        } else {
          Alert.alert('Error', 'Unable to launch UPI app.');
        }
      });
  }, []);

  const renderItem = useCallback(({ item, index }: { item: WorkerWithdrawal, index: number }) => (
    <WorkerPaymentRequestCard 
      item={item} 
      index={index}
      onPay={handlePayPress}
    />
  ), [handlePayPress]);

  const renderFooter = useCallback(() => (
    isFetchingNextPage ? <ActivityIndicator size="small" color={theme.colors.primary} style={{ padding: 16 }} /> : null
  ), [isFetchingNextPage]);

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <Typography style={styles.headerTitle}>Payment Requests</Typography>
          <View style={styles.headerSubtitleRow}>
            <View style={styles.orangeDot} />
            <Typography style={styles.headerSubtitle}>View your withdrawal requests</Typography>
          </View>
        </View>
        <TouchableOpacity style={styles.headerIconBtn} accessibilityRole="button" accessibilityLabel="Notifications">
          <Feather name="bell" size={20} color={theme.colors.textPrimary} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => {
    return (
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const label = tab.charAt(0) + tab.slice(1).toLowerCase();
          return (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, isActive && styles.activeTab]} 
              onPress={() => setActiveTab(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Typography style={[styles.tabText, isActive && styles.activeTabText]} weight={isActive ? 'bold' : 'medium'}>
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
          placeholder="Search by UPI ID..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
      </View>
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
        <MaterialCommunityIcons name="wallet-outline" size={48} color={theme.colors.borderDark} />
        <Typography weight="bold" style={styles.emptyTitle}>{msg}</Typography>
        <Typography style={styles.emptySubtitle}>New requests will appear here.</Typography>
      </View>
    );
  };

  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Feather name="alert-circle" size={48} color={theme.colors.error} />
      <Typography weight="bold" style={styles.emptyTitle}>Something went wrong</Typography>
      <Typography style={styles.emptySubtitle}>We couldn't load your requests.</Typography>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Typography style={styles.retryButtonText} weight="bold">Try Again</Typography>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <FlatList
        data={flattenedData}
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            {renderHeader()}
            <View style={{ paddingHorizontal: theme.spacing.xl, paddingBottom: 12 }}>
              {renderTabs()}
              {renderSearch()}
            </View>
          </>
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={isError ? renderError : renderEmpty}
        contentContainerStyle={[
          isLoading && { flex: 1 },
          { paddingHorizontal: theme.spacing.xl, paddingBottom: Math.max(insets.bottom + 80, 100) }
        ]}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {isLoading && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  header: { 
    paddingHorizontal: theme.spacing.xl, 
    paddingBottom: 16 
  },
  headerTop: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: theme.colors.surface, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12
  },
  headerLeft: { flex: 1 },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: theme.colors.textPrimary,
    marginBottom: 4
  },
  headerSubtitleRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  orangeDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: theme.colors.warning,
    marginRight: 6
  },
  headerSubtitle: { 
    fontSize: 13, 
    color: theme.colors.textSecondary 
  },
  headerIconBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: theme.colors.surface, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  notificationDot: { 
    position: 'absolute', 
    top: 10, 
    right: 10, 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: theme.colors.error 
  },
  tabsContainer: { 
    flexDirection: 'row', 
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    padding: 4,
    marginBottom: 16
  },
  tab: { 
    flex: 1, 
    paddingVertical: 12, 
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeTab: { 
    backgroundColor: theme.colors.primary 
  },
  tabText: { 
    fontSize: 13, 
    color: theme.colors.textSecondary 
  },
  activeTabText: { 
    color: '#fff' 
  },
  searchSection: { 
    marginBottom: 16 
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44
  },
  searchIcon: { 
    marginRight: 8 
  },
  searchInput: { 
    flex: 1, 
    fontSize: 14, 
    color: theme.colors.textPrimary 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 40
  },
  emptyTitle: { 
    fontSize: 16, 
    color: theme.colors.textPrimary,
    marginTop: 16,
    textAlign: 'center'
  },
  emptySubtitle: { 
    fontSize: 14, 
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center'
  },
  retryButton: { 
    marginTop: 24,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12
  },
  retryButtonText: { 
    color: '#fff',
    fontSize: 14
  },
  centerContent: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)'
  }
});
