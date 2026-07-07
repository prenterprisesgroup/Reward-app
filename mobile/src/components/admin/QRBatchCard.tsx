import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';

export interface QRBatch {
  id: string;
  batchId: string;
  batchName: string;
  companyId: string;
  companyName: string;
  rewardPerQR: number;
  totalQRCodes: number;
  generatedCount: number;
  redeemedCount: number;
  remainingCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string | null;
  pdfUrl: string | null;
  createdBy: {
      id: string;
      name: string;
  }
}

interface QRBatchCardProps {
  batch: QRBatch;
  index: number;
  onViewDetails: (batch: QRBatch) => void;
  onDownload: (batch: QRBatch) => void;
  onDuplicate: (batch: QRBatch) => void;
  onDelete?: (batch: QRBatch) => void;
  onToggle?: (batch: QRBatch) => void;
  loadingAction?: 'download' | 'duplicate' | 'delete' | 'toggle' | null;
  downloadState?: 'preparing' | 'downloading' | 'completed' | 'failed' | null;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatAmount = (num: number) => {
  return '₹' + num.toLocaleString('en-IN');
};

const formatNumber = (num: number) => {
  return num.toLocaleString('en-US');
};

export const QRBatchCard = React.memo(({ 
  batch, 
  index, 
  onViewDetails, 
  onDownload, 
  onDuplicate,
  onDelete,
  onToggle,
  loadingAction,
  downloadState
}: QRBatchCardProps) => {
  
  let statusColor = theme.colors.textSecondary;
  let statusBg = theme.colors.border;
  
  if (batch.status === 'ACTIVE') {
    statusColor = theme.colors.success;
    statusBg = theme.colors.successBackground;
  } else if (batch.status === 'INACTIVE') {
    statusColor = theme.colors.textSecondary;
    statusBg = theme.colors.border;
  } else if (batch.status === 'COMPLETED') {
    statusColor = theme.colors.info;
    statusBg = theme.colors.infoBackground;
  } else if (batch.status === 'EXPIRED') {
    statusColor = theme.colors.warning;
    statusBg = theme.colors.warningBackground;
  }

  // Statistics Calculation & Validation
  let safeRemaining = batch.remainingCount;
  const expectedRemaining = batch.totalQRCodes - batch.redeemedCount;
  
  if (batch.remainingCount !== expectedRemaining) {
    console.warn(`[Data Inconsistency] Batch ${batch.batchId} remainingCount (${batch.remainingCount}) does not match expected (${expectedRemaining}). Rendering backend value.`);
  }

  if (safeRemaining < 0) {
    console.warn(`[Data Integrity] Batch ${batch.batchId} has negative remaining count (${safeRemaining}). Defaulting to 0 for UI safety.`);
    safeRemaining = 0;
  }

  const safeStatusText = typeof batch.status === 'string' 
    ? batch.status.charAt(0) + batch.status.slice(1).toLowerCase() 
    : 'Unknown';

  let downloadButtonText = 'Download PDF';
  if (downloadState === 'preparing') downloadButtonText = 'Preparing...';
  if (downloadState === 'downloading') downloadButtonText = 'Downloading...';
  if (downloadState === 'completed') downloadButtonText = 'Downloaded';
  if (downloadState === 'failed') downloadButtonText = 'Failed';

  return (
    <Animated.View 
      entering={FadeInUp.delay((index % 8) * 50).springify()} 
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="qrcode-scan" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Typography variant="bodyLarge" weight="bold" style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {batch.batchName}
            </Typography>
            <Typography variant="caption" style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
              Batch ID: {batch.batchId}
            </Typography>
            <View style={styles.dateRow}>
              <Feather name="calendar" size={12} color={theme.colors.textTertiary} />
              <Typography variant="caption" style={styles.dateText} numberOfLines={1}>
                Created: {formatDate(batch.createdAt)}
              </Typography>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.badge, { backgroundColor: statusBg }]}>
            <View style={[styles.badgeDot, { backgroundColor: statusColor }]} />
            <Typography variant="caption" weight="medium" style={[styles.badgeText, { color: statusColor }]} numberOfLines={1}>
              {safeStatusText}
            </Typography>
          </View>
          <View style={styles.rewardBadge}>
            <MaterialCommunityIcons name="cash" size={14} color={theme.colors.success} />
            <Typography variant="caption" weight="medium" style={styles.rewardText} numberOfLines={1}>
              {formatAmount(batch.rewardPerQR)} per QR
            </Typography>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Typography variant="caption" style={styles.statLabel}>Total QR Codes</Typography>
          <Typography variant="bodyLarge" weight="bold" style={styles.statValue}>
            {formatNumber(batch.totalQRCodes)}
          </Typography>
        </View>
        <View style={styles.statItem}>
          <Typography variant="caption" style={styles.statLabel}>Generated</Typography>
          <Typography variant="bodyLarge" weight="bold" style={[styles.statValue, { color: theme.colors.success }]}>
            {formatNumber(batch.generatedCount)}
          </Typography>
        </View>
        <View style={styles.statItem}>
          <Typography variant="caption" style={styles.statLabel}>Redeemed</Typography>
          <Typography variant="bodyLarge" weight="bold" style={[styles.statValue, { color: theme.colors.warning }]}>
            {formatNumber(batch.redeemedCount)}
          </Typography>
        </View>
        <View style={styles.statItem}>
          <Typography variant="caption" style={styles.statLabel}>Remaining</Typography>
          <Typography variant="bodyLarge" weight="bold" style={[styles.statValue, { color: theme.colors.success }]}>
            {formatNumber(safeRemaining)}
          </Typography>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => onViewDetails(batch)}
          accessibilityRole="button"
          accessibilityLabel="View Details"
          hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
        >
        <Feather name="eye" size={20} color={theme.colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionBtn}
        onPress={() => onDownload(batch)}
        accessibilityRole="button"
        accessibilityLabel="Download PDF"
        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
        disabled={loadingAction === 'download' || downloadState === 'preparing' || downloadState === 'downloading'}
      >
        {loadingAction === 'download' || downloadState === 'preparing' || downloadState === 'downloading' ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : downloadState === 'completed' ? (
          <Feather name="check" size={20} color={theme.colors.success} />
        ) : (
          <Feather name="download" size={20} color={theme.colors.primary} />
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionBtn}
        onPress={() => onDuplicate(batch)}
        accessibilityRole="button"
        accessibilityLabel="Duplicate Batch"
        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
        disabled={loadingAction === 'duplicate' || loadingAction === 'delete'}
      >
        {loadingAction === 'duplicate' ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Feather name="copy" size={16} color={theme.colors.primary} />
        )}
        <Typography variant="caption" weight="medium" style={styles.actionText} numberOfLines={1} adjustsFontSizeToFit>
          Copy
        </Typography>
      </TouchableOpacity>

