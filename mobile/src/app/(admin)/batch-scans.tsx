import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { theme } from '../../constants/theme';
import { Typography } from '../../components/common/Typography';
import { Toast } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { useBatchScansQuery } from '../../hooks/useBatchScansQuery';

// The backend provides the scan data now
export interface BatchScan {
  id: string;
  transactionId: string;
  qrCode: string;
  worker: {
    id: string;
    name: string;
    avatar: string;
  };
  amount: number;
  status: 'REDEEMED' | 'FAILED' | 'FLAGGED';
  redeemedAt: string;
  location?: string;
  device?: string;
}

// -----------------------------------------------------------------------------
// UTILITIES
// -----------------------------------------------------------------------------
const getScanStatusBadge = (status: BatchScan['status']) => {
  switch (status) {
    case 'REDEEMED':
      return { icon: 'check-circle', color: theme.colors.success, label: 'Redeemed', bg: theme.colors.success + '15' };
    case 'FAILED':
      return { icon: 'x-circle', color: theme.colors.error, label: 'Failed', bg: theme.colors.error + '15' };
    case 'FLAGGED':
      return { icon: 'alert-triangle', color: theme.colors.warning, label: 'Flagged', bg: theme.colors.warning + '15' };
    default:
      return { icon: 'clock', color: theme.colors.textSecondary, label: 'Pending', bg: theme.colors.border };
  }
};

