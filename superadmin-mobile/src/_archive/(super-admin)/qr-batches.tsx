import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Image,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { theme } from '../../constants/theme';
import { Typography } from '../../components/common/Typography';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { QRBatchCard, QRBatch } from '../../components/admin/QRBatchCard';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { Toast } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { useBarcodeBatchesQuery } from '../../hooks/useBarcodeBatchesQuery';
import { useDuplicateBarcodeBatchMutation } from '../../hooks/useDuplicateBarcodeBatchMutation';
import { useDeleteBarcodeBatchMutation } from '../../hooks/useDeleteBarcodeBatchMutation';
import { useDownloadBatchPdfMutation } from '../../hooks/useDownloadBatchPdfMutation';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';

// -----------------------------------------------------------------------------
// DEBOUNCE HOOK (Local Architecture placeholder for backend readiness)
// -----------------------------------------------------------------------------
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}



const FILTERS = ['Active', 'Completed', 'Expired', 'Newest', 'Oldest'] as const;
type FilterOption = typeof FILTERS[number];

export default function QRBatchesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Independent Filter Architecture
  const [selectedStatus, setSelectedStatus] = useState<'ACTIVE' | 'COMPLETED' | 'EXPIRED' | null>(null);
  const [selectedSort, setSelectedSort] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mutations
  const duplicateMutation = useDuplicateBarcodeBatchMutation();
  const deleteMutation = useDeleteBarcodeBatchMutation();
  const downloadMutation = useDownloadBatchPdfMutation();

  // Modal & Toast Architecture
  const { toastConfig, showToast, hideToast } = useToast();
  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);
  const [selectedBatchForDuplicate, setSelectedBatchForDuplicate] = useState<QRBatch | null>(null);
  
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedBatchForDelete, setSelectedBatchForDelete] = useState<QRBatch | null>(null);

  // Local debounced search (Production architecture ready)
  const debouncedSearch = useDebounce(searchQuery, 300);

  // React Query Fetching
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useBarcodeBatchesQuery({
    search: debouncedSearch || undefined,
    status: selectedStatus,
    sort: selectedSort,
  });

  const batches = useMemo(() => {
    return data?.pages.flatMap(page => page.batches) || [];
  }, [data]);

  // Actions
  const handleViewDetails = useCallback((batch: QRBatch) => {
    router.push(`/(admin)/qr-batch-details?id=${batch.id}`);
  }, [router]);

  const handleDownload = useCallback((batch: QRBatch) => {
    downloadMutation.mutate({ id: batch.id, batchName: batch.batchName });
  }, [downloadMutation]);

  const handleDuplicate = useCallback((batch: QRBatch) => {
    setSelectedBatchForDuplicate(batch);
    setDuplicateModalVisible(true);
  }, []);

  const confirmDuplicateBatch = useCallback(() => {
    if (!selectedBatchForDuplicate) return;
    setDuplicateModalVisible(false);
    
    duplicateMutation.mutate(selectedBatchForDuplicate.id, {
      onSuccess: () => {
        setSelectedBatchForDuplicate(null);
      }
    });
  }, [selectedBatchForDuplicate, duplicateMutation]);

  const handleDelete = useCallback((batch: QRBatch) => {
    setSelectedBatchForDelete(batch);
    setDeleteModalVisible(true);
  }, []);

  const confirmDeleteBatch = useCallback(() => {
    if (!selectedBatchForDelete) return;
    setDeleteModalVisible(false);
    
    deleteMutation.mutate(selectedBatchForDelete.id, {
      onSuccess: () => {
        setSelectedBatchForDelete(null);
        refetch(); // Explicitly refresh list to guarantee UI sync
      }
    });
  }, [selectedBatchForDelete, deleteMutation, refetch]);

  // Calculate bottom padding properly: Bottom Navigation (approx 76) + Safe Area + FAB + margin
  const bottomNavOffset = Math.max(insets.bottom + 12, 24);
  const scrollPaddingBottom = 76 + bottomNavOffset + 80; // Extra 80 for FAB

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Typography variant="headingXl" weight="bold" numberOfLines={1} adjustsFontSizeToFit>QR Reward Batches</Typography>
            <View style={styles.subtitleRow}>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
              <Typography variant="body" style={styles.subtitle} numberOfLines={1}>{data?.pages[0]?.pagination.total || 0} Total Batches</Typography>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Notifications">
              <Feather name="bell" size={20} color={theme.colors.textPrimary} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Search">
              <Feather name="search" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={18} color={theme.colors.textTertiary} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search batch name..."
              placeholderTextColor={theme.colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} accessibilityRole="button" accessibilityLabel="Filter">
            <Feather name="sliders" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.filtersWrapper}>
          <FlatList
            horizontal
            data={FILTERS}
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
            renderItem={({ item }) => {
              let isActive = false;
              if (item === 'Active' && selectedStatus === 'ACTIVE') isActive = true;
              if (item === 'Completed' && selectedStatus === 'COMPLETED') isActive = true;
              if (item === 'Expired' && selectedStatus === 'EXPIRED') isActive = true;
              if (item === 'Newest' && selectedSort === 'NEWEST') isActive = true;
              if (item === 'Oldest' && selectedSort === 'OLDEST') isActive = true;

              let iconName = '';
              let iconColor = isActive ? '#fff' : theme.colors.textSecondary;
              
              if (item === 'Active') iconName = 'hexagon';
              if (item === 'Completed') iconName = 'check-circle';
              if (item === 'Expired') iconName = 'clock';
              if (item === 'Newest') iconName = 'arrow-up';
              if (item === 'Oldest') iconName = 'arrow-down';

              return (
                <TouchableOpacity 
                  style={[styles.chip, isActive && styles.activeChip]}
                  onPress={() => {
                    if (item === 'Active') setSelectedStatus(selectedStatus === 'ACTIVE' ? null : 'ACTIVE');
                    else if (item === 'Completed') setSelectedStatus(selectedStatus === 'COMPLETED' ? null : 'COMPLETED');
                    else if (item === 'Expired') setSelectedStatus(selectedStatus === 'EXPIRED' ? null : 'EXPIRED');
                    else if (item === 'Newest') setSelectedSort('NEWEST');
                    else if (item === 'Oldest') setSelectedSort('OLDEST');
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  {!!iconName && (
                    <Feather 
                      name={iconName as any} 
                      size={14} 
                      color={iconColor} 
                      style={{ marginRight: 6 }} 
                    />
                  )}
                  <Typography style={[styles.chipText, isActive && styles.activeChipText]} weight={isActive ? 'medium' : 'regular'}>
                    {item}
                  </Typography>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={[styles.emptyContainer, { justifyContent: 'center', minHeight: 200 }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (isError) {
      return (
        <Animated.View entering={FadeInUp.springify()} style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Feather name="alert-circle" size={48} color={theme.colors.error} style={{ marginBottom: 16 }} />
              <Typography variant="title" weight="bold" style={styles.emptyTitle}>
                Something went wrong
              </Typography>
              <Typography style={styles.emptySubtitle}>
                We couldn't load the barcode batches. Please try again.
              </Typography>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => refetch()} accessibilityRole="button">
                <Typography weight="bold" style={styles.emptyBtnText}>Retry</Typography>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      );
    }

    let title = "No QR Batches Yet";
    let subtitle = "Create your first QR reward batch and start rewarding your workers.";
    let showButton = true;

    if (debouncedSearch.length > 0) {
      title = "No matches found";
      subtitle = `We couldn't find any batches matching "${debouncedSearch}".`;
      showButton = false;
    } else if (selectedStatus !== null) {
      title = "No batches found";
      subtitle = `There are no ${selectedStatus.toLowerCase()} batches available.`;
      showButton = false;
    }

    return (
      <Animated.View entering={FadeInUp.springify()} style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <Image 
            source={require('../../../assets/images/qr_box_empty.png')} 
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <View style={styles.emptyContent}>
            <Typography variant="title" weight="bold" style={styles.emptyTitle}>
              {title}
            </Typography>
            <Typography style={styles.emptySubtitle}>
              {subtitle}
            </Typography>
            {showButton && (
              <TouchableOpacity 
                style={styles.emptyBtn} 
                accessibilityRole="button"
                onPress={() => router.push('/(admin)/create-qr-batch')}
              >
                <Typography weight="bold" style={styles.emptyBtnText}>Create First Batch</Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderItem = useCallback(({ item, index }: { item: QRBatch, index: number }) => (
    <QRBatchCard 
      batch={item} 
      index={index} 
      onViewDetails={handleViewDetails}
      onDownload={handleDownload}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      loadingAction={
        duplicateMutation.isPending && selectedBatchForDuplicate?.id === item.id ? 'duplicate' : 
        deleteMutation.isPending && selectedBatchForDelete?.id === item.id ? 'delete' : null
      }
      downloadState={downloadMutation.isPending && downloadMutation.variables?.id === item.id ? 'downloading' : null}
    />
  ), [handleViewDetails, handleDownload, handleDuplicate, handleDelete, duplicateMutation.isPending, deleteMutation.isPending, downloadMutation.isPending, downloadMutation.variables, selectedBatchForDuplicate, selectedBatchForDelete]);

  return (
    <ScreenWrapper preset="fixed" backgroundColor={theme.colors.background}>
      <View style={styles.container}>
        {renderHeader()}
        
        <FlatList
          data={batches}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: scrollPaddingBottom }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          onEndReached={() => {
            if (hasNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ padding: 20 }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          // Performance Optimizations
          removeClippedSubviews={true}
          windowSize={5}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={50}
        />
        
        {/* Floating Action Button */}
        <Animated.View 
          entering={FadeInUp.delay(300).springify()}
          style={[styles.fabContainer, { bottom: 76 + Math.max(insets.bottom, 16) }]}
        >
          <TouchableOpacity 
            style={styles.fab}
            accessibilityRole="button"
            accessibilityLabel="Create QR Batch"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => router.push('/(admin)/create-qr-batch')}
          >
            <Feather name="plus" size={20} color="#fff" />
            <Typography weight="bold" style={styles.fabText}>Create QR Batch</Typography>
          </TouchableOpacity>
        </Animated.View>

        {/* Duplicate Confirmation Modal */}
        <ConfirmationModal
          visible={duplicateModalVisible}
          title="Duplicate Batch"
          message={`Are you sure you want to duplicate the batch "${selectedBatchForDuplicate?.batchName}"?`}
          confirmText="Duplicate"
          cancelText="Cancel"
          onConfirm={confirmDuplicateBatch}
          onCancel={() => setDuplicateModalVisible(false)}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          visible={deleteModalVisible}
          title="Delete Batch"
          message={`Are you sure you want to delete the batch "${selectedBatchForDelete?.batchName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDeleteBatch}
          onCancel={() => setDeleteModalVisible(false)}
        />

        {/* Global Toast */}
        <Toast
          visible={toastConfig.visible}
          type={toastConfig.type}
          message={toastConfig.message}
          onHide={hideToast}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
    width: '100%',
  },
  headerTitleContainer: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    flexShrink: 0,
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
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  searchSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    height: 52,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: 10,
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexShrink: 0,
    ...theme.shadows.sm,
  },
  filtersWrapper: {
    marginHorizontal: -theme.spacing.lg,
  },
  filtersContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 4, // for shadow
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  activeChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.lg,
    zIndex: 100,
    ...theme.shadows.lg,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 28,
    gap: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 15,
  },
  emptyContainer: {
    paddingTop: 40,
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.lg,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.radius.lg,
    width: '100%',
    alignItems: 'center',
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 15,
  },
});
