import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';
import { formatDistanceToNow } from 'date-fns';
import { PendingWithdrawal } from '../../features/dashboard/types/dashboard.types';

interface WithdrawalListItemProps {
  withdrawal: PendingWithdrawal;
  isLast?: boolean;
  onPress?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  isProcessing?: boolean;
}

export const WithdrawalListItem = React.memo(({ withdrawal, isLast, onPress, onApprove, onReject, isProcessing }: WithdrawalListItemProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.withdrawalItem,
        isLast && { borderBottomWidth: 0 }
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.withdrawalInfo}>
        <Typography variant="body" weight="semiBold" color="textPrimary">
          {withdrawal.worker.name}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {withdrawal.companyName} • {formatDistanceToNow(withdrawal.requestDate, { addSuffix: true })}
        </Typography>
      </View>
      <View style={styles.rightContainer}>
        <View style={styles.amountContainer}>
          <Typography variant="body" weight="bold" color="textPrimary">
            ₹{withdrawal.amount}
          </Typography>
        </View>
        
        {(onApprove || onReject) && (
          <View style={styles.actionsContainer}>
            {onReject && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]} 
                onPress={onReject}
                disabled={isProcessing}
              >
                <Typography variant="caption" weight="semiBold" color="error">Reject</Typography>
              </TouchableOpacity>
            )}
            {onApprove && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.approveButton]} 
                onPress={onApprove}
                disabled={isProcessing}
              >
                <Typography variant="caption" weight="semiBold" color="white">Approve</Typography>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  withdrawalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  withdrawalInfo: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  amountContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: theme.colors.primary,
  },
  rejectButton: {
    backgroundColor: theme.colors.error + '15',
  },
});
