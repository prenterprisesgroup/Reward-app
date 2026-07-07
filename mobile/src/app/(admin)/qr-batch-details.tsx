import React, { useState, useMemo, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  FlatList,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { theme } from '../../constants/theme';
import { Typography } from '../../components/common/Typography';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { Toast } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';
import { useBarcodeBatchDetailsQuery } from '../../hooks/useBarcodeBatchDetailsQuery';
import { useDownloadBatchPdfMutation } from '../../hooks/useDownloadBatchPdfMutation';
import { useDuplicateBarcodeBatchMutation } from '../../hooks/useDuplicateBarcodeBatchMutation';
import { useDeleteBarcodeBatchMutation } from '../../hooks/useDeleteBarcodeBatchMutation';
import { useUpdateBarcodeBatchMutation } from '../../hooks/useUpdateBarcodeBatchMutation';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native';

// -----------------------------------------------------------------------------
// PROGRESS RING COMPONENT
// -----------------------------------------------------------------------------
const ProgressRing = React.memo(({ progress, size = 100, strokeWidth = 10 }: { progress: number, size?: number, strokeWidth?: number }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          stroke={theme.colors.border}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={theme.colors.success}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Typography variant="title" weight="bold">{Math.round(clampedProgress)}%</Typography>
        <Typography variant="caption" style={{ color: theme.colors.textTertiary, fontSize: 10 }}>Progress</Typography>
      </View>
    </View>
  );
});

// -----------------------------------------------------------------------------
// RECENT SCAN ROW COMPONENT
// -----------------------------------------------------------------------------
const ScanRow = React.memo(({ item }: { item: any }) => (
  <View style={styles.scanRow}>
    <View style={styles.scanRowLeft}>
      <Image 
        source={{ uri: item.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.workerName) + '&background=E8F5E9&color=2E7D32' }} 
        style={styles.scanAvatar} 
      />
      <View style={styles.scanDetails}>
        <Typography weight="bold" numberOfLines={1} ellipsizeMode="tail">{item.workerName}</Typography>
        <Typography variant="caption" style={styles.scanSubtext} numberOfLines={1} ellipsizeMode="tail">
          QR Code: {item.qrCodeId}
        </Typography>
      </View>
    </View>
    <View style={styles.scanRowRight}>
      <View style={styles.scanAmountBadge}>
        <Typography variant="caption" weight="bold" style={styles.scanAmount}>₹{item.amount}</Typography>
      </View>
      <View style={[styles.statusPill, { backgroundColor: theme.colors.success + '15', paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 }]}>
        <Feather name="check-circle" size={10} color={theme.colors.success} />
        <Typography style={[styles.statusText, { color: theme.colors.success, fontSize: 10, marginLeft: 4 }]}>Redeemed</Typography>
      </View>
      <Typography variant="caption" style={[styles.scanSubtext, { fontSize: 10, marginTop: 2 }]}>{item.redeemedAt || item.time}</Typography>
    </View>
  </View>
));

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------------------------
const getBatchStatus = (batch: any) => {
  if (batch.status === 'DELETED') return 'Deleted';
  if (batch.status === 'ARCHIVED') return 'Archived';
  if (batch.status === 'INACTIVE') return 'Inactive';
  if (batch.status === 'COMPLETED') return 'Completed';
  if (batch.status === 'EXPIRED') return 'Expired';
  return 'Active';
};

const calculateBatchMetrics = (batch: any) => {
  const remainingCount = batch.totalQRCodes - batch.redeemedCount;
  const redemptionRate = batch.totalQRCodes > 0 ? (batch.redeemedCount / batch.totalQRCodes) * 100 : 0;
  const budget = batch.rewardPerQR * batch.totalQRCodes;
  const distributedBudget = batch.rewardPerQR * batch.redeemedCount;
  const remainingBudget = budget - distributedBudget;
  return { remainingCount, redemptionRate, budget, distributedBudget, remainingBudget };
};

