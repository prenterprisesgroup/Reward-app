import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface WithdrawalHistoryItemProps {
  item: any;
  isLast?: boolean;
}

export const WithdrawalHistoryItem = React.memo(({ item, isLast }: WithdrawalHistoryItemProps) => {
  
  const getStatusConfig = () => {
    switch (item.status) {
      case 'Approved':
        return { color: theme.colors.success, bg: theme.colors.successLight, icon: 'check-circle' };
      case 'Processing':
        return { color: theme.colors.primary, bg: theme.colors.primaryLight, icon: 'clock' };
      case 'Rejected':
        return { color: theme.colors.error, bg: theme.colors.errorLight, icon: 'x-circle' };
      default:
        return { color: theme.colors.textSecondary, bg: theme.colors.borderLight, icon: 'help-circle' };
    }
  };

  const config = getStatusConfig();
  const iconName = item.status === 'Processing' ? 'clock-outline' : 'bank-outline';

  return (
    <View style={[styles.container, !isLast && styles.borderBottom]}>
      {/* Icon Area */}
      <View style={[styles.iconWrapper, { backgroundColor: config.bg }]}>
        <MaterialCommunityIcons 
          name={item.status === 'Processing' ? 'clock-outline' : 'bank-outline'} 
          size={20} 
          color={config.color} 
        />
      </View>

      {/* Amount & Request Date */}
      <View style={styles.amountCol}>
        <Typography variant="subtitle" weight="bold" style={styles.amountText}>
          ₹{item.amount.toLocaleString('en-IN')}
        </Typography>
        <Typography variant="caption" style={styles.dateText}>
          Requested on {item.requestedDate}
        </Typography>
      </View>

      {/* Status Badge & Approve Date */}
      <View style={styles.statusCol}>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <Feather name={config.icon as any} size={10} color={config.color} />
          <Typography variant="caption" style={[styles.statusText, { color: config.color }]}>
            {item.status}
          </Typography>
        </View>
        <Typography variant="caption" style={styles.subText}>
          {item.status === 'Processing' ? 'Under review' : `Approved on ${item.approvedDate}`}
        </Typography>
      </View>

      {/* Paid Date & Chevron */}
      <View style={styles.paidCol}>
        <View style={styles.paidContent}>
          {item.paidDate ? (
            <>
              <Typography variant="caption" style={styles.subText}>Paid on</Typography>
              <Typography variant="caption" weight="bold" style={styles.paidDate}>{item.paidDate}</Typography>
            </>
          ) : (
            <Typography variant="caption" style={styles.emptyText}>-</Typography>
          )}
        </View>
        <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountCol: {
    flex: 1.2,
  },
  amountText: {
    color: theme.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  dateText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  statusCol: {
    flex: 1.5,
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  subText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  paidCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  paidContent: {
    alignItems: 'flex-start',
  },
  paidDate: {
    color: theme.colors.textPrimary,
  },
  emptyText: {
    color: theme.colors.textTertiary,
  }
});
