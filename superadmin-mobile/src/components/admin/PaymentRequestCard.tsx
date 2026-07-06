import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';
import { PendingWithdrawal } from '../../api/admin.api';

interface PaymentRequestCardProps {
  item: PendingWithdrawal;
  index: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDetails: (item: PendingWithdrawal) => void;
}

const formatAmount = (num: number) => {
  return '₹' + num.toLocaleString('en-IN');
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  
  if (isToday) {
    return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const PaymentRequestCard = React.memo(({ item, index, onApprove, onReject, onDetails }: PaymentRequestCardProps) => {
  const isPending = item.status === 'PENDING';
  
  let statusColor = theme.colors.warning;
  let statusBg = theme.colors.warningBackground;
  let statusText = 'Pending';

  if (item.status === 'APPROVED') {
    statusColor = theme.colors.success;
    statusBg = theme.colors.successBackground;
    statusText = 'Approved';
  } else if (item.status === 'REJECTED') {
    statusColor = theme.colors.error;
    statusBg = theme.colors.error + '20'; // light red
    statusText = 'Rejected';
  } else if (item.status === 'PAID') {
    statusColor = theme.colors.primary;
    statusBg = theme.colors.primary + '20';
    statusText = 'Paid';
  }

  const avatarSource = item.worker?.profilePhoto 
    ? { uri: item.worker.profilePhoto }
    : null;

  return (
    <Animated.View entering={FadeInUp.delay((index % 10) * 50).springify()} style={styles.card}>
      <View style={styles.topSection}>
        <View style={styles.leftContent}>
          <View style={styles.avatarContainer}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Typography weight="bold" style={styles.avatarFallbackText}>
                  {item.worker?.name?.charAt(0)?.toUpperCase() || '?'}
                </Typography>
              </View>
            )}
          </View>
          <View style={styles.infoBlock}>
            <Typography weight="bold" style={styles.name} numberOfLines={1}>{item.worker?.name || 'Unknown Worker'}</Typography>
            <Typography style={styles.upi} numberOfLines={1}>UPI: {item.upiId}</Typography>
            <View style={styles.companyRow}>
              <MaterialCommunityIcons name="office-building-outline" size={14} color={theme.colors.textTertiary} />
              <Typography style={styles.companyName} numberOfLines={1}>PR Enterprises</Typography>
            </View>
          </View>
        </View>

        <View style={styles.rightContent}>
          <Typography variant="headingMd" weight="bold" style={styles.amount}>{formatAmount(item.amount)}</Typography>
          <Typography style={styles.time}>{formatDate(item.createdAt)}</Typography>
          <View style={[styles.badge, { backgroundColor: statusBg }]}>
            <Typography weight="medium" style={[styles.badgeText, { color: statusColor }]}>{statusText}</Typography>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {isPending ? (
          <>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.approveBtn]} 
              onPress={() => onApprove(item.id || (item as any)._id)}
              accessibilityRole="button"
              accessibilityLabel="Approve Request"
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <Feather name="check-circle" size={16} color={theme.colors.success} />
              <Typography style={styles.approveText} weight="medium">Approve</Typography>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.rejectBtn]} 
              onPress={() => onReject(item.id || (item as any)._id)}
              accessibilityRole="button"
              accessibilityLabel="Reject Request"
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <Feather name="x-circle" size={16} color={theme.colors.error} />
              <Typography style={styles.rejectText} weight="medium">Reject</Typography>
            </TouchableOpacity>
          </>
        ) : null}

        <TouchableOpacity 
          style={[styles.actionBtn, styles.detailsBtn, !isPending && { flex: 1 }]} 
          onPress={() => onDetails(item)}
          accessibilityRole="button"
          accessibilityLabel="View Details"
          hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
        >
          <Feather name="eye" size={16} color={theme.colors.textSecondary} />
          <Typography style={styles.detailsText} weight="medium">Details</Typography>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  leftContent: {
    flexDirection: 'row',
    flex: 1,
    paddingRight: 8,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: theme.colors.primary,
    fontSize: 20,
  },
  infoBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  upi: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginLeft: 4,
  },
  rightContent: {
    alignItems: 'flex-end',
    minWidth: 90,
  },
  amount: {
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  time: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  badgeText: {
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: 6,
  },
  approveBtn: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '10',
  },
  approveText: {
    color: theme.colors.success,
    fontSize: 13,
  },
  rejectBtn: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error + '10',
  },
  rejectText: {
    color: theme.colors.error,
    fontSize: 13,
  },
  detailsBtn: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  detailsText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
});