// -----------------------------------------------------------------------------
// MAIN SCREEN
// -----------------------------------------------------------------------------
export default function QRBatchDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { toastConfig, showToast, hideToast } = useToast();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: batch, isLoading: isBatchLoading } = useBarcodeBatchDetailsQuery(id || '');

  const deleteMutation = useDeleteBarcodeBatchMutation();
  const duplicateMutation = useDuplicateBarcodeBatchMutation();
  const downloadMutation = useDownloadBatchPdfMutation();
  const updateMutation = useUpdateBarcodeBatchMutation();

  // Future Architecture Preparation: Edit Action
  // To implement edit functionality in the future, simply uncomment and bind this to a button.
  // const handleEdit = useCallback(() => {
  //   router.push('/(admin)/edit-qr-batch?id=' + batch?.id);
  // }, [batch?.id, router]);

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    type: 'delete' | 'archive' | 'duplicate' | null;
  }>({ visible: false, type: null });

  // Local State
  type LoadingAction = 'idle' | 'preparing_pdf' | 'downloading' | 'downloaded' | 'share_sheet' | 'duplicating' | 'sharing' | 'archiving' | 'deleting' | 'toggling';
  const [loadingAction, setLoadingAction] = useState<LoadingAction>('idle');

  // Derived Calculations
  const metrics = useMemo(() => batch ? calculateBatchMetrics(batch) : { remainingCount: 0, redemptionRate: 0, budget: 0, distributedBudget: 0, remainingBudget: 0 }, [batch]);
  const statusLabel = useMemo(() => batch ? getBatchStatus(batch) : '', [batch]);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;
  const formatNumber = (val: number) => val.toLocaleString('en-IN');

  // Handlers
  const handleAction = useCallback((action: 'duplicate' | 'archive' | 'delete') => {
    setModalConfig({ visible: true, type: action });
  }, []);

  const closeModal = useCallback(() => {
    setModalConfig({ visible: false, type: 'none' });
  }, []);

  const confirmAction = useCallback(() => {
    const type = modalConfig.type;
    closeModal();
    
    if (type === 'duplicate') setLoadingAction('duplicating');
    if (type === 'archive') setLoadingAction('archiving');
    if (type === 'delete') setLoadingAction('deleting');

    if (type === 'duplicate') {
      duplicateMutation.mutate(batch?.id || '', {
        onSuccess: () => {
          showToast('success', 'Batch duplicated successfully.');
          router.push('/(admin)/qr-batches');
        },
        onSettled: () => setLoadingAction('idle')
      });
    } else if (type === 'delete') {
      deleteMutation.mutate(batch?.id || '', {
        onSuccess: () => {
          showToast('success', 'Batch deleted successfully.');
          router.back();
        },
        onSettled: () => setLoadingAction('idle')
      });
    } else if (type === 'archive') {
      // Future archive mutation
      setLoadingAction('idle');
      showToast('success', 'Batch archived successfully.');
      router.back();
    }
  }, [modalConfig.type, closeModal, showToast, router]);

  const handleDownload = useCallback(() => {
    if (!batch) return;
    setLoadingAction('preparing_pdf');
    downloadMutation.mutate({ id: batch.id, batchName: batch.batchName || 'QR_Batch' }, {
      onSettled: () => {
        setLoadingAction('idle');
      }
    });
  }, [showToast]);

  const handleShare = useCallback(() => {
    setLoadingAction('sharing');
    setTimeout(() => {
      setLoadingAction('idle');
      showToast('success', 'Share sheet opened.');
    }, 1500);
  }, [showToast]);

  const handleViewAllScans = useCallback(() => {
    router.push('/(admin)/batch-scans');
  }, [router]);

  const handleToggleStatus = useCallback(() => {
    if (!batch) return;
    const nextStatus = batch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    setLoadingAction('toggling');
    updateMutation.mutate({
      id: batch.id,
      payload: { status: nextStatus },
    }, {
      onSuccess: () => {
        showToast('success', `Batch ${nextStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully.`);
      },
      onSettled: () => {
        setLoadingAction('idle');
      }
    });
  }, [batch, showToast, updateMutation]);

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {isBatchLoading || !batch ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Go back">
            <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Typography variant="headingLg" weight="bold" style={styles.headerTitle}>QR Batch Details</Typography>
            <Typography style={styles.headerSubtitle}>Batch ID: {batch.batchId}</Typography>
          </View>
          <TouchableOpacity style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Notifications">
            <Feather name="bell" size={20} color={theme.colors.textPrimary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* SECTION 1: HERO CARD */}
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.card}>
          <View style={styles.heroHeader}>
            <View style={[styles.heroIcon, { backgroundColor: theme.colors.success + '15' }]}>
              <MaterialCommunityIcons name="qrcode-scan" size={24} color={theme.colors.success} />
            </View>
            <View style={styles.heroTitleBox}>
              <Typography variant="headingMd" weight="bold" numberOfLines={1}>{batch.batchName}</Typography>
            </View>
            <View style={[styles.statusPill, { backgroundColor: statusLabel === 'Active' ? theme.colors.success + '15' : theme.colors.warning + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusLabel === 'Active' ? theme.colors.success : theme.colors.warning }]} />
              <Typography style={[styles.statusText, { color: statusLabel === 'Active' ? theme.colors.success : theme.colors.warning }]}>{statusLabel}</Typography>
            </View>
          </View>

          <View style={styles.heroStatsGrid}>
            <View style={styles.heroStatItem}>
              <View style={styles.heroStatHeader}>
                <Feather name="credit-card" size={14} color={theme.colors.textTertiary} />
                <Typography variant="caption" style={styles.heroStatLabel}>Reward Per QR</Typography>
              </View>
              <Typography weight="bold" style={styles.heroStatValue}>{formatCurrency(batch.rewardPerQR)}</Typography>
            </View>
            
            <View style={styles.heroStatItem}>
              <View style={styles.heroStatHeader}>
                <MaterialCommunityIcons name="qrcode" size={14} color={theme.colors.textTertiary} />
                <Typography variant="caption" style={styles.heroStatLabel}>Total QR Codes</Typography>
              </View>
              <Typography weight="bold" style={styles.heroStatValue}>{formatNumber(batch.totalQRCodes)}</Typography>
            </View>
            
            <View style={styles.heroStatItem}>
              <View style={styles.heroStatHeader}>
                <Feather name="calendar" size={14} color={theme.colors.textTertiary} />
                <Typography variant="caption" style={styles.heroStatLabel}>Created Date</Typography>
              </View>
              <Typography weight="bold" style={styles.heroStatValue} numberOfLines={1}>{batch.createdAt}</Typography>
            </View>
            
            <View style={styles.heroStatItem}>
              <View style={styles.heroStatHeader}>
                <Feather name="shield" size={14} color={theme.colors.textTertiary} />
                <Typography variant="caption" style={styles.heroStatLabel}>Status</Typography>
              </View>
              <Typography weight="bold" style={[styles.heroStatValue, { color: statusLabel === 'Active' ? theme.colors.success : theme.colors.warning }]}>{statusLabel}</Typography>
            </View>
          </View>
        </Animated.View>

        {/* SECTION 2: BATCH PROGRESS */}
        <Animated.View entering={FadeInUp.delay(150).springify()}>
          <Typography variant="title" weight="bold" style={styles.sectionTitle}>Batch Progress</Typography>
          <View style={[styles.card, styles.progressCard]}>
            <View style={styles.progressLeft}>
              <ProgressRing progress={metrics.redemptionRate} size={110} strokeWidth={12} />
            </View>
            <View style={styles.progressRight}>
              <View style={styles.progressGrid}>
                <View style={styles.progressStat}>
                  <View style={styles.progressStatIcon}>
                    <MaterialCommunityIcons name="qrcode-plus" size={16} color={theme.colors.success} />
                  </View>
                  <View>
                    <Typography variant="caption" style={styles.progressLabel}>Generated</Typography>
                    <Typography weight="bold" style={styles.progressValue}>{formatNumber(batch.generatedCount)}</Typography>
                  </View>
                </View>
                
                <View style={styles.progressStat}>
                  <View style={styles.progressStatIcon}>
                    <Feather name="file-text" size={16} color={theme.colors.warning} />
                  </View>
                  <View>
                    <Typography variant="caption" style={styles.progressLabel}>Redeemed</Typography>
                    <Typography weight="bold" style={[styles.progressValue, { color: theme.colors.warning }]}>{formatNumber(batch.redeemedCount)}</Typography>
                  </View>
                </View>

                <View style={styles.progressStat}>
                  <View style={styles.progressStatIcon}>
                    <Feather name="maximize" size={16} color={theme.colors.success} />
                  </View>
                  <View>
                    <Typography variant="caption" style={styles.progressLabel}>Remaining</Typography>
                    <Typography weight="bold" style={[styles.progressValue, { color: theme.colors.success }]}>{formatNumber(metrics.remainingCount)}</Typography>
                  </View>
                </View>

                <View style={styles.progressStat}>
                  <View style={styles.progressStatIcon}>
                    <Feather name="trending-up" size={16} color={theme.colors.success} />
                  </View>
                  <View>
                    <Typography variant="caption" style={styles.progressLabel}>Redemption Rate</Typography>
                    <Typography weight="bold" style={styles.progressValue}>{metrics.redemptionRate.toFixed(0)}%</Typography>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* SECTION 3: BUDGET CARDS */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.budgetWrap}>
          <View style={styles.budgetCard}>
            <View style={[styles.budgetIconBox, { backgroundColor: theme.colors.success + '15' }]}>
              <Feather name="database" size={16} color={theme.colors.success} />
            </View>
            <Typography variant="caption" style={styles.budgetLabel} numberOfLines={1}>Total Reward Budget</Typography>
            <Typography weight="bold" style={[styles.budgetValue, { color: theme.colors.success }]} adjustsFontSizeToFit numberOfLines={1}>{formatCurrency(metrics.budget)}</Typography>
          </View>
          
          <View style={styles.budgetCard}>
            <View style={[styles.budgetIconBox, { backgroundColor: theme.colors.warning + '15' }]}>
              <Feather name="gift" size={16} color={theme.colors.warning} />
            </View>
            <Typography variant="caption" style={styles.budgetLabel} numberOfLines={1}>Rewards Distributed</Typography>
            <Typography weight="bold" style={[styles.budgetValue, { color: theme.colors.warning }]} adjustsFontSizeToFit numberOfLines={1}>{formatCurrency(metrics.distributedBudget)}</Typography>
          </View>
          
          <View style={styles.budgetCard}>
            <View style={[styles.budgetIconBox, { backgroundColor: theme.colors.success + '15' }]}>
              <Feather name="pocket" size={16} color={theme.colors.success} />
            </View>
            <Typography variant="caption" style={styles.budgetLabel} numberOfLines={1}>Remaining Budget</Typography>
            <Typography weight="bold" style={[styles.budgetValue, { color: theme.colors.success }]} adjustsFontSizeToFit numberOfLines={1}>{formatCurrency(metrics.remainingBudget)}</Typography>
          </View>
        </Animated.View>

        {/* SECTION 4: ACTION BUTTONS */}
        <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.actionBtnPrimary, loadingAction !== 'idle' && styles.disabledOpacity]} 
            onPress={handleDownload}
            disabled={loadingAction !== 'idle'}
            accessibilityRole="button"
            accessibilityLabel="Download PDF"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="download" size={16} color="#fff" style={styles.actionBtnIcon} />
            <Typography weight="bold" style={[styles.actionBtnText, { color: '#fff' }]}>
              {loadingAction === 'preparing_pdf' ? 'Preparing...' : 
               loadingAction === 'downloading' ? 'Downloading...' : 
               loadingAction === 'downloaded' ? 'Downloaded' : 'Download PDF'}
            </Typography>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, loadingAction !== 'idle' && styles.disabledOpacity]} 
            onPress={() => handleAction('duplicate')}
            disabled={loadingAction !== 'idle'}
            accessibilityRole="button"
            accessibilityLabel="Duplicate Batch"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="copy" size={16} color={theme.colors.textSecondary} style={styles.actionBtnIcon} />
            <Typography weight="bold" style={styles.actionBtnText}>
              {loadingAction === 'duplicating' ? 'Wait...' : 'Duplicate Batch'}
            </Typography>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, loadingAction !== 'idle' && styles.disabledOpacity]} 
            onPress={handleShare}
            disabled={loadingAction !== 'idle'}
            accessibilityRole="button"
            accessibilityLabel="Share Batch"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="share-2" size={16} color={theme.colors.textSecondary} style={styles.actionBtnIcon} />
            <Typography weight="bold" style={styles.actionBtnText}>Share Batch</Typography>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionBtn, loadingAction !== 'idle' && styles.disabledOpacity]}
            onPress={handleToggleStatus}
            disabled={loadingAction !== 'idle'}
            accessibilityRole="button"
            accessibilityLabel={batch?.status === 'ACTIVE' ? 'Deactivate batch' : 'Activate batch'}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name={batch?.status === 'ACTIVE' ? 'slash' : 'check-circle'} size={16} color={theme.colors.textSecondary} style={styles.actionBtnIcon} />
            <Typography weight="bold" style={styles.actionBtnText}>
              {loadingAction === 'toggling' ? (batch?.status === 'ACTIVE' ? 'Deactivating...' : 'Activating...') : (batch?.status === 'ACTIVE' ? 'Deactivate' : 'Activate')}
            </Typography>
          </TouchableOpacity>
        </Animated.View>

        {/* SECTION 5: RECENT SCANS */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <View style={styles.sectionHeaderRow}>
            <Typography variant="title" weight="bold" style={styles.sectionTitle}>Recent Scans</Typography>
            <TouchableOpacity 
              onPress={handleViewAllScans} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Typography weight="bold" style={{ color: theme.colors.success, marginRight: 4, fontSize: 13 }}>View All</Typography>
                <Feather name="chevron-right" size={14} color={theme.colors.success} />
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.card, { padding: 0 }]}>
            <FlatList
              data={batch?.recentScans || []}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <View>
                  <ScanRow item={item} />
                  {index < (batch?.recentScans?.length || 0) - 1 && <View style={styles.divider} />}
                </View>
              )}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={5}
              removeClippedSubviews={false}
              contentContainerStyle={{ padding: theme.spacing.md }}
              ListEmptyComponent={() => (
                <View style={styles.emptyState}>
                  <Feather name="inbox" size={32} color={theme.colors.textTertiary} />
                  <Typography style={{ color: theme.colors.textSecondary, marginTop: 8 }}>No scans yet.</Typography>
                </View>
              )}
              ListFooterComponent={() => (batch?.recentScans?.length || 0) > 0 ? (
                <View style={{ height: 16 }} />
              ) : null}
            />
          </View>
        </Animated.View>

        {/* SECTION 6: BATCH INFORMATION */}
        <Animated.View entering={FadeInUp.delay(350).springify()}>
          <Typography variant="title" weight="bold" style={styles.sectionTitle}>Batch Information</Typography>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <View style={styles.infoIconBox}>
                  <Feather name="user" size={14} color={theme.colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" style={styles.infoLabel}>Created By</Typography>
                  <Typography weight="medium" style={styles.infoValue} numberOfLines={1}>{batch?.createdBy?.name || 'System Admin'}</Typography>
                </View>
              </View>
              <View style={styles.infoCol}>
                <View style={styles.infoIconBox}>
                  <Feather name="briefcase" size={14} color={theme.colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" style={styles.infoLabel}>Company</Typography>
                  <Typography weight="medium" style={styles.infoValue} numberOfLines={1}>{batch?.company?.name || batch?.companyName || 'Unknown Company'}</Typography>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRowSingle}>
              <View style={styles.infoIconBox}>
                <Feather name="file-text" size={14} color={theme.colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="caption" style={styles.infoLabel}>Description</Typography>
                <Typography weight="medium" style={styles.infoValue}>{batch.description || '-'}</Typography>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRowSingle}>
              <View style={styles.infoIconBox}>
                <Feather name="calendar" size={14} color={theme.colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="caption" style={styles.infoLabel}>Expiry Date (Optional)</Typography>
                <Typography weight="medium" style={styles.infoValue}>{batch.expiresAt || 'No expiry'}</Typography>
              </View>
            </View>
          </View>
        </Animated.View>

          </>
        )}
      </ScrollView>

      {/* SECTION 7: BOTTOM ACTIONS (STICKY FOOTER) */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity 
          style={[styles.footerBtn, batch?.status === 'ACTIVE' ? styles.footerBtnDeactivate : styles.footerBtnActivate, loadingAction !== 'idle' && styles.disabledOpacity]}
          onPress={handleToggleStatus}
          disabled={loadingAction !== 'idle'}
          accessibilityRole="button"
        >
          <Feather name={batch?.status === 'ACTIVE' ? 'slash' : 'check-circle'} size={16} color={batch?.status === 'ACTIVE' ? theme.colors.warning : theme.colors.success} style={styles.actionBtnIcon} />
          <Typography weight="bold" style={[styles.footerBtnText, { color: batch?.status === 'ACTIVE' ? theme.colors.warning : theme.colors.success }]}>
            {loadingAction === 'toggling' ? (batch?.status === 'ACTIVE' ? 'Deactivating...' : 'Activating...') : (batch?.status === 'ACTIVE' ? 'Deactivate' : 'Activate')}
          </Typography>
        </TouchableOpacity>
        <View style={{ width: 12 }} />
        <TouchableOpacity 
          style={[styles.footerBtn, styles.footerBtnDelete, loadingAction !== 'idle' && styles.disabledOpacity]}
          onPress={() => handleAction('delete')}
          disabled={loadingAction !== 'idle'}
          accessibilityRole="button"
        >
          <Feather name="trash-2" size={16} color={theme.colors.error} style={styles.actionBtnIcon} />
          <Typography weight="bold" style={[styles.footerBtnText, { color: theme.colors.error }]}>Delete Batch</Typography>
        </TouchableOpacity>
      </View>

      <ConfirmationModal
        visible={modalConfig.visible && modalConfig.type === 'archive'}
        title="Archive Batch"
        message={`Are you sure you want to archive "${batch?.batchName}"? Archiving hides it from the active list.`}
        confirmText="Archive"
        cancelText="Cancel"
        onConfirm={confirmAction}
        onCancel={closeModal}
      />

      <ConfirmationModal
        visible={modalConfig.visible && modalConfig.type === 'duplicate'}
        title="Duplicate Batch"
        message={`Duplicate "${batch?.batchName}"? This will create a new draft batch with identical settings.`}
        confirmText="Duplicate"
        cancelText="Cancel"
        onConfirm={confirmAction}
        onCancel={closeModal}
      />

      <Toast
        visible={toastConfig.visible}
        type={toastConfig.type}
        message={toastConfig.message}
        onHide={hideToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
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
  sectionTitle: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroTitleBox: {
    flex: 1,
    marginRight: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  heroStatItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  heroStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroStatLabel: {
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  heroStatValue: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLeft: {
    marginRight: theme.spacing.lg,
  },
  progressRight: {
    flex: 1,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  progressStat: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  progressStatIcon: {
    marginTop: 2,
    marginRight: 6,
  },
  progressLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  progressValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  budgetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  budgetCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  budgetIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  budgetLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  actionBtn: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  actionBtnPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  actionBtnIcon: {
    marginRight: 6,
  },
  actionBtnText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  scanAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  scanRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  scanAmountBadge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scanAmount: {
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  infoCol: {
    flex: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
  },
  infoRowSingle: {
    flexDirection: 'row',
  },
  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
  },
  footerBtnActivate: {
    borderColor: theme.colors.success + '40',
    backgroundColor: theme.colors.success + '05',
  },
  footerBtnDeactivate: {
    borderColor: theme.colors.warning + '40',
    backgroundColor: theme.colors.warning + '05',
  },
  footerBtnDelete: {
    borderColor: theme.colors.error + '40',
    backgroundColor: theme.colors.error + '05',
  },
  footerBtnText: {
    fontSize: 14,
  },
  disabledOpacity: {
    opacity: 0.5,
  },
});
