import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';
import { WorkerWithdrawal } from '../../hooks/useWorkerPaymentRequestsQuery';

interface WorkerPaymentRequestCardProps {
  item: WorkerWithdrawal;
  index: number;
  onPay: (item: WorkerWithdrawal) => void;
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

export const WorkerPaymentRequestCard = React.memo(({ item, index, onPay }: WorkerPaymentRequestCardProps) => {
  let statusColor = theme.colors.warning;
  let statusBg = theme.colors.warningBackground;
  let statusText = 'Pending';

  if (item.status === 'APPROVED') {
    statusColor = theme.colors.success;
    statusBg = theme.colors.successBackground;
    statusText = 'Approved';
  } else if (item.status === 'REJECTED') {
    statusColor = theme.colors.error;
    statusBg = theme.colors.error + '20';
    statusText = 'Rejected';
  } else if (item.status === 'PAID') {
    statusColor = theme.colors.primary;
    statusBg = theme.colors.primary + '20';
    statusText = 'Paid';
  }

  return (
    <Animated.View entering={FadeInUp.delay((index % 10) * 50).springify()} style={styles.card}>
      <View style={styles.topSection}>
        <View style={styles.leftContent}>
          <View style={styles.amountCircle}>
            <MaterialCommunityIcons name="send-check" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.infoBlock}>
            <Typography weight="bold" style={styles.label}>Withdrawal Request</Typography>
            <Typography style={styles.upi} numberOfLines={1}>{item.upiId}</Typography>
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
        {item.status === 'APPROVED' ? (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.payBtn]} 
            onPress={() => onPay(item)}
            accessibilityRole="button"
            accessibilityLabel="Pay now"
            hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
          >
            <Feather name="arrow-right-circle" size={16} color={theme.colors.primary} />
            <Typography style={styles.payText} weight="medium">Pay Now</Typography>
          </TouchableOpacity>
        ) : item.status === 'REJECTED' ? (
          <View style={[styles.actionBtn, styles.rejectedBtn]}>
            <Feather name="alert-circle" size={16} color={theme.colors.error} />
            <Typography style={styles.rejectedText} weight="medium">Rejected</Typography>
            {item.rejectionReason && (
              <Typography style={styles.rejectionReason} numberOfLines={1}>
                {item.rejectionReason}
              </Typography>
            )}
          </View>
        ) : (
          <View style={[styles.actionBtn, styles.infoBtn]}>
            <Feather name="clock" size={16} color={theme.colors.textSecondary} />
            <Typography style={styles.infoText} weight="medium">
              {item.status === 'PENDING' ? 'Awaiting Approval' : 'Payment Processed'}
            </Typography>
          </View>
        )}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xxl,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  amountCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  infoBlock: {
    flex: 1
  },
  label: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 2
  },
  upi: {
    fontSize: 12,
    color: theme.colors.textSecondary
  },
  rightContent: {
    alignItems: 'flex-end',
    marginLeft: 8
  },
  amount: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 4
  },
  time: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginBottom: 4
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-end'
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600'
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1
  },
  payBtn: {
    backgroundColor: theme.colors.successBackground,
    borderColor: theme.colors.success + '30'
  },
  payText: {
    color: theme.colors.success,
    fontSize: 13,
    marginLeft: 8
  },
  infoBtn: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderLight
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginLeft: 8
  },
  rejectedBtn: {
    backgroundColor: theme.colors.error + '10',
    borderColor: theme.colors.error + '30',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 12
  },
  rejectedText: {
    color: theme.colors.error,
    fontSize: 13,
    marginLeft: 8,
    marginBottom: 2
  },
  rejectionReason: {
    fontSize: 11,
    color: theme.colors.error,
    opacity: 0.7,
    marginLeft: 8,
    marginTop: 2,
    fontStyle: 'italic'
  }
});