// -----------------------------------------------------------------------------
// COMPONENTS
// -----------------------------------------------------------------------------
const ScanHistoryRow = React.memo(({ item, onPress }: { item: BatchScan, onPress: (id: string) => void }) => {
  const badge = getScanStatusBadge(item.status);

  return (
    <TouchableOpacity 
      style={styles.scanRow} 
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={styles.scanRowLeft}>
        <Image source={{ uri: item.worker.avatar }} style={styles.scanAvatar} />
        <View style={styles.scanDetails}>
          <Typography weight="bold" numberOfLines={1} ellipsizeMode="tail">{item.worker.name}</Typography>
          <Typography variant="caption" style={styles.scanSubtext} numberOfLines={1} ellipsizeMode="tail">
            QR: {item.qrCode} • TX: {item.transactionId}
          </Typography>
        </View>
      </View>
      
      <View style={styles.scanRowRight}>
        <Typography variant="body" weight="bold" style={styles.scanAmount}>₹{item.amount}</Typography>
        <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
          <Feather name={badge.icon as any} size={10} color={badge.color} />
          <Typography style={[styles.statusText, { color: badge.color }]}>{badge.label}</Typography>
        </View>
        <Typography variant="caption" style={styles.scanSubtext}>{item.redeemedAt}</Typography>
      </View>
      
      <View style={styles.chevronBox}>
        <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
});

// -----------------------------------------------------------------------------
// MAIN SCREEN
// -----------------------------------------------------------------------------
export default function BatchScansHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { toastConfig, showToast, hideToast } = useToast();

  // Local State representing React Query parameters
  const [filters, setFilters] = useState({
    status: 'ALL',
    dateRange: 'ALL_TIME',
    customFrom: null,
    customTo: null,
    search: '',
    sortOrder: 'NEWEST'
  });
  
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [loadingExportType, setLoadingExportType] = useState<'pdf' | 'csv' | 'excel' | null>(null);
  const [exportStateMsg, setExportStateMsg] = useState<string>('');
  
  const { data: scansData, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useBatchScansQuery({
    filters,
  });

  const data = useMemo(() => {
    return scansData?.pages.flatMap(p => p.scans) || [];
  }, [scansData]);
  
  const FILTER_OPTIONS = ['ALL', 'REDEEMED', 'FAILED', 'FLAGGED', 'TODAY', 'THIS_WEEK', 'THIS_MONTH', 'NEWEST', 'OLDEST', 'HIGHEST REWARD', 'LOWEST REWARD'];

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const handleRowPress = useCallback((id: string) => {
    router.push(`/(admin)/batch-scan-details?id=${id}`);
  }, [router]);

  const handleExport = useCallback((type: 'pdf' | 'csv' | 'excel') => {
    setLoadingExportType(type);
    setExportStateMsg('Queued...');
    showToast('info', 'Export queued. This may take a moment.');
    showToast('Export queued. This may take a moment.', 'info');
    
    exportMutation.mutate({ id: batchId, type }, {
      onSuccess: () => {
        showToast(`Exported ${type.toUpperCase()} successfully.`, 'success');
        setExportModalVisible(false);
      },
      onError: () => {
        showToast('Export failed. Please try again.', 'error');
      }
    });
  }, [showToast, exportMutation, batchId]);

  const handleFilterPress = (opt: string) => {
    setFilters(prev => {
      if (['NEWEST', 'OLDEST', 'HIGHEST REWARD', 'LOWEST REWARD'].includes(opt)) {
        return { ...prev, sortOrder: opt };
      } else if (['TODAY', 'THIS_WEEK', 'THIS_MONTH'].includes(opt)) {
        return { ...prev, dateRange: opt };
      } else {
        return { ...prev, status: opt };
      }
    });
  };

  const SummaryCard = () => {
    const total = data.length; 
    const redeemed = data.filter(d => d.status === 'REDEEMED').length;
    const failed = data.filter(d => d.status === 'FAILED').length;
    const flagged = data.filter(d => d.status === 'FLAGGED').length;

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryStat}>
          <Typography variant="headingLg" weight="bold">{total}</Typography>
          <Typography variant="caption" style={styles.summaryLabel}>Total Scans</Typography>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryStat}>
          <Typography variant="headingLg" weight="bold" style={{ color: theme.colors.success }}>{redeemed}</Typography>
          <Typography variant="caption" style={styles.summaryLabel}>Redeemed</Typography>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryStat}>
          <Typography variant="headingLg" weight="bold" style={{ color: theme.colors.error }}>{failed}</Typography>
          <Typography variant="caption" style={styles.summaryLabel}>Failed</Typography>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryStat}>
          <Typography variant="headingLg" weight="bold" style={{ color: theme.colors.warning }}>{flagged}</Typography>
          <Typography variant="caption" style={styles.summaryLabel}>Flagged</Typography>
        </View>
      </View>
    );
  };

  const ROW_HEIGHT = 80;

  const SkeletonRow = () => (
    <View style={[styles.scanRow, styles.skeletonRow]}>
      <View style={[styles.scanAvatar, styles.skeletonBox]} />
      <View style={styles.scanDetails}>
        <View style={[styles.skeletonLine, { width: '60%', marginBottom: 6 }]} />
        <View style={[styles.skeletonLine, { width: '80%' }]} />
      </View>
      <View style={[styles.scanRowRight, { alignItems: 'flex-end' }]}>
        <View style={[styles.skeletonLine, { width: 40, height: 16, marginBottom: 8 }]} />
        <View style={[styles.skeletonLine, { width: 60, height: 16, borderRadius: 8 }]} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} accessibilityRole="button">
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Typography variant="headingLg" weight="bold" style={styles.headerTitle}>Batch Scans History</Typography>
          <Typography style={styles.headerSubtitle}>Batch ID: {batchId}</Typography>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setExportModalVisible(true)} accessibilityRole="button" accessibilityLabel="Export Scan History">
          <Feather name="download" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* STICKY SEARCH & FILTERS */}
      <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.stickyContainer}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color={theme.colors.textTertiary} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search worker, QR, TX ID..."
            placeholderTextColor={theme.colors.textTertiary}
            value={filters.search}
            onChangeText={(txt) => setFilters(prev => ({ ...prev, search: txt }))}
            returnKeyType="search"
            accessibilityLabel="Search Scans"
          />
          {filters.search.length > 0 && (
            <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, search: '' }))} hitSlop={{top:10,bottom:10,left:10,right:10}}>
              <Feather name="x-circle" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTIONS}
          keyExtractor={(item) => item}
          style={styles.filterList}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
          renderItem={({ item }) => {
            const isSelected = filters.status === item || filters.sortOrder === item || filters.dateRange === item;
            return (
              <TouchableOpacity 
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => handleFilterPress(item)}
              >
                <Typography variant="caption" weight="bold" style={[styles.filterChipText, isSelected ? styles.filterChipTextActive : undefined]}>
                  {item}
                </Typography>
              </TouchableOpacity>
            );
          }}
        />
      </Animated.View>

      {/* FLATLIST */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<SummaryCard />}
        renderItem={({ item }) => <ScanRowContainer item={item} onPress={handleRowPress} />}
        getItemLayout={(data, index) => (
          { length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index }
        )}
        refreshControl={<RefreshControl 
          refreshing={isLoading && !isFetchingNextPage} 
          onRefresh={handleRefresh} 
          tintColor={theme.colors.primary} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
        removeClippedSubviews={Platform.OS === 'android'}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Feather name="search" size={40} color={theme.colors.textTertiary} />
            <Typography variant="headingMd" weight="bold" style={{ marginTop: 16 }}>No Scans Found</Typography>
            <Typography style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
              {filters.search ? `No results found for "${filters.search}".` : "This batch has no scan history yet."}
            </Typography>
          </View>
        )}
        ListFooterComponent={() => isFetchingNextPage ? (
          <View style={{ paddingVertical: 8 }}>
            <View style={styles.card}><SkeletonRow /></View>
            <View style={styles.card}><SkeletonRow /></View>
          </View>
        ) : null}
      />

      <Modal visible={exportModalVisible} transparent animationType="slide" onRequestClose={() => setExportModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setExportModalVisible(false)}>
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.bottomSheetHandle} />
            <Typography variant="headingMd" weight="bold" style={styles.bottomSheetTitle}>Export Scan History</Typography>
            
            <TouchableOpacity style={styles.exportOpt} onPress={() => handleExport('pdf')} disabled={loadingExportType !== null}>
              <Feather name="file-text" size={20} color={theme.colors.error} style={styles.exportOptIcon} />
              <Typography weight="medium" style={styles.exportOptText}>
                {loadingExportType === 'pdf' ? exportStateMsg : 'Export as PDF'}
              </Typography>
              {loadingExportType === 'pdf' && <ActivityIndicator size="small" color={theme.colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportOpt} onPress={() => handleExport('csv')} disabled={loadingExportType !== null}>
              <Feather name="file" size={20} color={theme.colors.success} style={styles.exportOptIcon} />
              <Typography weight="medium" style={styles.exportOptText}>
                {loadingExportType === 'csv' ? exportStateMsg : 'Export as CSV'}
              </Typography>
              {loadingExportType === 'csv' && <ActivityIndicator size="small" color={theme.colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportOpt} onPress={() => handleExport('excel')} disabled={loadingExportType !== null}>
              <Feather name="grid" size={20} color={theme.colors.primary} style={styles.exportOptIcon} />
              <Typography weight="medium" style={styles.exportOptText}>
                {loadingExportType === 'excel' ? exportStateMsg : 'Export as Excel'}
              </Typography>
              {loadingExportType === 'excel' && <ActivityIndicator size="small" color={theme.colors.primary} />}
            </TouchableOpacity>

            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.exportCancelBtn} onPress={() => setExportModalVisible(false)} disabled={loadingExportType !== null}>
              <Typography weight="bold" style={{ color: theme.colors.textPrimary }}>Cancel</Typography>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Toast
        visible={toastConfig.visible}
        type={toastConfig.type}
        message={toastConfig.message}
        onHide={hideToast}
      />
    </View>
  );
}

