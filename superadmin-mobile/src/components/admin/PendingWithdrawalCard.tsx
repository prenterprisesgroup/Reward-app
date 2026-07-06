import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Typography } from '../common/Typography';
import { theme } from '../../constants/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface PendingWithdrawalItemProps {
  item: {
    id?: string;
    name: string;
    upi: string;
    amount: string;
    time: string;
    avatar: string;
  };
  index: number;
  isLast?: boolean;
  onApprove?: () => void;
}

export const PendingWithdrawalCard = React.memo(({ item, index, isLast = false, onApprove }: PendingWithdrawalItemProps) => {
  return (
    <Animated.View entering={FadeInUp.delay((index % 10) * 50).springify()}>
      <View style={styles.withdrawalRow}>
        <Image source={{ uri: item.avatar }} style={styles.withdrawalAvatar} />
        <View style={styles.withdrawalInfo}>
          <Typography weight="bold" style={styles.withdrawalName} numberOfLines={1}>{item.name}</Typography>
          <Typography style={styles.withdrawalUpi} numberOfLines={1}>UPI: {item.upi}</Typography>
        </View>
        <View style={styles.withdrawalMeta}>
          <Typography weight="bold" style={styles.withdrawalAmount}>{item.amount}</Typography>
          <Typography style={styles.withdrawalTime}>{item.time}</Typography>
        </View>
        <TouchableOpacity style={styles.approveBtn} onPress={onApprove}>
          <Feather name="check-circle" size={14} color={theme.colors.success} />
          <Typography style={styles.approveBtnText} weight="medium">Approve</Typography>
        </TouchableOpacity>
      </View>
      {!isLast && <View style={styles.divider} />}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  withdrawalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  withdrawalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  withdrawalInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  withdrawalName: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  withdrawalUpi: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  withdrawalMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 8,
  },
  withdrawalAmount: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  withdrawalTime: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.success,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  approveBtnText: {
    fontSize: 12,
    color: theme.colors.success,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 12,
  },
});