      {onDelete && (
        <TouchableOpacity 
          style={[styles.actionBtn, { borderColor: theme.colors.error }]}
          onPress={() => onDelete(batch)}
          accessibilityRole="button"
          accessibilityLabel="Delete Batch"
          hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
          disabled={loadingAction === 'delete' || loadingAction === 'duplicate' || loadingAction === 'toggle'}
        >
          {loadingAction === 'delete' ? (
            <ActivityIndicator size="small" color={theme.colors.error} />
          ) : (
            <Feather name="trash-2" size={16} color={theme.colors.error} />
          )}
          <Typography variant="caption" weight="medium" style={[styles.actionText, { color: theme.colors.error }]} numberOfLines={1} adjustsFontSizeToFit>
            Delete
          </Typography>
        </TouchableOpacity>
      )}

      {onToggle && (
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: batch.status === 'ACTIVE' ? theme.colors.warning : theme.colors.success }]}
            onPress={() => onToggle(batch)}
            accessibilityRole="button"
            accessibilityLabel={batch.status === 'ACTIVE' ? 'Deactivate Batch' : 'Activate Batch'}
            hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            disabled={loadingAction === 'toggle' || loadingAction === 'delete' || loadingAction === 'duplicate'}
          >
            {loadingAction === 'toggle' ? (
              <ActivityIndicator size="small" color={batch.status === 'ACTIVE' ? theme.colors.warning : theme.colors.success} />
            ) : (
              <Feather name={batch.status === 'ACTIVE' ? 'slash' : 'check-circle'} size={16} color={batch.status === 'ACTIVE' ? theme.colors.warning : theme.colors.success} />
            )}
            <Typography variant="caption" weight="medium" style={[styles.actionText, { color: batch.status === 'ACTIVE' ? theme.colors.warning : theme.colors.success }]} numberOfLines={1} adjustsFontSizeToFit>
              {batch.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </Typography>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
    paddingRight: theme.spacing.sm,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  title: {
    color: theme.colors.textPrimary,
    marginBottom: 4,
    flexShrink: 1,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginBottom: 4,
    flexShrink: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  dateText: {
    color: theme.colors.textTertiary,
    flexShrink: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 0,
    maxWidth: '45%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  rewardText: {
    color: theme.colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.divider,
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: theme.colors.textTertiary,
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 10,
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    minHeight: 48,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    gap: 4,
  },
  actionText: {
    color: theme.colors.primary,
    flexShrink: 1,
  }
});