const ScanRowContainer = React.memo(({ item, onPress }: { item: BatchScan, onPress: (id: string) => void }) => {
  return (
    <Animated.View entering={FadeInUp.springify()}>
      <View style={styles.card}>
        <ScanHistoryRow item={item} onPress={onPress} />
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  iconBtn: {
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  headerTitle: {
    textAlign: 'center',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  stickyContainer: {
    backgroundColor: theme.colors.background,
    zIndex: 10,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: theme.colors.textPrimary,
  },
  filterList: {
    flexGrow: 0,
    marginBottom: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.borderLight,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: 8,
    ...theme.shadows.sm,
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56, // Approximate to ROW_HEIGHT - padding
  },
  scanRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  scanDetails: {
    flex: 1,
    paddingRight: 8,
  },
  scanSubtext: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  scanRowRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 12,
  },
  scanAmount: {
    color: theme.colors.textPrimary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  chevronBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  skeletonRow: {
    opacity: 0.5,
  },
  skeletonBox: {
    backgroundColor: theme.colors.border,
  },
  skeletonLine: {
    backgroundColor: theme.colors.border,
    height: 12,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  bottomSheetTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  exportOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    marginBottom: 8,
  },
  exportOptIcon: {
    marginRight: 12,
  },
  exportOptText: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 12,
  },
  exportCancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
  }
});
