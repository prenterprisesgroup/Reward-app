import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

import { theme } from '../../constants/theme';
import { Typography } from '../../components/common/Typography';
import { Toast } from '../../components/ui/Toast';
import { useToast } from '../../hooks/useToast';

// -----------------------------------------------------------------------------
// UTILITIES
// -----------------------------------------------------------------------------
const getScanStatusBadge = (status: string) => {
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

const getTimelineStatusIcon = (status: string) => {
  switch (status) {
    case 'SUCCESS':
      return { icon: 'check', color: '#fff', bg: theme.colors.success };
    case 'FAILED':
      return { icon: 'x', color: '#fff', bg: theme.colors.error };
    case 'WARNING':
      return { icon: 'alert-triangle', color: '#fff', bg: theme.colors.warning };
    case 'PROCESSING':
      return { icon: 'loader', color: '#fff', bg: theme.colors.primary };
    default:
      return { icon: 'circle', color: theme.colors.border, bg: theme.colors.background };
  }
};

import { useBatchScanDetailsQuery } from '../../hooks/useBatchScanDetailsQuery';
import { useLocalSearchParams } from 'expo-router';

// -----------------------------------------------------------------------------
// MAIN SCREEN
// -----------------------------------------------------------------------------
export default function BatchScanDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toastConfig, showToast, hideToast } = useToast();

  const { data: scanDetails, isLoading, isError } = useBatchScanDetailsQuery(id || '');

  type ShareState = 'idle' | 'generating' | 'native_share' | 'completed';
  const [shareState, setShareState] = useState<ShareState>('idle');

  const badge = useMemo(() => getScanStatusBadge(scanDetails?.status || ''), [scanDetails?.status]);

  const handleShare = useCallback(() => {
    setShareState('generating');
    showToast('info', 'Generating report...');
    setTimeout(() => {
      setShareState('native_share');
      showToast('success', 'Opening native share sheet...');
      setTimeout(() => {
        setShareState('completed');
        setTimeout(() => setShareState('idle'), 1000);
      }, 1000);
    }, 1500);
  }, [showToast]);

  const handleViewBatch = useCallback(() => {
    // Runtime safety: we know qr-batch-details exists because we came from there or it's in the app.
    // However, if we aren't sure, we can wrap in a check. For now, it's safe.
    router.push('/(admin)/qr-batch-details');
  }, [router]);

  const handleMapAction = useCallback(() => {
    showToast('info', 'Choose Map Provider: Google Maps / Apple Maps / Copy Coordinates');
    // Future: ActionSheet for Map Providers
  }, [showToast]);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} accessibilityRole="button">
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Typography variant="headingSm" weight="bold">Scan Details</Typography>
        <TouchableOpacity onPress={handleShare} style={styles.iconBtn} accessibilityRole="button" disabled={shareState !== 'idle'}>
          {shareState === 'generating' ? (
            <ActivityIndicator size="small" color={theme.colors.textPrimary} />
          ) : (
            <Feather name={shareState === 'completed' ? 'check' : 'share-2'} size={20} color={theme.colors.textPrimary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {scanDetails && (
          <>
            {/* HERO CARD */}
            <Animated.View entering={FadeInUp.delay(100).springify()} style={[styles.card, styles.heroCard]}>
              <Typography variant="caption" style={styles.heroSubLabel}>Amount</Typography>
              <Typography weight="bold" style={styles.heroAmount}>{formatCurrency(scanDetails.amount)}</Typography>
              
              <View style={[styles.statusPill, { backgroundColor: badge.bg, marginVertical: 12 }]}>
                <Feather name={badge.icon as any} size={14} color={badge.color} />
                <Typography weight="bold" style={[styles.statusText, { color: badge.color, fontSize: 12 }]}>{badge.label}</Typography>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.heroDetailsGrid}>
                <View style={styles.heroDetailItem}>
                  <Typography variant="caption" style={styles.heroDetailLabel}>Transaction ID</Typography>
                  <Typography weight="medium" style={styles.heroDetailValue} numberOfLines={1}>{scanDetails.transactionId}</Typography>
                </View>
                <View style={styles.heroDetailItem}>
                  <Typography variant="caption" style={styles.heroDetailLabel}>Redeemed Time</Typography>
                  <Typography weight="medium" style={styles.heroDetailValue} numberOfLines={1}>{scanDetails.redeemedAt}</Typography>
                </View>
              </View>
            </Animated.View>

            {/* WORKER CARD */}
            <Animated.View entering={FadeInUp.delay(150).springify()}>
              <Typography variant="title" weight="bold" style={styles.sectionTitle}>Worker Profile</Typography>
              <View style={styles.card}>
                <View style={styles.workerRow}>
                  <Image source={{ uri: scanDetails.worker.avatar }} style={styles.workerAvatar} />
                  <View style={styles.workerInfo}>
                    <Typography variant="body" weight="bold">{scanDetails.worker.name}</Typography>
                    <Typography variant="caption" style={styles.workerSubtext}>ID: {scanDetails.worker.id}</Typography>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRowGrid}>
                  <View style={styles.infoCol}>
                    <Typography variant="caption" style={styles.infoLabel}>Phone</Typography>
                    <Typography weight="medium" style={styles.infoValue}>{scanDetails.worker.phone || 'N/A'}</Typography>
                  </View>
                  <View style={styles.infoCol}>
                    <Typography variant="caption" style={styles.infoLabel}>Registered Company</Typography>
                    <Typography weight="medium" style={styles.infoValue} numberOfLines={1}>{scanDetails.worker.company}</Typography>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* LOCATION & DEVICE CARD */}
            <Animated.View entering={FadeInUp.delay(200).springify()}>
              <Typography variant="title" weight="bold" style={styles.sectionTitle}>Scan Context</Typography>
              <View style={styles.card}>
                <View style={styles.infoRowGrid}>
                  <View style={styles.infoCol}>
                    <View style={styles.iconLabelRow}>
                      <Feather name="smartphone" size={14} color={theme.colors.textSecondary} />
                      <Typography variant="caption" style={styles.infoLabelIcon}>Device</Typography>
                    </View>
                    <Typography weight="medium" style={styles.infoValue}>{scanDetails.device.model}</Typography>
                    <Typography variant="caption" style={styles.subValue}>{scanDetails.device.platform} • v{scanDetails.device.appVersion}</Typography>
                  </View>
                  
                  <View style={styles.infoCol}>
                    <View style={styles.iconLabelRow}>
                      <Feather name="map-pin" size={14} color={theme.colors.textSecondary} />
                      <Typography variant="caption" style={styles.infoLabelIcon}>Location</Typography>
                    </View>
                    <Typography weight="medium" style={styles.infoValue}>{scanDetails.location.city}</Typography>
                    <Typography variant="caption" style={styles.subValue}>{scanDetails.location.state}</Typography>
                  </View>
                </View>
                
                <View style={styles.divider} />
                
                <TouchableOpacity style={styles.outlineBtn} onPress={handleMapAction} accessibilityRole="button">
                  <Feather name="map" size={16} color={theme.colors.textPrimary} style={{ marginRight: 8 }} />
                  <Typography weight="bold" style={{ color: theme.colors.textPrimary }}>Open Maps</Typography>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* BATCH REFERENCE */}
            <Animated.View entering={FadeInUp.delay(250).springify()}>
              <Typography variant="title" weight="bold" style={styles.sectionTitle}>Batch Reference</Typography>
              <View style={styles.card}>
                <View style={styles.infoRowGrid}>
                  <View style={styles.infoCol}>
                    <Typography variant="caption" style={styles.infoLabel}>Batch Name</Typography>
                    <Typography weight="bold" style={styles.infoValue}>{scanDetails.batch.batchName}</Typography>
                    <Typography variant="caption" style={styles.subValue}>ID: {scanDetails.batch.batchId}</Typography>
                  </View>
                  <View style={styles.infoCol}>
                    <Typography variant="caption" style={styles.infoLabel}>Reward Per QR</Typography>
                    <Typography weight="bold" style={styles.infoValue}>{formatCurrency(scanDetails.batch.rewardPerQR)}</Typography>
                    <View style={[styles.statusPill, { backgroundColor: theme.colors.success + '15', alignSelf: 'flex-start', marginTop: 4 }]}>
                      <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                      <Typography style={[styles.statusText, { color: theme.colors.success, fontSize: 10 }]}>{scanDetails.batch.status}</Typography>
                    </View>
                  </View>
                </View>
                
                <View style={styles.divider} />
                
                <TouchableOpacity style={styles.primaryBtn} onPress={handleViewBatch}>
                  <Typography weight="bold" style={{ color: '#fff' }}>Open Batch Details</Typography>
                  <Feather name="arrow-right" size={16} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* TIMELINE */}
            <Animated.View entering={FadeInUp.delay(300).springify()}>
              <Typography variant="title" weight="bold" style={styles.sectionTitle}>Scan Lifecycle</Typography>
              <View style={[styles.card, { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.xl }]}>
                {scanDetails.timeline.map((event, index) => {
                  const isLast = index === scanDetails.timeline.length - 1;
                  const statusBadge = getTimelineStatusIcon(event.status);
                  
                  return (
                    <View key={event.id} style={styles.timelineRow}>
                      <View style={styles.timelineIconCol}>
                        <View style={[styles.timelineDotWrapper, { backgroundColor: statusBadge.bg, borderColor: statusBadge.bg === theme.colors.background ? theme.colors.border : statusBadge.bg }]}>
                          <Feather name={statusBadge.icon as any} size={10} color={statusBadge.color} />
                        </View>
                        {!isLast && <View style={[styles.timelineLine, { backgroundColor: event.status === 'PENDING' ? theme.colors.borderLight : theme.colors.primary + '40' }]} />}
                      </View>
                      <View style={styles.timelineContent}>
                        <Typography weight="bold" style={styles.timelineTitle}>{event.title}</Typography>
                        <Typography variant="caption" style={styles.timelineDesc}>{event.description}</Typography>
                        <Typography variant="caption" style={styles.timelineTime}>{event.time}</Typography>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Animated.View>

            {/* ACTIVITY LOG */}
            <Animated.View entering={FadeInUp.delay(350).springify()}>
              <Typography variant="title" weight="bold" style={styles.sectionTitle}>Activity Log</Typography>
              <View style={[styles.card, { paddingVertical: theme.spacing.md }]}>
                {scanDetails.activityLog.map((log, index) => (
                  <View key={log.id} style={styles.activityLogRow}>
                    <Typography variant="caption" weight="medium" style={styles.activityLogTime}>{log.time}</Typography>
                    <Typography variant="body" style={styles.activityLogAction}>{log.action}</Typography>
                  </View>
                ))}
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
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
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  heroSubLabel: {
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 40,
    lineHeight: 48,
    color: theme.colors.textPrimary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
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
    marginLeft: 6,
  },
  heroDetailsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  heroDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroDetailLabel: {
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  heroDetailValue: {
    color: theme.colors.textPrimary,
    fontSize: 13,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.md,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  workerInfo: {
    flex: 1,
  },
  workerSubtext: {
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  infoRowGrid: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  infoCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  subValue: {
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabelIcon: {
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineIconCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 16,
  },
  timelineDotWrapper: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 2,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: -2,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
    paddingLeft: 4,
  },
  timelineTitle: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  timelineDesc: {
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  timelineTime: {
    color: theme.colors.textTertiary,
    fontSize: 11,
  },
  activityLogRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  activityLogTime: {
    width: 60,
    color: theme.colors.textSecondary,
    fontFamily: 'Inter-Medium',
  },
  activityLogAction: {
    flex: 1,
    color: theme.colors.textPrimary,
  }
});
